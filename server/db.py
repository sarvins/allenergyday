"""SQLite persistence for workshop group data.

Schema is intentionally flat: each row is one group's full JSON payload
(`{groupName, letter, inputs, results, savedAt}`), so the server stays
schema-agnostic when `energy.js` adds new input/result fields.
"""

from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

# Writes are serialized to avoid sqlite "database is locked" under bursts;
# reads use the same connection (WAL allows concurrent reads in practice).
_write_lock = threading.Lock()


def open_db(path: str) -> sqlite3.Connection:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, check_same_thread=False, isolation_level=None)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS groups (
          workshop_code TEXT NOT NULL,
          group_letter  TEXT NOT NULL,
          data          TEXT NOT NULL,
          updated_at    INTEGER NOT NULL,
          PRIMARY KEY (workshop_code, group_letter)
        )
        """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_groups_workshop ON groups(workshop_code)"
    )
    return conn


def get_groups(conn: sqlite3.Connection, code: str) -> dict[str, Any]:
    cur = conn.execute(
        "SELECT group_letter, data FROM groups WHERE workshop_code = ?",
        (code,),
    )
    out: dict[str, Any] = {}
    for letter, blob in cur.fetchall():
        try:
            out[letter] = json.loads(blob)
        except json.JSONDecodeError:
            continue
    return out


def upsert_group(
    conn: sqlite3.Connection, code: str, letter: str, payload: dict[str, Any]
) -> None:
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    now_ms = int(time.time() * 1000)
    with _write_lock:
        conn.execute(
            "INSERT OR REPLACE INTO groups "
            "(workshop_code, group_letter, data, updated_at) VALUES (?, ?, ?, ?)",
            (code, letter, blob, now_ms),
        )
