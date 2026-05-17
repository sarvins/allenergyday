// Unified data backend: auto-picks between the self-hosted Python/SQLite
// server (REST + SSE) and Firebase Realtime Database (legacy / GitHub Pages).
//
// Usage:
//   const backend = await AED_BACKEND.createBackend(FIREBASE_CONFIG);
//   if (!backend) { /* no persistence available; behave locally */ }
//   const off = backend.subscribe(code, (groups) => { ... });
//   await backend.save(code, letter, payload);
//   const groups = await backend.getOnce(code);
//   off();                       // unsubscribe
//
// Both adapters expose the exact same {subscribe, save, getOnce, kind} shape.

(function () {
  'use strict';

  async function probeBackend() {
    try {
      const ctl = new AbortController();
      const tid = setTimeout(() => ctl.abort(), 1500);
      const r = await fetch('/api/config', { cache: 'no-store', signal: ctl.signal });
      clearTimeout(tid);
      if (!r.ok) return null;
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return null;
      const cfg = await r.json();
      return cfg && cfg.backend === 'rest' ? 'rest' : null;
    } catch (_) {
      return null;
    }
  }

  function restAdapter() {
    const enc = encodeURIComponent;
    return {
      kind: 'rest',
      async getOnce(code) {
        const r = await fetch(`/api/workshops/${enc(code)}/groups`);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
      },
      async save(code, letter, payload) {
        const r = await fetch(
          `/api/workshops/${enc(code)}/groups/${enc(letter)}`,
          {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        if (!r.ok) throw new Error('HTTP ' + r.status);
      },
      subscribe(code, cb) {
        const url = `/api/workshops/${enc(code)}/groups/stream`;
        const es = new EventSource(url);
        es.onmessage = (ev) => {
          try { cb(JSON.parse(ev.data)); }
          catch (e) { console.warn('SSE parse failed:', e); }
        };
        // EventSource auto-reconnects on transport errors; just log.
        es.onerror = () => { /* noisy in devtools; keep silent */ };
        return () => es.close();
      },
    };
  }

  function firebaseAdapter(config) {
    if (typeof firebase === 'undefined' || !firebase.initializeApp) {
      throw new Error('Firebase SDK not loaded');
    }
    const app = firebase.apps && firebase.apps.length
      ? firebase.apps[0]
      : firebase.initializeApp(config);
    const db = firebase.database(app);
    const refFor = (code) => db.ref(`workshops/${code}/groups`);
    return {
      kind: 'firebase',
      async getOnce(code) {
        const snap = await refFor(code).once('value');
        return snap.val() || {};
      },
      async save(code, letter, payload) {
        await db.ref(`workshops/${code}/groups/${letter}`).set(payload);
      },
      subscribe(code, cb) {
        const ref = refFor(code);
        const handler = ref.on('value', (snap) => cb(snap.val() || {}));
        return () => ref.off('value', handler);
      },
    };
  }

  async function createBackend(firebaseConfigFallback) {
    if ((await probeBackend()) === 'rest') return restAdapter();
    const cfg = firebaseConfigFallback;
    if (cfg && cfg.apiKey && cfg.apiKey !== 'YOUR_API_KEY') {
      try { return firebaseAdapter(cfg); }
      catch (e) { console.warn('Firebase fallback failed:', e.message); }
    }
    return null;
  }

  window.AED_BACKEND = { createBackend };
})();
