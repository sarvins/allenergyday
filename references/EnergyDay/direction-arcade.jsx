// direction-arcade.jsx — Direction C: Game dashboard / arcade
// Big chunky blocks, oversized score badge, color-coded modules,
// "live update" feel. The student-facing version: optimistic, playful,
// still serious about the data.

const AR = {
  bg: '#0a1f1c',
  panel: '#0d4d44',           // deep teal "card"
  panelAlt: '#163a35',
  panelAmber: '#3a2614',
  ink: '#f6f4ef',
  inkDim: 'rgba(246,244,239,0.7)',
  inkFaint: 'rgba(246,244,239,0.45)',
  teal: '#22b39a',
  tealHi: '#5fe7c8',
  amber: '#f5b544',
  amberHi: '#ffd784',
  green: '#88e07a',
  red: '#ff7e5f',
  cream: '#e8e2d4',
  sans: '"Space Grotesk", -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// ---- Big chunky slider ----
function ArSlider({ label, paramKey, value, min = 0, max = 100, unit = '', accent = AR.amber }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: AR.panelAlt, borderRadius: 12, border: `1px solid rgba(255,255,255,0.06)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ font: `600 11px ${AR.sans}`, color: AR.inkDim, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</span>
          <button data-param={paramKey} style={{ all: 'unset', cursor: 'pointer' }}>
            <InfoDot size={12} color={AR.inkFaint} opacity={1} />
          </button>
        </div>
        <span style={{ font: `700 18px ${AR.sans}`, color: AR.ink, letterSpacing: -0.3 }}>
          {value}<span style={{ font: `500 11px ${AR.mono}`, color: AR.inkFaint, marginLeft: 2 }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 12 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 6 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${AR.amberHi})`, borderRadius: 6, boxShadow: `0 0 12px ${accent}50` }} />
        <div style={{ position: 'absolute', left: `calc(${pct}% - 10px)`, top: -4, width: 20, height: 20, borderRadius: 6, background: AR.cream, boxShadow: `0 2px 6px rgba(0,0,0,0.4), 0 0 0 2px ${accent}` }} />
      </div>
    </div>
  );
}

function ArSelect({ label, paramKey, value, icon, color = AR.teal }) {
  return (
    <div style={{
      padding: '12px 14px', background: AR.panelAlt, borderRadius: 12,
      border: `1px solid rgba(255,255,255,0.06)`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        borderRadius: 9, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ font: `600 10px ${AR.sans}`, color: AR.inkFaint, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</span>
          <button data-param={paramKey} style={{ all: 'unset', cursor: 'pointer' }}>
            <InfoDot size={11} color={AR.inkFaint} opacity={1} />
          </button>
        </div>
        <div style={{ font: `600 14px ${AR.sans}`, color: AR.ink, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
      <Chevron color={AR.inkDim} size={12} />
    </div>
  );
}

// ---- ARCADE score: GIANT badge with grade letter and energy ring ----
function ArScore() {
  const { label, kwh } = SAMPLE_RESULTS;
  const band = ENERGY_BANDS.find((b) => b.band === label);
  return (
    <div style={{
      position: 'relative',
      padding: '20px 22px 22px',
      background: `linear-gradient(165deg, ${band.color} 0%, ${band.color}cc 50%, #0d4d44 100%)`,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }}>
        <defs>
          <pattern id="ar-stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#0a1f1c" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ar-stripes)" />
      </svg>

      {/* Badge */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 110, height: 110, flexShrink: 0,
          borderRadius: 24,
          background: '#0a1f1c',
          border: `4px solid ${AR.cream}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 20px rgba(0,0,0,0.4), inset 0 -4px 0 rgba(0,0,0,0.4)`,
          position: 'relative',
        }}>
          <span style={{ font: `800 78px ${AR.sans}`, color: band.color, lineHeight: 1, letterSpacing: -3, textShadow: `0 0 24px ${band.color}88` }}>{label}</span>
          <div style={{ position: 'absolute', top: -10, right: -10, padding: '3px 8px', background: AR.amber, color: '#0a1f1c', font: `700 10px ${AR.mono}`, letterSpacing: 1, borderRadius: 6, transform: 'rotate(8deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
            +12
          </div>
        </div>

        <div style={{ flex: 1, color: '#0a1f1c', minWidth: 0 }}>
          <div style={{ font: `700 10px ${AR.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.7 }}>
            ENERGY SCORE · ROUND 02
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ font: `800 64px ${AR.sans}`, lineHeight: 1, letterSpacing: -2 }}>{kwh}</span>
          </div>
          <div style={{ font: `600 12px ${AR.mono}`, letterSpacing: 0.8, marginTop: -2 }}>
            kWh / m² · yr
          </div>
        </div>
      </div>

      {/* Sub-row inside badge */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ font: `600 9px ${AR.mono}`, letterSpacing: 1, color: AR.inkFaint, textTransform: 'uppercase' }}>CO₂</span>
          <span style={{ font: `700 18px ${AR.sans}`, color: AR.amber }}>{SAMPLE_RESULTS.co2}<span style={{ font: `500 9px ${AR.mono}`, color: AR.inkFaint, marginLeft: 3 }}>kg/m²</span></span>
        </div>
        <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ font: `600 9px ${AR.mono}`, letterSpacing: 1, color: AR.inkFaint, textTransform: 'uppercase' }}>VS CLASS</span>
          <span style={{ font: `700 18px ${AR.sans}`, color: AR.tealHi }}>↓ 12<span style={{ font: `500 9px ${AR.mono}`, color: AR.inkFaint, marginLeft: 3 }}>kWh</span></span>
        </div>
      </div>
    </div>
  );
}

// ---- A-G chip strip (arcade) ----
function ArBandStrip() {
  return (
    <div style={{ background: AR.panel, borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ font: `600 10px ${AR.mono}`, letterSpacing: 1, textTransform: 'uppercase', color: AR.inkFaint, marginBottom: 8 }}>
        Class ladder
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {ENERGY_BANDS.map((b) => {
          const active = b.band === SAMPLE_RESULTS.label;
          return (
            <div key={b.band} style={{
              flex: active ? 1.5 : 1,
              padding: '10px 0',
              background: active ? b.color : `${b.color}55`,
              border: active ? `2px solid ${AR.cream}` : `2px solid transparent`,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: `800 18px ${AR.sans}`,
              color: active ? '#0a1f1c' : 'rgba(0,0,0,0.5)',
              boxShadow: active ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
              position: 'relative',
              transition: 'all .3s',
            }}>
              {b.band}
              {active && <span style={{ position: 'absolute', top: -8, right: -4, font: `700 9px ${AR.mono}`, padding: '2px 5px', background: AR.amber, color: '#0a1f1c', borderRadius: 4 }}>YOU</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Building module card ----
function ArBuildingCard() {
  return (
    <div style={{
      position: 'relative',
      background: `radial-gradient(ellipse at 50% 30%, ${AR.tealHi}22 0%, transparent 60%), linear-gradient(180deg, #0d2b27 0%, ${AR.bg} 100%)`,
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 16,
      padding: 0,
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {/* Top tag */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(255,255,255,0.1)`, font: `600 10px ${AR.mono}`, letterSpacing: 1, color: AR.tealHi, textTransform: 'uppercase' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: AR.tealHi, boxShadow: `0 0 8px ${AR.tealHi}` }} />
          LIVE
        </span>
        <span style={{ font: `600 11px ${AR.sans}`, color: AR.inkDim }}>
          Atelier Block · Floor 4
        </span>
      </div>

      {/* Action chips top-right */}
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
        {['↻', '⌖', '⤢'].map((t) => (
          <span key={t} style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(255,255,255,0.08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            font: `500 14px ${AR.sans}`, color: AR.cream,
          }}>{t}</span>
        ))}
      </div>

      <div id="buildingCanvas" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BuildingAxon
          floors={6}
          highlightFloor={SAMPLE_INPUTS.floor}
          glassPct={SAMPLE_INPUTS.glassPct}
          palette={{
            sky: '#0d2b27', wall: '#dcc7a8', wallShade: '#a39072',
            roof: '#5e503f', glass: AR.tealHi, glassDim: AR.panel,
            accent: AR.amber, line: '#0a1f1c', sun: AR.amberHi,
          }}
        />
      </div>

      {/* Bottom HUD strip */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 16,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
      }}>
        {[
          { l: 'Solar gain',     v: '+18', u: 'kWh', c: AR.amber },
          { l: 'Envelope loss',  v: '−42', u: 'kWh', c: AR.red },
          { l: 'Air-tightness',  v: '0.6', u: 'ach⁻¹', c: AR.tealHi },
        ].map((s) => (
          <div key={s.l} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ font: `600 10px ${AR.mono}`, color: AR.inkFaint, letterSpacing: 0.8, textTransform: 'uppercase' }}>{s.l}</div>
            <div style={{ font: `700 18px ${AR.sans}`, color: s.c, marginTop: 2 }}>
              {s.v}<span style={{ font: `500 10px ${AR.mono}`, color: AR.inkFaint, marginLeft: 3 }}>{s.u}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Energy doughnut summary ----
function ArDoughnut() {
  const r = SAMPLE_RESULTS;
  const segs = [
    { label: 'Heating',  v: r.heating,    c: '#ff8a5b' },
    { label: 'Hot water',v: r.hotwater,   c: AR.amber },
    { label: 'Vent',     v: r.ventilation,c: AR.green },
    { label: 'Cool',     v: r.cooling,    c: AR.tealHi },
    { label: 'Appl',     v: r.appliances, c: '#9c8970' },
  ];
  const total = segs.reduce((s, x) => s + x.v, 0);
  const C = 2 * Math.PI * 36;
  let acc = 0;
  return (
    <div style={{ background: AR.panel, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ font: `600 10px ${AR.mono}`, letterSpacing: 1, textTransform: 'uppercase', color: AR.inkFaint, marginBottom: 10 }}>
        Energy use · breakdown
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ flexShrink: 0 }}>
          <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="14" />
          {segs.map((s, i) => {
            const len = (s.v / total) * C;
            const dash = `${len} ${C}`;
            const off = -acc;
            acc += len;
            return (
              <circle key={i} cx="45" cy="45" r="36" fill="none" stroke={s.c} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={off} transform="rotate(-90 45 45)" />
            );
          })}
          <text x="45" y="48" textAnchor="middle" fill={AR.ink} style={{ font: `700 18px ${AR.sans}` }}>{total}</text>
          <text x="45" y="60" textAnchor="middle" fill={AR.inkFaint} style={{ font: `500 7px ${AR.mono}`, letterSpacing: 1 }}>TOTAL</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {segs.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.c }} />
              <span style={{ flex: 1, font: `500 11px ${AR.sans}`, color: AR.inkDim }}>{s.label}</span>
              <span style={{ font: `700 12px ${AR.mono}`, color: AR.ink }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Full screen ----
function DirectionArcade() {
  return (
    <div style={{
      width: 1440, height: 900, background: AR.bg,
      color: AR.ink, font: `400 14px ${AR.sans}`,
      display: 'grid', gridTemplateRows: '60px 1fr',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', background: '#08181522',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${AR.amber}, ${AR.tealHi})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${AR.amber}40` }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14 L9 4 L15 14 Z" fill="#0a1f1c" />
                <circle cx="9" cy="11" r="1.5" fill={AR.amber} />
              </svg>
            </div>
            <div>
              <div style={{ font: `700 16px ${AR.sans}`, color: AR.cream, letterSpacing: -0.3, lineHeight: 1 }}>AllEnergyDay</div>
              <div style={{ font: `600 9px ${AR.mono}`, color: AR.inkFaint, letterSpacing: 1.5, marginTop: 1 }}>WORKSHOP · ROOM DELFT-04</div>
            </div>
          </div>

          {/* Round indicator */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
            {[1, 2, 3, 4, 5].map((r) => (
              <span key={r} style={{
                width: 22, height: 22, borderRadius: 6,
                background: r === 2 ? AR.amber : (r === 1 ? AR.green : 'rgba(255,255,255,0.06)'),
                color: r <= 2 ? '#0a1f1c' : AR.inkFaint,
                font: `700 11px ${AR.mono}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: r === 2 ? `2px solid ${AR.cream}` : 'none',
              }}>{r}</span>
            ))}
            <span style={{ font: `600 10px ${AR.mono}`, color: AR.inkFaint, marginLeft: 6, alignSelf: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>
              ROUND 2 OF 5
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: AR.panel, font: `700 11px ${AR.mono}`, color: AR.tealHi, letterSpacing: 1 }}>
            ⏱ 04:32 LEFT
          </span>
          <span style={{ padding: '6px 12px', borderRadius: 8, background: AR.panel, font: `600 12px ${AR.sans}`, color: AR.cream, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            👤 Group 03 <Chevron color={AR.inkDim} />
          </span>
          <span style={{ display: 'flex', borderRadius: 8, overflow: 'hidden' }}>
            <span style={{ padding: '6px 10px', background: AR.amber, color: '#0a1f1c', font: `700 11px ${AR.mono}` }}>EN</span>
            <span style={{ padding: '6px 10px', background: AR.panel, color: AR.inkFaint, font: `700 11px ${AR.mono}` }}>NL</span>
          </span>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: AR.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', color: AR.amber }}>☾</span>
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '320px 1fr 320px', gap: 14, padding: 14, minHeight: 0 }}>
        {/* LEFT */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
          <div style={{ font: `700 11px ${AR.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: AR.amber, padding: '4px 6px' }}>
            ▶ INPUTS
          </div>

          <ArSelect
            label="Apartment type" paramKey="apartmentType" value="Mid-floor"
            color={AR.tealHi}
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="3" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/><line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5"/></svg>}
          />
          <ArSlider label="Floor" paramKey="floor" value={SAMPLE_INPUTS.floor} min={0} max={12} accent={AR.tealHi} />
          <ArSlider label="Floor area" paramKey="size" value={SAMPLE_INPUTS.size} min={30} max={150} unit="m²" accent={AR.tealHi} />
          <ArSlider label="Glazing %" paramKey="glassPct" value={SAMPLE_INPUTS.glassPct} min={10} max={80} unit="%" accent={AR.amber} />
          <ArSelect
            label="Orientation" paramKey="orientation" value="South · 180°" color={AR.amber}
            icon={<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/><polygon points="9,3 11,9 9,8 7,9" fill="currentColor"/></svg>}
          />
          <ArSelect
            label="Ventilation" paramKey="ventilation" value="MV + Heat recovery" color={AR.green}
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 6h12M3 9h12M3 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <ArSelect
            label="Heating" paramKey="heating" value="Heat pump (air–water)" color="#ff8a5b"
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3 C 6 7, 12 8, 9 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <ArSelect
            label="Insulation" paramKey="insulation" value="Rc 4.5 (renovated)" color={AR.tealHi}
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5 Q 6 3, 9 5 T 15 5 M3 9 Q 6 7, 9 9 T 15 9 M3 13 Q 6 11, 9 13 T 15 13" stroke="currentColor" strokeWidth="1.5"/></svg>}
          />
        </section>

        {/* CENTER */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <ArBuildingCard />

          {/* Insight + power-ups */}
          <div style={{
            background: `linear-gradient(90deg, ${AR.panelAmber}, ${AR.panel})`,
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', gap: 14, alignItems: 'center',
            border: `1px solid ${AR.amber}33`,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: AR.amber, color: '#0a1f1c', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 18px ${AR.sans}`, flexShrink: 0 }}>
              !
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: `700 10px ${AR.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: AR.amber, marginBottom: 2 }}>
                INSIGHT — Try this
              </div>
              <div style={{ font: `500 13px ${AR.sans}`, color: AR.cream, lineHeight: 1.4 }}>
                {SAMPLE_RESULTS.insight}
              </div>
            </div>
            <button style={{ all: 'unset', cursor: 'pointer', padding: '8px 14px', borderRadius: 10, background: AR.amber, color: '#0a1f1c', font: `700 11px ${AR.mono}`, letterSpacing: 1 }}>
              ADD SHADE
            </button>
          </div>
        </section>

        {/* RIGHT */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, overflow: 'auto' }}>
          <ArScore />
          <ArBandStrip />
          <ArDoughnut />

          <div id="energyChart" style={{ background: AR.panel, borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: `600 10px ${AR.mono}`, letterSpacing: 1, textTransform: 'uppercase', color: AR.inkFaint, marginBottom: 8 }}>
              <span>Leaderboard preview</span>
              <span style={{ color: AR.tealHi }}>YOU · #4</span>
            </div>
            {[
              { r: 1, n: 'Atelier B', v: 52, c: AR.amber },
              { r: 2, n: 'Atelier D', v: 68, c: AR.green },
              { r: 3, n: 'Atelier A', v: 76, c: AR.tealHi },
              { r: 4, n: 'Atelier C (you)', v: 84, c: AR.cream, you: true },
            ].map((row) => (
              <div key={row.r} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 50px', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ font: `700 12px ${AR.mono}`, color: row.you ? AR.amber : AR.inkFaint }}>{row.r}</span>
                <span style={{ font: `${row.you ? 700 : 500} 12px ${AR.sans}`, color: row.you ? AR.cream : AR.inkDim }}>{row.n}</span>
                <span style={{ font: `700 13px ${AR.sans}`, color: row.c, textAlign: 'right' }}>{row.v}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

window.DirectionArcade = DirectionArcade;
window.AR = AR;
