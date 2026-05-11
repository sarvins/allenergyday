// mobile.jsx — stacked single-column layouts for the three directions.
// Mocked at 390×844 (iPhone-ish) per artboard. We do two flavors —
// HUD and Arcade — so the user can see how their system collapses.

function MobileShell({ children, theme = 'dark', bg }) {
  return (
    <div style={{
      width: 390, height: 844,
      background: bg, color: theme === 'dark' ? '#e8e2d4' : '#11201f',
      position: 'relative', overflow: 'hidden',
      borderRadius: 36,
      border: `1px solid rgba(255,255,255,0.08)`,
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    }}>
      {/* Status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', font: `600 14px -apple-system`, color: theme === 'dark' ? '#e8e2d4' : '#11201f', zIndex: 5,
      }}>
        <span>09:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{ font: `400 11px -apple-system` }}>•••</span>
          <span style={{ width: 18, height: 11, borderRadius: 2, border: '1px solid currentColor', position: 'relative' }}>
            <span style={{ position: 'absolute', inset: '1px 4px 1px 1px', background: 'currentColor', borderRadius: 1 }} />
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 100, height: 28, background: '#000', borderRadius: 16, zIndex: 6 }} />
      {/* Content */}
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function MobileHud() {
  return (
    <MobileShell bg={HUD.bg}>
      {/* Header */}
      <div style={{ padding: '16px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 28 28">
            <rect x="2" y="2" width="24" height="24" rx="3" fill={HUD.teal} />
            <path d="M9 19 L9 9 L19 9" stroke="#0a1f1c" strokeWidth="2" fill="none" />
            <path d="M9 14 L15 14" stroke="#0a1f1c" strokeWidth="2" />
          </svg>
          <span style={{ font: `700 15px ${HUD.sans}`, color: HUD.cream }}>AllEnergyDay</span>
        </div>
        <span style={{ font: `600 9px ${HUD.mono}`, padding: '4px 8px', borderRadius: 4, background: HUD.panel, color: HUD.teal, letterSpacing: 1 }}>
          ◉ DELFT-04
        </span>
      </div>

      {/* Score card (mobile) — bold, full-width */}
      <div style={{ margin: '14px 14px', padding: 16, background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 80, height: 80, flexShrink: 0,
            borderRadius: 14,
            background: ENERGY_BANDS.find(b => b.band === 'B').color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a1f1c',
          }}>
            <span style={{ font: `800 52px ${HUD.sans}`, lineHeight: 1, letterSpacing: -2 }}>B</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: `500 9px ${HUD.mono}`, letterSpacing: 1.5, color: HUD.inkFaint, textTransform: 'uppercase' }}>Energy index</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
              <span style={{ font: `700 38px ${HUD.sans}`, color: HUD.cream, lineHeight: 1, letterSpacing: -1 }}>84</span>
              <span style={{ font: `500 11px ${HUD.mono}`, color: HUD.inkDim }}>kWh/m²</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <span style={{ font: `600 10px ${HUD.mono}`, color: HUD.teal, padding: '2px 6px', background: `${HUD.teal}22`, borderRadius: 4 }}>↓ 12</span>
              <span style={{ font: `600 10px ${HUD.mono}`, color: HUD.amber, padding: '2px 6px', background: `${HUD.amber}22`, borderRadius: 4 }}>{SAMPLE_RESULTS.co2} kg CO₂</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', marginTop: 12, height: 14, borderRadius: 4, overflow: 'hidden' }}>
          {ENERGY_BANDS.map((b) => (
            <div key={b.band} style={{ flex: 1, background: b.band === 'B' ? b.color : `${b.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 8px ${HUD.sans}`, color: b.band === 'B' ? '#0a1f1c' : 'rgba(0,0,0,0.4)' }}>
              {b.band}
            </div>
          ))}
        </div>
      </div>

      {/* Building canvas — collapses to 240px tall */}
      <div style={{ margin: '0 14px', padding: 0, height: 240, borderRadius: 12, background: 'radial-gradient(ellipse at center, rgba(34,179,154,0.05), transparent 70%)', border: `1px solid ${HUD.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 8, left: 10, font: `500 9px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 1, textTransform: 'uppercase' }}>· MASSING · ROT 24°</div>
        <BuildingAxon
          floors={6} highlightFloor={4} glassPct={35} size={0.6}
          palette={{ sky: HUD.bg, wall: '#cdb89a', wallShade: '#9c8970', roof: '#5e503f', glass: HUD.teal, glassDim: HUD.tealDeep, accent: HUD.amber, line: '#0a1f1c', sun: HUD.amber }}
        />
      </div>

      {/* Inputs collapsed — horizontal pills */}
      <div style={{ margin: '14px 14px 0', padding: '12px 14px', background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 12 }}>
        <div style={{ font: `500 9px ${HUD.mono}`, letterSpacing: 1.5, color: HUD.teal, textTransform: 'uppercase', marginBottom: 8 }}>· INPUTS</div>
        {[
          { l: 'Floor', v: '4', pct: 33 },
          { l: 'Glazing', v: '35%', pct: 35 },
          { l: 'Area', v: '78 m²', pct: 50 },
        ].map((row) => (
          <div key={row.l} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 50px', gap: 8, alignItems: 'center', padding: '6px 0' }}>
            <span style={{ font: `500 11px ${HUD.mono}`, color: HUD.inkDim, letterSpacing: 0.5, textTransform: 'uppercase' }}>{row.l}</span>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${row.pct}%`, background: HUD.teal }} />
            </div>
            <span style={{ font: `600 12px ${HUD.mono}`, color: HUD.cream, textAlign: 'right' }}>{row.v}</span>
          </div>
        ))}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: 'absolute', left: 14, right: 14, bottom: 14,
        display: 'flex', borderRadius: 14, overflow: 'hidden',
        background: HUD.panel, border: `1px solid ${HUD.border}`,
      }}>
        {[
          { l: 'Inputs', i: '◫', a: false },
          { l: 'Build', i: '◐', a: true },
          { l: 'Result', i: '✦', a: false },
          { l: 'Group', i: '◉', a: false },
        ].map((t) => (
          <div key={t.l} style={{ flex: 1, padding: '10px 0', textAlign: 'center', color: t.a ? HUD.teal : HUD.inkDim }}>
            <div style={{ font: `500 16px ${HUD.sans}` }}>{t.i}</div>
            <div style={{ font: `600 10px ${HUD.mono}`, letterSpacing: 1, marginTop: 2 }}>{t.l}</div>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}

function MobileArcade() {
  return (
    <MobileShell bg={AR.bg}>
      {/* Header */}
      <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg, ${AR.amber}, ${AR.tealHi})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path d="M3 14 L9 4 L15 14 Z" fill="#0a1f1c" />
            </svg>
          </div>
          <span style={{ font: `700 15px ${AR.sans}`, color: AR.cream }}>AllEnergyDay</span>
        </div>
        <span style={{ font: `700 9px ${AR.mono}`, padding: '4px 8px', borderRadius: 4, background: AR.panel, color: AR.tealHi, letterSpacing: 1 }}>
          ⏱ 04:32
        </span>
      </div>

      {/* Round chips */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 16px 0' }}>
        {[1, 2, 3, 4, 5].map((r) => (
          <span key={r} style={{
            flex: 1, padding: '6px 0', textAlign: 'center', borderRadius: 6,
            background: r === 2 ? AR.amber : (r === 1 ? AR.green : 'rgba(255,255,255,0.06)'),
            color: r <= 2 ? '#0a1f1c' : AR.inkFaint,
            font: `700 11px ${AR.mono}`, border: r === 2 ? `2px solid ${AR.cream}` : 'none',
          }}>{r}</span>
        ))}
      </div>

      {/* Big Score */}
      <div style={{ margin: '14px 16px 0', padding: '16px 18px', borderRadius: 16, background: `linear-gradient(165deg, #5fb84a, #3a8b34)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 88, height: 88, borderRadius: 18, background: '#0a1f1c', border: `3px solid ${AR.cream}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ font: `800 60px ${AR.sans}`, color: '#5fb84a', lineHeight: 1, letterSpacing: -2 }}>B</span>
          </div>
          <div style={{ color: '#0a1f1c' }}>
            <div style={{ font: `700 9px ${AR.mono}`, letterSpacing: 1, opacity: 0.7 }}>SCORE · ROUND 02</div>
            <div style={{ font: `800 50px ${AR.sans}`, lineHeight: 1, letterSpacing: -2 }}>84</div>
            <div style={{ font: `600 10px ${AR.mono}` }}>kWh/m²·yr · ↓12</div>
          </div>
        </div>
      </div>

      {/* Building */}
      <div style={{ margin: '12px 16px 0', height: 220, borderRadius: 14, background: 'linear-gradient(180deg, #0d2b27, #0a1f1c)', border: `1px solid rgba(255,255,255,0.06)`, position: 'relative', overflow: 'hidden' }}>
        <BuildingAxon floors={6} highlightFloor={4} glassPct={35} size={0.55}
          palette={{ sky: '#0d2b27', wall: '#dcc7a8', wallShade: '#a39072', roof: '#5e503f', glass: AR.tealHi, glassDim: AR.panel, accent: AR.amber, line: '#0a1f1c', sun: AR.amberHi }}
        />
        <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { l: 'GAIN', v: '+18', c: AR.amber },
            { l: 'LOSS', v: '−42', c: AR.red },
            { l: 'ACH', v: '0.6', c: AR.tealHi },
          ].map((s) => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '6px 8px' }}>
              <div style={{ font: `600 8px ${AR.mono}`, color: AR.inkFaint, letterSpacing: 1 }}>{s.l}</div>
              <div style={{ font: `700 14px ${AR.sans}`, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Inputs as accordion summary */}
      <div style={{ margin: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { l: 'Glazing 35%', icon: '◰', c: AR.amber },
          { l: 'Heat pump', icon: '♨', c: '#ff8a5b' },
          { l: 'MV + HR', icon: '≋', c: AR.green },
        ].map((row) => (
          <div key={row.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: AR.panelAlt, borderRadius: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: 7, background: `${row.c}22`, color: row.c, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `500 14px ${AR.sans}` }}>{row.icon}</span>
            <span style={{ flex: 1, font: `600 13px ${AR.sans}`, color: AR.cream }}>{row.l}</span>
            <Chevron color={AR.inkDim} />
          </div>
        ))}
      </div>

      {/* Floating CTA */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
        <button style={{
          all: 'unset', display: 'block', width: '100%', textAlign: 'center',
          padding: '14px 0', borderRadius: 14,
          background: AR.amber, color: '#0a1f1c',
          font: `800 13px ${AR.sans}`, letterSpacing: 0.3,
          boxShadow: `0 8px 24px ${AR.amber}66`,
        }}>
          ☆ Submit round
        </button>
      </div>
    </MobileShell>
  );
}

window.MobileHud = MobileHud;
window.MobileArcade = MobileArcade;
