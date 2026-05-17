# syntax=docker/dockerfile:1.7

# --- builder: resolve deps into /app/.venv with uv ---
FROM python:3.14-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/
WORKDIR /app
ENV UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1 \
    UV_PYTHON_DOWNLOADS=never
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# --- runtime: slim image with the prebuilt venv + static frontend ---
FROM python:3.14-slim
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DB_PATH=/data/allenergyday.db

COPY server/ ./server/
COPY index.html teacher.html ./
COPY energy.js building2d.js building3d.js info-content.js data-backend.js ./
COPY files/ ./files/

VOLUME ["/data"]
EXPOSE 8000
CMD ["python", "-m", "server"]
