// direction-hud.jsx — Direction A: HUD / telemetry
// Dark, dense, monospace tickers, thin lines, color = data.
// "Engineer's cockpit" reading of the workshop tool.

const HUD = {
  // Surfaces
  bg: '#0a1f1c',
  bgDeep: '#06141. ',
  panel: '#0f2a26',
  panelHi: '#13332e',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(34,179,154,0.35)',
  // Ink
  ink: '#e8e2d4',
  inkDim: 'rgba(232,226,212,0.55)',
  inkFaint: 'rgba(232,226,212,0.32)',
  // Brand
  teal: '#22b39a',
  tealDeep: '#0d4d44',
  amber: '#f5b544',
  cream: '#e8e2d4',
  // Type
  sans: '"Space Grotesk", -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// ---- Custom slider ----
function HudSlider({ label, paramKey, value, unit = '', min = 0, max = 100 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: HUD.inkDim, font: `500 11px ${HUD.mono}`, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          <span>{label}</span>
          <button data-param={paramKey} aria-label="info" style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', color: HUD.inkFaint }}>
            <InfoDot size={12} color={HUD.inkFaint} opacity={1} />
          </button>
        </div>
        <span style={{ font: `600 13px ${HUD.mono}`, color: HUD.cream }}>
          {value}<span style={{ color: HUD.inkFaint, marginLeft: 2 }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 28 }}>
        {/* Track */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 12, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${HUD.tealDeep}, ${HUD.teal})`, borderRadius: 2 }} />
        </div>
        {/* Tick marks */}
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${i * 10}%`, top: 8, width: 1, height: 12, background: HUD.inkFaint, opacity: i % 5 === 0 ? 0.7 : 0.25 }} />
        ))}
        {/* Thumb */}
        <div style={{ position: 'absolute', left: `calc(${pct}% - 8px)`, top: 6, width: 16, height: 16, borderRadius: 4, background: HUD.cream, boxShadow: `0 0 0 2px ${HUD.teal}, 0 0 12px rgba(34,179,154,0.4)` }} />
      </div>
    </div>
  );
}

// ---- Custom dropdown ----
function HudSelect({ label, paramKey, value, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: HUD.inkDim, font: `500 11px ${HUD.mono}`, letterSpacing: 0.6, textTransform: 'uppercase' }}>
        <span>{label}</span>
        <button data-param={paramKey} style={{ all: 'unset', cursor: 'pointer', color: HUD.inkFaint }}>
          <InfoDot size={12} color={HUD.inkFaint} opacity={1} />
        </button>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: 6,
        background: HUD.panel, border: `1px solid ${HUD.border}`,
        font: `500 13px ${HUD.sans}`, color: HUD.cream,
      }}>
        <span>{value}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {hint && <span style={{ font: `500 10px ${HUD.mono}`, color: HUD.inkFaint }}>{hint}</span>}
          <Chevron color={HUD.inkDim} />
        </span>
      </div>
    </div>
  );
}

// ---- Score gauge (HUD style) ----
function HudScore() {
  const { label, kwh } = SAMPLE_RESULTS;
  // Find color
  const band = ENERGY_BANDS.find((b) => b.band === label);
  // Gauge arc
  const R = 78;
  const circ = 2 * Math.PI * R;
  // Band B is around ~70% on a "good" arc
  const fillFrac = 0.78;
  return (
    <div style={{ position: 'relative', padding: 18, background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 10 }}>
      {/* Header tape */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.inkFaint, marginBottom: 10 }}>
        <span>◉ Live · Energy index</span>
        <span style={{ color: HUD.teal }}>kWh / m² · yr</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Gauge */}
        <div style={{ position: 'relative', width: 180, height: 180, flex: '0 0 auto' }}>
          <svg viewBox="0 0 200 200" width="180" height="180">
            <defs>
              <linearGradient id="hud-gauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={band.color} stopOpacity="0.4" />
                <stop offset="1" stopColor={band.color} />
              </linearGradient>
            </defs>
            {/* Tick ring */}
            {Array.from({ length: 60 }, (_, i) => {
              const a = (-90 + i * 6) * (Math.PI / 180);
              const r1 = 92;
              const r2 = i % 5 === 0 ? 82 : 86;
              return (
                <line
                  key={i}
                  x1={100 + r1 * Math.cos(a)}
                  y1={100 + r1 * Math.sin(a)}
                  x2={100 + r2 * Math.cos(a)}
                  y2={100 + r2 * Math.sin(a)}
                  stroke={HUD.cream}
                  strokeOpacity={i % 5 === 0 ? 0.4 : 0.15}
                  strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
                />
              );
            })}
            {/* Track */}
            <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            {/* Active arc */}
            <circle
              cx="100" cy="100" r={R}
              fill="none"
              stroke="url(#hud-gauge)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${fillFrac * circ} ${circ}`}
              transform="rotate(-90 100 100)"
            />
            {/* Center letter */}
            <text x="100" y="108" textAnchor="middle" fill={HUD.cream} style={{ font: `700 64px ${HUD.sans}` }}>
              {label}
            </text>
            <text x="100" y="138" textAnchor="middle" fill={HUD.inkFaint} style={{ font: `500 9px ${HUD.mono}`, letterSpacing: 2 }}>
              CLASS
            </text>
          </svg>
        </div>

        {/* Big number */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.inkFaint }}>
            Predicted demand
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <span style={{ font: `700 56px ${HUD.sans}`, color: HUD.cream, lineHeight: 1, letterSpacing: -2 }}>{kwh}</span>
            <span style={{ font: `500 14px ${HUD.mono}`, color: HUD.inkDim }}>kWh/m²</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: band.color }} />
            <span style={{ font: `500 11px ${HUD.mono}`, color: HUD.inkDim, textTransform: 'uppercase', letterSpacing: 1 }}>
              ↓ 12 vs class avg
            </span>
          </div>
        </div>
      </div>

      {/* A–G strip */}
      <div style={{ display: 'flex', marginTop: 16, height: 22, borderRadius: 4, overflow: 'hidden' }}>
        {ENERGY_BANDS.map((b) => (
          <div key={b.band} style={{
            flex: 1, position: 'relative',
            background: b.band === label ? b.color : `${b.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ font: `700 11px ${HUD.sans}`, color: b.band === label ? '#0a1f1c' : 'rgba(0,0,0,0.5)' }}>{b.band}</span>
            {b.band === label && (
              <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${b.color}` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Stacked bar (mini chart placeholder) ----
function HudStackedBar() {
  const r = SAMPLE_RESULTS;
  const total = r.heating + r.cooling + r.ventilation + r.hotwater + r.appliances;
  const segs = [
    { label: 'Heat',  v: r.heating,    c: '#e8804a' },
    { label: 'Cool',  v: r.cooling,    c: '#22b39a' },
    { label: 'Vent',  v: r.ventilation, c: '#7ec488' },
    { label: 'DHW',   v: r.hotwater,   c: '#f5b544' },
    { label: 'Appl',  v: r.appliances, c: '#9c8970' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.inkFaint }}>
        <span>End-use breakdown</span>
        <span>{total} kWh/m²</span>
      </div>
      <div style={{ display: 'flex', height: 28, borderRadius: 4, overflow: 'hidden', border: `1px solid ${HUD.border}` }}>
        {segs.map((s) => (
          <div key={s.label} style={{ flex: s.v, background: s.c, position: 'relative' }}>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 10px ${HUD.mono}`, color: '#0a1f1c' }}>
              {s.v > 7 ? `${s.v}` : ''}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {segs.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, font: `500 10px ${HUD.mono}`, color: HUD.inkDim }}>
            <span style={{ width: 8, height: 8, background: s.c, borderRadius: 2 }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Detail row ----
function HudRow({ k, v, unit, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${HUD.border}` }}>
      <span style={{ font: `500 11px ${HUD.mono}`, color: HUD.inkDim, letterSpacing: 0.5, textTransform: 'uppercase' }}>{k}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: `600 13px ${HUD.sans}`, color: HUD.cream }}>
        {color && <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />}
        {v}<span style={{ color: HUD.inkFaint, font: `500 11px ${HUD.mono}`, marginLeft: 2 }}>{unit}</span>
      </span>
    </div>
  );
}

// ---- Full screen ----
function DirectionHUD() {
  return (
    <div id="mainScreen" style={{
      width: 1440, height: 900, background: HUD.bg,
      color: HUD.ink, font: `400 14px ${HUD.sans}`,
      display: 'grid', gridTemplateRows: '54px 1fr',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern id="hud-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hud-grid)" />
      </svg>

      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', borderBottom: `1px solid ${HUD.border}`,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo glyph */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect x="2" y="2" width="24" height="24" rx="3" fill={HUD.teal} />
              <path d="M9 19 L9 9 L19 9" stroke="#0a1f1c" strokeWidth="2" fill="none" />
              <path d="M9 14 L15 14" stroke="#0a1f1c" strokeWidth="2" />
              <circle cx="20" cy="9" r="2.5" fill={HUD.amber} />
            </svg>
            <span style={{ font: `700 17px ${HUD.sans}`, letterSpacing: -0.3, color: HUD.cream }}>
              AllEnergyDay
            </span>
          </div>
          <span style={{ font: `500 10px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            v2.6 · TU/e Sustainable Architecture
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Workshop code chip */}
          <div id="workshopCode" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 6,
            background: HUD.panel, border: `1px solid ${HUD.borderHi}`,
            font: `600 12px ${HUD.mono}`, color: HUD.teal, letterSpacing: 1.5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: HUD.teal, boxShadow: `0 0 8px ${HUD.teal}` }} />
            ROOM · DELFT-04
          </div>

          {/* Group select */}
          <div id="groupSelect" style={{
            padding: '6px 12px', borderRadius: 6,
            background: HUD.panel, border: `1px solid ${HUD.border}`,
            font: `500 12px ${HUD.sans}`, color: HUD.ink,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Group 03 · Atelier <Chevron color={HUD.inkDim} />
          </div>

          {/* Lang toggle */}
          <div id="langToggle" style={{
            display: 'flex', borderRadius: 6, overflow: 'hidden',
            border: `1px solid ${HUD.border}`, font: `600 11px ${HUD.mono}`,
          }}>
            <span style={{ padding: '6px 10px', background: HUD.teal, color: '#0a1f1c' }}>EN</span>
            <span style={{ padding: '6px 10px', color: HUD.inkDim, background: HUD.panel }}>NL</span>
          </div>

          {/* Theme toggle */}
          <div id="themeToggle" style={{
            width: 32, height: 32, borderRadius: 6,
            background: HUD.panel, border: `1px solid ${HUD.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: HUD.amber,
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.7.7 0 0 1 .7.7v1a.7.7 0 0 1-1.4 0v-1A.7.7 0 0 1 8 2zm0 9.6A3.6 3.6 0 1 1 8 4.4a3.6 3.6 0 0 1 0 7.2zm0 1.8a.7.7 0 0 1 .7.7v1a.7.7 0 0 1-1.4 0v-1a.7.7 0 0 1 .7-.7zm6-5.4a.7.7 0 0 1-.7.7h-1a.7.7 0 0 1 0-1.4h1a.7.7 0 0 1 .7.7zM3.4 8a.7.7 0 0 1-.7.7h-1a.7.7 0 0 1 0-1.4h1a.7.7 0 0 1 .7.7z" />
            </svg>
          </div>
        </div>
      </header>

      {/* Body grid: 340 / 1fr / 320 */}
      <main style={{
        display: 'grid', gridTemplateColumns: '340px 1fr 320px',
        gap: 16, padding: 16, position: 'relative', zIndex: 1, minHeight: 0,
      }}>
        {/* ===== LEFT: input controls ===== */}
        <section style={{
          background: HUD.panel, border: `1px solid ${HUD.border}`,
          borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 16,
          overflow: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: `1px solid ${HUD.border}` }}>
            <span style={{ font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.teal }}>
              · 01 Inputs
            </span>
            <span style={{ font: `500 10px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 1 }}>8 / 8 SET</span>
          </div>

          <HudSelect label="Apartment type" paramKey="apartmentType" value={SAMPLE_INPUTS.apartmentType} hint="MID-FLOOR" />
          <HudSlider label="Floor" paramKey="floor" value={SAMPLE_INPUTS.floor} min={0} max={12} unit="" />
          <HudSlider label="Floor area" paramKey="size" value={SAMPLE_INPUTS.size} min={30} max={150} unit="m²" />

          <div style={{ height: 1, background: HUD.border, margin: '4px 0' }} />

          <HudSlider label="Glazing ratio" paramKey="glassPct" value={SAMPLE_INPUTS.glassPct} min={10} max={80} unit="%" />
          <HudSelect label="Orientation" paramKey="orientation" value="South" hint="180°" />

          <div style={{ height: 1, background: HUD.border, margin: '4px 0' }} />

          <HudSelect label="Ventilation" paramKey="ventilation" value="MV + heat recovery" />
          <HudSelect label="Heating system" paramKey="heating" value="Heat pump (air)" />
          <HudSelect label="Insulation" paramKey="insulation" value="Rc 4.5 — renovated" />

          <div style={{ flex: 1 }} />

          {/* Reset */}
          <button style={{
            all: 'unset',
            padding: '10px 14px',
            borderRadius: 6,
            background: HUD.panelHi,
            border: `1px solid ${HUD.border}`,
            font: `500 11px ${HUD.mono}`,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: HUD.inkDim,
            textAlign: 'center',
            cursor: 'pointer',
          }}>
            ↺ Reset baseline
          </button>
        </section>

        {/* ===== CENTER: building + telemetry ===== */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div style={{
            position: 'relative',
            background: `radial-gradient(ellipse at center top, ${HUD.panel} 0%, ${HUD.bg} 70%)`,
            border: `1px solid ${HUD.border}`,
            borderRadius: 10, padding: 0,
            height: 600, overflow: 'hidden',
          }}>
            {/* Telemetry overlay top-left */}
            <div style={{ position: 'absolute', top: 14, left: 16, font: `500 10px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 1.5, textTransform: 'uppercase', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>· 02 Massing</span>
              <span style={{ color: HUD.teal }}>SCALE 1:200 · ROT 24°</span>
            </div>
            {/* Telemetry top-right */}
            <div style={{ position: 'absolute', top: 14, right: 16, display: 'flex', gap: 8 }}>
              {['Drag rotate', 'Scroll zoom', 'F focus'].map((t) => (
                <span key={t} style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.3)', border: `1px solid ${HUD.border}`, font: `500 10px ${HUD.mono}`, letterSpacing: 1, color: HUD.inkDim, textTransform: 'uppercase' }}>{t}</span>
              ))}
            </div>

            {/* Live data overlay bottom-left */}
            <div style={{ position: 'absolute', bottom: 14, left: 16, display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: '6px 22px', font: `500 10px ${HUD.mono}`, letterSpacing: 1, textTransform: 'uppercase' }}>
              <div style={{ color: HUD.inkFaint }}>Solar gain</div>
              <div style={{ color: HUD.inkFaint }}>Heat loss</div>
              <div style={{ color: HUD.inkFaint }}>Air-tightness</div>
              <div style={{ color: HUD.amber, font: `600 13px ${HUD.sans}` }}>+18 kWh</div>
              <div style={{ color: '#e8804a', font: `600 13px ${HUD.sans}` }}>−42 kWh</div>
              <div style={{ color: HUD.teal, font: `600 13px ${HUD.sans}` }}>0.6 ach</div>
            </div>

            {/* Live update tag */}
            <div style={{ position: 'absolute', bottom: 14, right: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 4, background: 'rgba(0,0,0,0.3)', border: `1px solid ${HUD.borderHi}`, font: `600 10px ${HUD.mono}`, color: HUD.teal, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: HUD.teal, boxShadow: `0 0 8px ${HUD.teal}` }} />
              SYNCED · 0.4s ago
            </div>

            {/* Canvas placeholder with the building drawing */}
            <div id="buildingCanvas" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BuildingAxon
                floors={6}
                highlightFloor={SAMPLE_INPUTS.floor}
                glassPct={SAMPLE_INPUTS.glassPct}
                palette={{
                  sky: HUD.bg, wall: '#cdb89a', wallShade: '#9c8970',
                  roof: '#5e503f', glass: HUD.teal, glassDim: HUD.tealDeep,
                  accent: HUD.amber, line: '#0a1f1c', sun: HUD.amber,
                }}
              />
            </div>
          </div>

          {/* Insight strip */}
          <div style={{
            background: HUD.panel, border: `1px solid ${HUD.border}`,
            borderRadius: 10, padding: '14px 18px',
            display: 'flex', gap: 14, alignItems: 'center',
          }}>
            <div style={{ width: 4, alignSelf: 'stretch', background: HUD.amber, borderRadius: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.amber, marginBottom: 4 }}>
                · INSIGHT 03/06
              </div>
              <div style={{ font: `500 13px ${HUD.sans}`, color: HUD.cream, lineHeight: 1.45 }}>
                {SAMPLE_RESULTS.insight}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} style={{ width: 14, height: 3, borderRadius: 1, background: i === 2 ? HUD.amber : HUD.border }} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== RIGHT: results ===== */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, overflow: 'auto' }}>
          <HudScore />

          {/* End-use bar */}
          <div style={{ background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 10, padding: 16 }}>
            <HudStackedBar />
          </div>

          {/* Detail */}
          <div id="energyChart" style={{ background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.inkFaint, marginBottom: 4 }}>
              · 03 Detail
            </div>
            <HudRow k="CO₂ intensity" v={SAMPLE_RESULTS.co2} unit=" kg/m²·yr" color={HUD.amber} />
            <HudRow k="Heating" v={SAMPLE_RESULTS.heating} unit=" kWh" color="#e8804a" />
            <HudRow k="Cooling" v={SAMPLE_RESULTS.cooling} unit=" kWh" color={HUD.teal} />
            <HudRow k="Ventilation" v={SAMPLE_RESULTS.ventilation} unit=" kWh" color="#7ec488" />
            <HudRow k="Hot water" v={SAMPLE_RESULTS.hotwater} unit=" kWh" color={HUD.amber} />
            <div style={{ height: 4 }} />
          </div>

          {/* Compare strip */}
          <div style={{ background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.inkFaint, marginBottom: 10 }}>
              <span>vs. Class</span><span style={{ color: HUD.teal }}>n=42</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 36, font: `500 10px ${HUD.mono}`, color: HUD.inkDim }}>YOU</span>
                <MiniBar value={84} max={150} color={HUD.teal} height={10} />
                <span style={{ width: 28, textAlign: 'right', font: `600 11px ${HUD.mono}`, color: HUD.cream }}>84</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 36, font: `500 10px ${HUD.mono}`, color: HUD.inkDim }}>AVG</span>
                <MiniBar value={96} max={150} color="#9c8970" height={10} />
                <span style={{ width: 28, textAlign: 'right', font: `600 11px ${HUD.mono}`, color: HUD.cream }}>96</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 36, font: `500 10px ${HUD.mono}`, color: HUD.inkDim }}>BEST</span>
                <MiniBar value={52} max={150} color={HUD.amber} height={10} />
                <span style={{ width: 28, textAlign: 'right', font: `600 11px ${HUD.mono}`, color: HUD.cream }}>52</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

window.DirectionHUD = DirectionHUD;
window.HUD = HUD;
