"""FastAPI app: REST + SSE backend + static file serving.

Routes:
  GET  /api/config                                 -> {"backend": "rest"}
  GET  /api/workshops/{code}/groups                -> {letter: payload, ...}
  PUT  /api/workshops/{code}/groups/{letter}       -> upsert + broadcast
  GET  /api/workshops/{code}/groups/stream         -> SSE: full snapshot on every change
  GET  /, /*.html, /*.js, /files/...               -> static frontend

Pub/sub is in-process via asyncio.Queues, keyed by workshop code.
Suitable for classroom-scale (~10s of concurrent clients per workshop).
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from . import db as dbmod

DB_PATH = os.environ.get("DB_PATH", "/data/allenergyday.db")
STATIC_DIR = os.environ.get(
    "STATIC_DIR", str(Path(__file__).resolve().parent.parent)
)

# Constrain identifiers so they map cleanly to URL paths and DB rows.
_CODE_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")
_LETTER_RE = re.compile(r"^[A-Za-z0-9]{1,8}$")

_subscribers: dict[str, set[asyncio.Queue]] = {}
_conn = None  # populated on lifespan startup


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _conn
    _conn = dbmod.open_db(DB_PATH)
    try:
        yield
    finally:
        if _conn is not None:
            _conn.close()


app = FastAPI(lifespan=lifespan, title="AllEnergyDay backend")


def _validate_code(code: str) -> str:
    code = code.lower()
    if not _CODE_RE.match(code):
        raise HTTPException(status_code=400, detail="invalid workshop code")
    return code


def _validate_letter(letter: str) -> str:
    if not _LETTER_RE.match(letter):
        raise HTTPException(status_code=400, detail="invalid group letter")
    return letter


@app.get("/api/config")
async def get_config() -> dict[str, str]:
    return {"backend": "rest"}


@app.get("/api/workshops/{code}/groups")
async def get_groups_route(code: str) -> dict[str, Any]:
    return dbmod.get_groups(_conn, _validate_code(code))


@app.put("/api/workshops/{code}/groups/{letter}")
async def put_group(code: str, letter: str, request: Request) -> dict[str, bool]:
    code = _validate_code(code)
    letter = _validate_letter(letter)
    try:
        payload = await request.json()
    except Exception as e:  # noqa: BLE001 - any JSON parse failure becomes 400
        raise HTTPException(status_code=400, detail=f"invalid JSON: {e}") from None
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="payload must be a JSON object")
    dbmod.upsert_group(_conn, code, letter, payload)
    snapshot = dbmod.get_groups(_conn, code)
    _broadcast(code, snapshot)
    return {"ok": True}


def _broadcast(code: str, snapshot: dict[str, Any]) -> None:
    for q in list(_subscribers.get(code, set())):
        try:
            q.put_nowait(snapshot)
        except asyncio.QueueFull:
            # Slow consumer: drop. They'll re-sync on their next /groups fetch.
            pass


@app.get("/api/workshops/{code}/groups/stream")
async def stream_groups(code: str, request: Request) -> StreamingResponse:
    code = _validate_code(code)

    async def event_gen():
        queue: asyncio.Queue = asyncio.Queue(maxsize=64)
        _subscribers.setdefault(code, set()).add(queue)
        try:
            snap = dbmod.get_groups(_conn, code)
            yield f"data: {json.dumps(snap)}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
        finally:
            subs = _subscribers.get(code)
            if subs is not None:
                subs.discard(queue)
                if not subs:
                    _subscribers.pop(code, None)

    return StreamingResponse(
        event_gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# Static mount must come last so the explicit /api routes above take precedence.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
