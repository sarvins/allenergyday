// drawer-states.jsx — the slide-in info drawer in three flavors,
// shown on top of a faded version of each direction's main screen.

// We render a "behind" version of the chosen direction at reduced
// brightness, then drop the drawer on top with backdrop blur.

function DrawerHud() {
  return (
    <div style={{ width: 1440, height: 900, position: 'relative', overflow: 'hidden', background: HUD.bg }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(2px) saturate(0.7)', opacity: 0.55, transform: 'scale(1.02)' }}>
        <DirectionHUD />
      </div>
      {/* Backdrop overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at right, rgba(10,31,28,0.4), rgba(10,31,28,0.85))', backdropFilter: 'blur(2px)' }} />

      {/* Drawer */}
      <aside id="drawer" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 480,
        background: HUD.panel,
        borderLeft: `1px solid ${HUD.borderHi}`,
        boxShadow: `-30px 0 80px rgba(0,0,0,0.5)`,
        padding: '28px 32px',
        display: 'flex', flexDirection: 'column', gap: 18,
        font: `400 14px ${HUD.sans}`,
        color: HUD.ink,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: `500 10px ${HUD.mono}`, letterSpacing: 2, textTransform: 'uppercase', color: HUD.teal }}>
            · 04 LEARN MORE
          </span>
          <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: HUD.panelHi, color: HUD.inkDim, font: `400 16px ${HUD.sans}` }}>×</span>
        </div>

        <div>
          <div style={{ font: `500 11px ${HUD.mono}`, color: HUD.amber, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
            Parameter · glazing ratio
          </div>
          <div style={{ font: `700 30px ${HUD.sans}`, color: HUD.cream, letterSpacing: -0.5, lineHeight: 1.1 }}>
            How much glass should a south façade have?
          </div>
        </div>

        <div style={{ height: 1, background: HUD.border }} />

        <div style={{ font: `400 14px ${HUD.sans}`, color: HUD.inkDim, lineHeight: 1.55 }}>
          Glazing is a double-edged sword. South-facing glass collects free solar heat in winter — but those same windows leak heat at night and overheat the apartment in summer if there's no shading.
        </div>

        {/* Diagram placeholder */}
        <div style={{
          background: HUD.bg, border: `1px solid ${HUD.border}`,
          borderRadius: 8, padding: 18, height: 160, position: 'relative',
        }}>
          <svg viewBox="0 0 380 120" style={{ width: '100%', height: '100%' }}>
            {/* sun */}
            <circle cx="60" cy="30" r="14" fill={HUD.amber} />
            <text x="60" y="60" textAnchor="middle" fill={HUD.amber} style={{ font: `500 9px ${HUD.mono}`, letterSpacing: 1 }}>SUN</text>
            {/* arrows winter (low) */}
            <line x1="76" y1="38" x2="170" y2="92" stroke={HUD.amber} strokeWidth="1.5" markerEnd="url(#arr)" />
            <line x1="76" y1="42" x2="160" y2="92" stroke={HUD.amber} strokeWidth="1.5" opacity="0.6" />
            {/* building */}
            <rect x="180" y="40" width="60" height="60" fill={HUD.tealDeep} stroke={HUD.cream} strokeWidth="1" />
            <rect x="190" y="55" width="40" height="30" fill={HUD.teal} />
            {/* loss arrows out */}
            <line x1="240" y1="60" x2="320" y2="40" stroke="#e8804a" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="240" y1="80" x2="320" y2="100" stroke="#e8804a" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="350" y="50" fill="#e8804a" style={{ font: `500 9px ${HUD.mono}` }}>−42 kWh</text>
            <text x="135" y="68" fill={HUD.amber} style={{ font: `500 9px ${HUD.mono}` }}>+18 kWh</text>
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, textTransform: 'uppercase', color: HUD.inkFaint }}>
            Rule of thumb
          </div>
          {[
            ['North', '15–20%', HUD.teal],
            ['East / West', '25–30%', HUD.amber],
            ['South', '35–45% with shade', '#e8804a'],
          ].map(([dir, val, c]) => (
            <div key={dir} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: HUD.panelHi, borderRadius: 6, border: `1px solid ${HUD.border}` }}>
              <span style={{ font: `500 12px ${HUD.sans}`, color: HUD.ink }}>{dir}</span>
              <span style={{ font: `600 12px ${HUD.mono}`, color: c }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button style={{
          all: 'unset', textAlign: 'center', padding: '12px 16px',
          borderRadius: 6, background: HUD.teal, color: '#0a1f1c',
          font: `700 12px ${HUD.mono}`, letterSpacing: 1.5,
        }}>
          GOT IT — TRY 35% →
        </button>
      </aside>
    </div>
  );
}

function DrawerArcade() {
  return (
    <div style={{ width: 1440, height: 900, position: 'relative', overflow: 'hidden', background: AR.bg }}>
      <div style={{ position: 'absolute', inset: 0, filter: 'blur(3px) brightness(0.5)', transform: 'scale(1.02)' }}>
        <DirectionArcade />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,31,28,0.6)', backdropFilter: 'blur(4px)' }} />

      {/* Drawer  */}
      <aside style={{
        position: 'absolute', top: 14, right: 14, bottom: 14, width: 460,
        background: AR.panel,
        borderRadius: 18,
        border: `1px solid rgba(255,255,255,0.1)`,
        boxShadow: `-20px 20px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
        padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: 16,
        color: AR.ink, font: `400 14px ${AR.sans}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 10px', borderRadius: 999,
            background: `${AR.amber}22`, border: `1px solid ${AR.amber}55`,
            font: `700 10px ${AR.mono}`, letterSpacing: 1.5, color: AR.amber,
          }}>
            ★ POWER-UP
          </div>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: AR.panelAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `400 18px ${AR.sans}`, color: AR.inkDim }}>×</span>
        </div>

        <div>
          <div style={{ font: `700 11px ${AR.mono}`, color: AR.tealHi, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
            Glazing ratio
          </div>
          <div style={{ font: `800 36px ${AR.sans}`, color: AR.cream, letterSpacing: -0.8, lineHeight: 1.05 }}>
            Glass = solar gain<br/>+ heat loss.
          </div>
        </div>

        <div style={{ font: `500 14px ${AR.sans}`, color: AR.inkDim, lineHeight: 1.55 }}>
          More glass means more free heat in winter — but it also leaks at night. South-facing glazing only pays off when paired with external shading for summer.
        </div>

        {/* Visual */}
        <div style={{
          background: AR.panelAlt, borderRadius: 14, padding: 20, position: 'relative',
          height: 180, overflow: 'hidden',
        }}>
          <svg viewBox="0 0 400 140" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="36" r="18" fill={AR.amber} opacity="0.9" />
            <circle cx="50" cy="36" r="28" fill="none" stroke={AR.amber} strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
            <line x1="68" y1="46" x2="180" y2="100" stroke={AR.amber} strokeWidth="3" strokeLinecap="round" />
            <line x1="64" y1="50" x2="170" y2="105" stroke={AR.amber} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <rect x="200" y="50" width="80" height="70" fill={AR.tealHi} opacity="0.2" />
            <rect x="200" y="50" width="80" height="70" fill="none" stroke={AR.cream} strokeWidth="2" />
            <rect x="210" y="60" width="60" height="40" fill={AR.tealHi} />
            <line x1="280" y1="70" x2="370" y2="50" stroke={AR.red} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
            <line x1="280" y1="100" x2="370" y2="120" stroke={AR.red} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4" />
          </svg>
          <div style={{ position: 'absolute', left: 20, bottom: 12, font: `700 11px ${AR.mono}`, color: AR.amber }}>+18 kWh GAIN</div>
          <div style={{ position: 'absolute', right: 20, bottom: 12, font: `700 11px ${AR.mono}`, color: AR.red }}>−42 kWh LOSS</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            ['N', '15–20%', AR.tealHi],
            ['E/W', '25–30%', AR.amber],
            ['S', '35–45%', AR.red],
          ].map(([d, v, c]) => (
            <div key={d} style={{ padding: '12px 10px', background: AR.panelAlt, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ font: `800 22px ${AR.sans}`, color: c }}>{d}</div>
              <div style={{ font: `700 11px ${AR.mono}`, color: AR.inkFaint, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button style={{
          all: 'unset', textAlign: 'center', padding: '14px 16px',
          borderRadius: 12, background: AR.amber, color: '#0a1f1c',
          font: `800 13px ${AR.sans}`, letterSpacing: 0.3,
          boxShadow: `0 6px 18px ${AR.amber}55`,
        }}>
          Try it →
        </button>
      </aside>
    </div>
  );
}

window.DrawerHud = DrawerHud;
window.DrawerArcade = DrawerArcade;
