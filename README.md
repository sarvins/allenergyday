# Energy Workshop – Appartement Simulator

Interactive web workshop for 20-25 students divided into groups, simulating the energy use of apartments.
Based on the Schiehaven Noord energy model (Excel reference).

## Files

| File | Purpose |
|---|---|
| `index.html` | Student workshop page |
| `teacher.html` | Teacher/presenter leaderboard |
| `energy.js` | Energy calculation engine (shared) |

## Quick Start (without Firebase)

Open `index.html` in a browser — it works locally without Firebase.
Groups can work independently; results won't sync across laptops automatically.
Use the teacher view to collect results manually.

---

## Full Setup: Firebase Realtime Database (enables live cross-device sync)

This is the recommended setup for the actual workshop.

### Step 1 — Create a Firebase project (free, 5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name (e.g. `energy-workshop`)
3. Disable Google Analytics (not needed) → **Create project**

### Step 2 — Enable Realtime Database

1. In the Firebase console, click **Build → Realtime Database**
2. Click **Create Database** → choose a region (Europe-West for Netherlands)
3. Start in **test mode** (allows read/write for 30 days — perfect for a workshop)

### Step 3 — Get your config

1. Click the gear icon ⚙️ → **Project settings**
2. Scroll to **Your apps** → click **</>** (Web)
3. Register the app (any name) → copy the `firebaseConfig` object

It looks like:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "energy-workshop-abc.firebaseapp.com",
  databaseURL: "https://energy-workshop-abc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "energy-workshop-abc",
  storageBucket: "energy-workshop-abc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Step 4 — Paste config into both HTML files

In **both** `index.html` and `teacher.html`, find `FIREBASE_CONFIG` near the top of the `<script>` section and replace the placeholder values:

```js
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSy...",         // ← your values here
  authDomain:        "...",
  databaseURL:       "https://...",
  ...
};
```

### Step 5 — Deploy to GitHub Pages

1. Create a GitHub repository (public)
2. Push all files: `index.html`, `teacher.html`, `energy.js`
3. In the repo → **Settings → Pages → Source: main branch / root**
4. Your URL will be: `https://YOUR-USERNAME.github.io/REPO-NAME/`

Share `index.html` URL with students, `teacher.html` URL for the teacher/projector.

---

## Workshop Flow

### Before the workshop
- Deploy to GitHub Pages (or run locally)
- Set a **workshop code** (e.g. `energy2025`) — tell students this code
- Open `teacher.html?code=energy2025` on the presenter laptop/projector
- Students open `index.html` on their laptops

### During the workshop

**Round 1 – Apartment Type & Height (20 min)**
- Focus on apartment type (gallery vs tower) and floor number
- Key insight: gallery flats have 55% less mechanical ventilation energy
- Key insight: lift energy grows linearly with floor number

**Round 2 – Systems (20 min)**
- Focus on ventilation system, heating/cooling, solar collectors, shower WTW
- Key insight: WKO heat pump (COP 6.0) vs air heat pump (COP 3.5) = 40% less electricity
- Key insight: shower WTW = -30 to -40% hot water energy

**Round 3 – Climate Stress Test (15 min)**
- Enable "Klimaatscenario 2050" toggle
- Key insight: cooling demand +40%, heating -18%
- Which designs survive? Passive House + gallery does well

**Round 4 – Compare (20 min)**
- Teacher shows `teacher.html` on projector
- Click "Vergelijk" on student page to see live leaderboard
- Discuss: what had the biggest impact?

---

## Energy Model Summary

Simplified from the Excel reference model. Key relationships preserved:

| Parameter | Effect |
|---|---|
| Gallerij apt. type | ~55% less fan energy (cross-ventilation) |
| Orientation S→N | Cooling demand ×5 difference |
| WKO vs AP heat pump | 40% less electricity for heating |
| Shower WTW (coll.) | -40% hot water energy |
| Passive House vent. | ~90% heating recovery + near-zero mech. cooling |
| Floor number +10 | Lift energy roughly doubles |
| Climate 2050 | +40% cooling, -18% heating |
| Glass 70% vs 30% | ~2× cooling demand |

---

## Technical Notes

- All calculations run client-side in JavaScript (no server needed)
- Firebase Realtime Database handles cross-device sync (free Spark plan: 1 GB storage, 10 GB/month transfer)
- Works offline in local-only mode if Firebase is not configured
- Teacher URL with code: `teacher.html?code=YOUR_WORKSHOP_CODE`
