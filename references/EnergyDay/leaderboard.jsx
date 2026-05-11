// leaderboard.jsx — teacher.html aesthetic. Two flavors:
// (A) HUD scoreboard — dense, telemetry, all-groups overview
// (B) Arcade podium — top 3 elevated, big group cards, live feel

const GROUPS = [
  { rank: 1, code: 'B', name: 'Atelier Brouwer',  score: 52, dKwh: -32, label: 'A', members: 4, change: '+3' },
  { rank: 2, code: 'D', name: 'Atelier Doorn',    score: 64, dKwh: -20, label: 'A', members: 4, change: '+1' },
  { rank: 3, code: 'A', name: 'Atelier Arie',     score: 71, dKwh: -13, label: 'B', members: 4, change: '−1' },
  { rank: 4, code: 'C', name: 'Atelier Claes',    score: 84, dKwh:  0,  label: 'B', members: 4, change: '+2', you: true },
  { rank: 5, code: 'F', name: 'Atelier Floor',    score: 92, dKwh:  8,  label: 'C', members: 5, change: '−2' },
  { rank: 6, code: 'H', name: 'Atelier Hilde',    score: 104,dKwh: 20,  label: 'C', members: 4, change: '0' },
  { rank: 7, code: 'M', name: 'Atelier Mesdag',   score: 118,dKwh: 34,  label: 'D', members: 4, change: '−1' },
  { rank: 8, code: 'V', name: 'Atelier Vermeer',  score: 128,dKwh: 44,  label: 'D', members: 5, change: '+4' },
  { rank: 9, code: 'R', name: 'Atelier Rietveld', score: 142,dKwh: 58,  label: 'E', members: 4, change: '0' },
  { rank: 10,code: 'K', name: 'Atelier Koolhaas', score: 156,dKwh: 72,  label: 'E', members: 4, change: '−3' },
];

function bandColor(letter) {
  return ENERGY_BANDS.find((b) => b.band === letter)?.color || '#999';
}

// ---- HUD scoreboard ----
function LeaderboardHud() {
  return (
    <div style={{
      width: 1440, height: 900, background: HUD.bg,
      color: HUD.ink, font: `400 14px ${HUD.sans}`,
      padding: 24, position: 'relative', overflow: 'hidden',
      display: 'grid', gridTemplateRows: 'auto 1fr', gap: 18,
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern id="hud-grid-lb" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hud-grid-lb)" />
      </svg>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div>
          <div style={{ font: `500 11px ${HUD.mono}`, letterSpacing: 2.5, color: HUD.teal, textTransform: 'uppercase' }}>
            ◉ LIVE · Workshop scoreboard
          </div>
          <div style={{ font: `700 44px ${HUD.sans}`, color: HUD.cream, letterSpacing: -1, marginTop: 4, lineHeight: 1 }}>
            Atelier Energy <span style={{ color: HUD.teal }}>·</span> Round 02
          </div>
          <div style={{ font: `500 12px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 1, marginTop: 6 }}>
            ROOM DELFT-04 · 10 GROUPS · 42 STUDENTS · UPDATED 0.4s AGO
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { l: 'Avg score',  v: '96', u: 'kWh', c: HUD.cream },
            { l: 'Best',       v: '52', u: 'A',   c: bandColor('A') },
            { l: 'Improving',  v: '+6', u: 'gr.', c: HUD.teal },
          ].map((s) => (
            <div key={s.l} style={{
              background: HUD.panel, border: `1px solid ${HUD.border}`,
              borderRadius: 10, padding: '14px 18px', minWidth: 140,
            }}>
              <div style={{ font: `500 9px ${HUD.mono}`, letterSpacing: 1.5, color: HUD.inkFaint, textTransform: 'uppercase' }}>{s.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                <span style={{ font: `700 32px ${HUD.sans}`, color: s.c, lineHeight: 1, letterSpacing: -1 }}>{s.v}</span>
                <span style={{ font: `500 11px ${HUD.mono}`, color: HUD.inkFaint }}>{s.u}</span>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Body grid: chart on left, table on right */}
      <main style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr', gap: 18, minHeight: 0, position: 'relative' }}>
        {/* Distribution chart */}
        <div style={{ background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ font: `500 10px ${HUD.mono}`, letterSpacing: 2, textTransform: 'uppercase', color: HUD.inkFaint }}>· DISTRIBUTION · kWh/m²</span>
            <span style={{ font: `500 10px ${HUD.mono}`, color: HUD.teal }}>10 GROUPS</span>
          </div>

          {/* Bars */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 6, padding: '0 6px', borderBottom: `1px solid ${HUD.border}`, paddingBottom: 4 }}>
            {GROUPS.map((g) => {
              const h = (g.score / 170) * 100;
              return (
                <div key={g.code} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ font: `600 11px ${HUD.mono}`, color: g.you ? HUD.amber : HUD.inkDim }}>{g.score}</span>
                  <div style={{ width: '100%', height: `${h}%`, background: bandColor(g.label), borderRadius: '4px 4px 0 0', position: 'relative', boxShadow: g.you ? `0 0 0 2px ${HUD.amber}` : 'none' }}>
                    {g.you && (
                      <span style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', font: `700 9px ${HUD.mono}`, color: HUD.amber, letterSpacing: 1 }}>YOU</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X axis */}
          <div style={{ display: 'flex', gap: 6, padding: '6px 6px 0' }}>
            {GROUPS.map((g) => (
              <div key={g.code} style={{ flex: 1, textAlign: 'center', font: `500 10px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 0.8 }}>
                {g.code}
              </div>
            ))}
          </div>

          {/* Y reference lines */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12, font: `500 10px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 1, textTransform: 'uppercase', flexWrap: 'wrap' }}>
            {ENERGY_BANDS.map((b) => (
              <span key={b.band} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: b.color, borderRadius: 2 }} />
                {b.band} <span style={{ color: HUD.inkFaint }}>·</span> {b.range}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: HUD.panel, border: `1px solid ${HUD.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 80px 90px 100px 80px',
            padding: '12px 18px', borderBottom: `1px solid ${HUD.border}`,
            font: `500 10px ${HUD.mono}`, letterSpacing: 1.5, color: HUD.inkFaint, textTransform: 'uppercase',
          }}>
            <span>Rank</span><span>Group</span><span style={{ textAlign: 'right' }}>kWh</span><span style={{ textAlign: 'right' }}>Δ vs avg</span><span style={{ textAlign: 'center' }}>Class</span><span style={{ textAlign: 'right' }}>Move</span>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {GROUPS.map((g) => (
              <div key={g.code} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 80px 90px 100px 80px',
                padding: '12px 18px',
                alignItems: 'center',
                borderBottom: `1px solid ${HUD.border}`,
                background: g.you ? `${HUD.amber}10` : 'transparent',
                position: 'relative',
              }}>
                {g.you && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: HUD.amber }} />}
                {/* Rank */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ font: `700 18px ${HUD.sans}`, color: g.rank <= 3 ? bandColor(g.label) : HUD.inkDim, lineHeight: 1, letterSpacing: -0.5 }}>{g.rank.toString().padStart(2, '0')}</span>
                </div>
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: `${bandColor(g.label)}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 13px ${HUD.sans}`, color: bandColor(g.label) }}>{g.code}</div>
                  <div>
                    <div style={{ font: `600 13px ${HUD.sans}`, color: g.you ? HUD.cream : HUD.ink }}>{g.name}{g.you ? <span style={{ color: HUD.amber, marginLeft: 6, font: `700 10px ${HUD.mono}`, letterSpacing: 1 }}>· YOU</span> : null}</div>
                    <div style={{ font: `500 10px ${HUD.mono}`, color: HUD.inkFaint, letterSpacing: 0.5 }}>{g.members} members</div>
                  </div>
                </div>
                {/* kWh */}
                <span style={{ font: `700 16px ${HUD.sans}`, color: HUD.cream, textAlign: 'right' }}>{g.score}</span>
                {/* Delta */}
                <span style={{ font: `600 12px ${HUD.mono}`, color: g.dKwh < 0 ? HUD.teal : (g.dKwh === 0 ? HUD.inkDim : '#e8804a'), textAlign: 'right' }}>
                  {g.dKwh > 0 ? '+' : ''}{g.dKwh}
                </span>
                {/* Class chip */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', minWidth: 28, padding: '3px 8px', borderRadius: 4, background: bandColor(g.label), color: '#0a1f1c', font: `700 12px ${HUD.sans}` }}>{g.label}</span>
                </div>
                {/* Move */}
                <span style={{
                  font: `600 12px ${HUD.mono}`, textAlign: 'right',
                  color: g.change.startsWith('+') ? HUD.teal : (g.change === '0' ? HUD.inkDim : '#e8804a'),
                }}>
                  {g.change === '0' ? '—' : g.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ---- Arcade podium ----
function LeaderboardArcade() {
  const top3 = [GROUPS[1], GROUPS[0], GROUPS[2]]; // 2, 1, 3 for podium
  const rest = GROUPS.slice(3);

  return (
    <div style={{
      width: 1440, height: 900, background: AR.bg,
      color: AR.ink, font: `400 14px ${AR.sans}`,
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Confetti dots */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const x = (i * 137) % 1440;
          const y = (i * 211) % 400;
          const c = [AR.amber, AR.tealHi, AR.green, AR.red][i % 4];
          return <rect key={i} x={x} y={y} width="6" height="6" rx="1.5" fill={c} transform={`rotate(${(i * 23) % 360} ${x + 3} ${y + 3})`} />;
        })}
      </svg>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', marginBottom: 18 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 999,
            background: `${AR.tealHi}22`, border: `1px solid ${AR.tealHi}55`,
            font: `700 11px ${AR.mono}`, letterSpacing: 2, color: AR.tealHi,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: AR.tealHi, boxShadow: `0 0 8px ${AR.tealHi}` }} />
            LIVE · ROUND 02
          </div>
          <div style={{ font: `800 56px ${AR.sans}`, color: AR.cream, letterSpacing: -1.5, lineHeight: 1, marginTop: 8 }}>
            Atelier Energy<br/>
            <span style={{ color: AR.amber }}>Scoreboard</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { l: 'Avg', v: '96', c: AR.cream },
            { l: 'Best', v: '52', c: AR.amber },
            { l: 'Time', v: '04:32', c: AR.tealHi },
          ].map((s) => (
            <div key={s.l} style={{ background: AR.panel, borderRadius: 14, padding: '14px 22px', textAlign: 'center', minWidth: 110 }}>
              <div style={{ font: `700 9px ${AR.mono}`, color: AR.inkFaint, letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.l}</div>
              <div style={{ font: `800 30px ${AR.sans}`, color: s.c, lineHeight: 1, marginTop: 4, letterSpacing: -1 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 16, alignItems: 'flex-end', marginBottom: 16, position: 'relative' }}>
        {top3.map((g, i) => {
          const isFirst = g.rank === 1;
          const heights = [220, 280, 200];
          return (
            <div key={g.code} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Card */}
              <div style={{
                background: `linear-gradient(165deg, ${bandColor(g.label)}, ${bandColor(g.label)}cc, ${AR.panel})`,
                borderRadius: 16,
                padding: 20,
                position: 'relative', overflow: 'hidden',
                border: isFirst ? `3px solid ${AR.amber}` : `1px solid rgba(255,255,255,0.08)`,
                boxShadow: isFirst ? `0 0 40px ${AR.amber}55` : '0 6px 20px rgba(0,0,0,0.3)',
                height: heights[i],
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                {/* Rank badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: isFirst ? 64 : 52, height: isFirst ? 64 : 52,
                    borderRadius: '50%',
                    background: isFirst ? AR.amber : (g.rank === 2 ? '#c8c8c8' : '#cd7f32'),
                    color: '#0a1f1c',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    font: `800 ${isFirst ? 32 : 26}px ${AR.sans}`, lineHeight: 1,
                    border: `3px solid ${AR.cream}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    {g.rank}
                  </div>
                  {isFirst && <span style={{ font: `800 30px ${AR.sans}`, lineHeight: 1, color: AR.amber, filter: `drop-shadow(0 0 8px ${AR.amber})` }}>★</span>}
                </div>

                {/* Group name */}
                <div style={{ color: '#0a1f1c' }}>
                  <div style={{ font: `700 11px ${AR.mono}`, letterSpacing: 1.5, opacity: 0.65, textTransform: 'uppercase' }}>
                    {g.members} students · Class {g.label}
                  </div>
                  <div style={{ font: `800 ${isFirst ? 26 : 22}px ${AR.sans}`, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.05 }}>
                    {g.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 10 }}>
                    <span style={{ font: `800 ${isFirst ? 56 : 44}px ${AR.sans}`, lineHeight: 1, letterSpacing: -2 }}>{g.score}</span>
                    <span style={{ font: `700 12px ${AR.mono}`, opacity: 0.7 }}>kWh/m²</span>
                  </div>
                </div>
              </div>

              {/* Podium block */}
              <div style={{
                height: isFirst ? 60 : (g.rank === 2 ? 50 : 40),
                background: bandColor(g.label),
                borderRadius: '6px 6px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: `800 28px ${AR.sans}`, color: '#0a1f1c',
                position: 'relative',
                boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.3)',
              }}>
                {g.rank}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rest of leaderboard — compact rows */}
      <div style={{ background: AR.panel, borderRadius: 14, padding: 14, position: 'relative' }}>
        <div style={{ font: `700 10px ${AR.mono}`, color: AR.inkFaint, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span>Rest of the field</span>
          <span style={{ color: AR.tealHi }}>SCROLL FOR MORE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {rest.slice(0, 6).map((g) => (
            <div key={g.code} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: AR.panelAlt, borderRadius: 10,
              border: g.you ? `2px solid ${AR.amber}` : '1px solid rgba(255,255,255,0.04)',
              position: 'relative',
            }}>
              <span style={{ font: `800 22px ${AR.sans}`, color: AR.inkDim, width: 32, textAlign: 'center', letterSpacing: -0.5 }}>{g.rank}</span>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: `${bandColor(g.label)}`, color: '#0a1f1c', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 14px ${AR.sans}` }}>{g.code}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `700 13px ${AR.sans}`, color: AR.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {g.name}{g.you && <span style={{ color: AR.amber, marginLeft: 6, font: `700 10px ${AR.mono}` }}>· YOU</span>}
                </div>
                <div style={{ font: `500 10px ${AR.mono}`, color: AR.inkFaint }}>Class {g.label} · {g.members} students</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ font: `800 18px ${AR.sans}`, color: AR.cream }}>{g.score}</div>
                <div style={{ font: `700 9px ${AR.mono}`, color: g.change.startsWith('+') ? AR.tealHi : (g.change === '0' ? AR.inkFaint : AR.red), letterSpacing: 1 }}>
                  {g.change === '0' ? '—' : g.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.LeaderboardHud = LeaderboardHud;
window.LeaderboardArcade = LeaderboardArcade;
