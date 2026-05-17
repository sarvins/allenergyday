# AllEnergyDay — Apartment Energy Simulator

An interactive workshop tool for architecture students to explore the energy performance of apartment buildings. Groups design a building by adjusting parameters (apartment type, orientation, insulation, ventilation, heating system) and see the effect on energy use in real time.

**Live:** https://sarvins.github.io/allenergyday/
**Teacher dashboard:** https://sarvins.github.io/allenergyday/teacher.html

Developed for the TU Delft All Energy Day workshop. Based on the Schiehaven Noord energy reference model.

---

## How it works

- Students open `index.html` on their laptops, enter a shared workshop code and group letter (A–F)
- Each group adjusts sliders and sees live energy breakdowns (heating, cooling, ventilation, hot water, etc.)
- The teacher opens `teacher.html` on a projector, enters the same workshop code, and sees a live leaderboard of all groups
- Cross-device sync uses either a self-hosted Python + SQLite backend (recommended for offline / private classrooms) or Firebase Realtime Database (recommended for GitHub Pages). The frontend auto-detects which one is available

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Student page |
| `teacher.html` | Teacher leaderboard / projector view |
| `energy.js` | Energy calculation engine |
| `building2d.js` | 2D building renderer |
| `building3d.js` | 3D building renderer |
| `info-content.js` | Tooltip and info panel content |
| `data-backend.js` | Frontend data layer — auto-picks REST/SSE vs Firebase |
| `server/` | Python backend (FastAPI + SQLite + SSE) |
| `pyproject.toml`, `uv.lock` | Backend dependencies (managed with [uv](https://docs.astral.sh/uv/)) |
| `Dockerfile` | Self-contained image: Python server + static frontend + SQLite |

---

## Deployment options

| Mode | Persistence | When to use |
|---|---|---|
| **No backend** | Browser only | Quick demo, no sync between devices |
| **Self-hosted (Docker)** | SQLite on a mounted volume | Classroom, lab, or any private server. No external services |
| **Firebase (GitHub Pages)** | Firebase Realtime Database | Public deploy where you don't want to host anything |

The frontend probes `/api/config` on load. If the Python backend answers, it uses REST + SSE. Otherwise it falls back to `FIREBASE_CONFIG`. So the same `index.html` / `teacher.html` work in all three modes without edits.

---

## Run locally (self-hosted backend)

Requirements: Python 3.14 and [uv](https://docs.astral.sh/uv/getting-started/installation/).

```bash
uv sync                     # creates .venv and installs deps from uv.lock
DB_PATH=./data/dev.db uv run python -m server
```

Then open http://localhost:8000/ (student) or http://localhost:8000/teacher.html (teacher).

Env vars:
- `PORT` — listening port (default `8000`)
- `HOST` — bind address (default `0.0.0.0`)
- `DB_PATH` — SQLite file path (default `/data/allenergyday.db`)
- `STATIC_DIR` — directory containing the HTML/JS (default: project root)

---

## Deploy with Docker

```bash
docker build -t allenergyday .
docker run -d --name allenergyday \
  -p 8000:8000 \
  -v "$(pwd)/data:/data" \
  --restart unless-stopped \
  allenergyday
```

The SQLite database lives at `/data/allenergyday.db` inside the container; mount any host directory at `/data` to make it persistent across container restarts.

Behind a reverse proxy (nginx, Caddy, Traefik), make sure the `/api/workshops/{code}/groups/stream` endpoint is **not buffered** — it's a long-lived SSE stream. The server already sets `Cache-Control: no-cache` and `X-Accel-Buffering: no`; for nginx also add `proxy_buffering off;` and `proxy_read_timeout 1h;` on that location.

Backup is a single file copy:

```bash
sqlite3 ./data/allenergyday.db ".backup ./backups/$(date +%F).db"
```

---

## Deploy to GitHub Pages (Firebase mode)

Use this if you want to host on GitHub Pages (or any static host) instead of running the Python backend. The free Spark plan is sufficient (100 simultaneous connections, 1 GB storage).

**Step 1 — Create a Firebase project**
1. Go to https://console.firebase.google.com
2. Click **Add project**, give it a name, disable Google Analytics
3. Click **Create project**

**Step 2 — Enable Realtime Database**
1. In the left menu, find **Realtime Database** (under Build or All products)
2. Click **Create database** → region: **Europe (europe-west1)** → **Start in test mode**
3. Click **Enable**

**Step 3 — Register your web app and get the config**
1. Click the gear icon ⚙️ → **Project settings**
2. Scroll to **Your apps** → click **</>** (Web)
3. Give it a nickname, click **Register app**
4. Copy the config values shown (apiKey, authDomain, databaseURL, etc.)

**Step 4 — Add config to the HTML files**

In both `index.html` and `teacher.html`, find `FIREBASE_CONFIG` and replace the placeholder values with your real ones:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",
  authDomain:        "your-project.firebaseapp.com",
  databaseURL:       "https://your-project-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef"
};
```

**Step 5 — Publish on GitHub Pages**
1. Push all files to a public GitHub repository
2. Go to **Settings → Pages → Source: main branch / root**
3. Your app will be live at `https://YOUR-USERNAME.github.io/REPO-NAME/`

Since `/api/config` does not exist on Pages, the frontend automatically falls back to Firebase.

---

## Workshop flow

**Before the session**
- Decide on a workshop code (e.g. `energy2025`) and share it with students
- Open `teacher.html` on the projector, enter the code and click Connect
- Students open `index.html`, enter the same code and their group letter

**During the session**
- Groups explore different design choices across multiple rounds
- The teacher dashboard updates live as groups save their designs
- Use the leaderboard to trigger discussion: what had the biggest impact?

---

## Energy model

All calculations run client-side in JavaScript. Key relationships from the reference model:

| Parameter | Effect |
|---|---|
| Gallery vs tower | ~55% less fan energy (cross-ventilation) |
| Orientation S → N | Cooling demand up to ×5 difference |
| WKO vs air heat pump | ~40% less electricity for heating |
| Shower heat recovery | −30 to −40% hot water energy |
| Passive House ventilation | ~90% heat recovery, near-zero cooling |
| Floor +10 levels | Lift energy roughly doubles |
| Climate scenario 2050 | +40% cooling, −18% heating |
| Glass ratio 70% vs 30% | ~2× cooling demand |
