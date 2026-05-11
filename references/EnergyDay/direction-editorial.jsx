// direction-editorial.jsx — Direction B: Editorial / scientific
// A "museum-grade" information design read of the workshop tool.
// Generous whitespace, large serif numerals, hairline rules,
// soft cream surface in light mode (we render the dark variant here
// for parity with A & C — same aesthetic, dark paper).

const ED = {
  bg: '#11201f',           // deep teal-ink
  panel: 'rgba(255,255,255,0.025)',
  panelHi: 'rgba(255,255,255,0.05)',
  rule: 'rgba(255,255,255,0.10)',
  ruleHi: 'rgba(232,226,212,0.20)',
  ink: '#e8e2d4',
  inkDim: 'rgba(232,226,212,0.62)',
  inkFaint: 'rgba(232,226,212,0.40)',
  teal: '#22b39a',
  tealDeep: '#0d4d44',
  amber: '#f5b544',
  green: '#7ec488',
  display: '"Fraunces", "Instrument Serif", Georgia, serif',
  sans: '"Inter Tight", -apple-system, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// ---- Slider with track fill + value as serif number above ----
function EdSlider({ label, paramKey, value, min = 0, max = 100, unit = '' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 18, borderBottom: `1px solid ${ED.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ font: `500 13px ${ED.sans}`, color: ED.ink, letterSpacing: -0.1 }}>{label}</span>
          <button data-param={paramKey} style={{ all: 'unset', cursor: 'pointer' }}>
            <InfoDot size={13} color={ED.inkFaint} opacity={1} />
          </button>
        </div>
        <span style={{ font: `400 24px ${ED.display}`, color: ED.ink, fontStyle: 'italic' }}>
          {value}
          <span style={{ font: `500 11px ${ED.mono}`, color: ED.inkFaint, marginLeft: 4, fontStyle: 'normal' }}>{unit}</span>
        </span>
      </div>
      <div style={{ position: 'relative', height: 6 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: ED.teal, borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: `calc(${pct}% - 9px)`, top: -7, width: 18, height: 18, borderRadius: 999, background: ED.ink, border: `2px solid ${ED.teal}` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 10px ${ED.mono}`, color: ED.inkFaint, letterSpacing: 0.5 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function EdSelect({ label, paramKey, value, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 16, borderBottom: `1px solid ${ED.rule}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ font: `500 13px ${ED.sans}`, color: ED.ink }}>{label}</span>
        <button data-param={paramKey} style={{ all: 'unset', cursor: 'pointer' }}>
          <InfoDot size={13} color={ED.inkFaint} opacity={1} />
        </button>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        font: `400 18px ${ED.display}`, color: ED.ink, fontStyle: 'italic',
      }}>
        <span>{value}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontStyle: 'normal', font: `500 11px ${ED.mono}`, color: ED.inkFaint }}>
          {hint}
          <Chevron color={ED.inkFaint} />
        </span>
      </div>
    </div>
  );
}

// ---- Score card: editorial style, big serif kWh figure, A–G label as chip ----
function EdScore() {
  const { label, kwh } = SAMPLE_RESULTS;
  const band = ENERGY_BANDS.find((b) => b.band === label);
  return (
    <div style={{
      padding: '24px 24px 20px',
      borderTop: `1px solid ${ED.ruleHi}`,
      borderBottom: `1px solid ${ED.ruleHi}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ font: `500 10px ${ED.mono}`, letterSpacing: 2, textTransform: 'uppercase', color: ED.inkFaint }}>
          Energy index — Result
        </span>
        <span style={{ font: `400 12px ${ED.display}`, fontStyle: 'italic', color: ED.inkDim }}>fig. 01</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
        <div style={{
          width: 86, height: 110,
          background: band.color,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6,
          color: '#11201f',
          flexShrink: 0,
          position: 'relative',
        }}>
          <span style={{ font: `400 64px ${ED.display}`, lineHeight: 1, letterSpacing: -2 }}>{label}</span>
          <span style={{ font: `600 9px ${ED.mono}`, letterSpacing: 2, marginTop: 4 }}>CLASS</span>
        </div>

        <div style={{ flex: 1, paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, lineHeight: 1 }}>
            <span style={{ font: `400 84px ${ED.display}`, color: ED.ink, letterSpacing: -3 }}>{kwh}</span>
            <span style={{ font: `400 18px ${ED.display}`, color: ED.inkDim, fontStyle: 'italic' }}>·</span>
          </div>
          <div style={{ font: `500 12px ${ED.mono}`, color: ED.inkDim, letterSpacing: 1, marginTop: -4 }}>
            kWh / m² · year
          </div>
        </div>
      </div>

      {/* A–G strip: tasteful, with marker */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden' }}>
          {ENERGY_BANDS.map((b) => (
            <div key={b.band} style={{ flex: 1, background: b.band === label ? b.color : `${b.color}40` }} />
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 6 }}>
          {ENERGY_BANDS.map((b) => (
            <div key={b.band} style={{ flex: 1, textAlign: 'center', font: `500 10px ${ED.mono}`, color: b.band === label ? ED.ink : ED.inkFaint }}>
              {b.band}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18, paddingTop: 14, borderTop: `1px solid ${ED.rule}` }}>
        <span style={{ font: `500 11px ${ED.mono}`, color: ED.inkFaint, letterSpacing: 1, textTransform: 'uppercase' }}>
          CO₂ intensity
        </span>
        <span style={{ font: `400 22px ${ED.display}`, color: ED.amber, fontStyle: 'italic' }}>
          {SAMPLE_RESULTS.co2}
          <span style={{ font: `500 10px ${ED.mono}`, fontStyle: 'normal', marginLeft: 3 }}>kg/m²·yr</span>
        </span>
      </div>
    </div>
  );
}

// ---- Stacked breakdown table ----
function EdBreakdown() {
  const r = SAMPLE_RESULTS;
  const total = r.heating + r.cooling + r.ventilation + r.hotwater + r.appliances;
  const rows = [
    { k: 'Heating',     v: r.heating,    c: '#e8804a' },
    { k: 'Cooling',     v: r.cooling,    c: ED.teal },
    { k: 'Ventilation', v: r.ventilation, c: ED.green },
    { k: 'Hot water',   v: r.hotwater,   c: ED.amber },
    { k: 'Appliances',  v: r.appliances, c: '#9c8970' },
  ];
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span style={{ font: `500 10px ${ED.mono}`, letterSpacing: 2, textTransform: 'uppercase', color: ED.inkFaint }}>
          End-use composition
        </span>
        <span style={{ font: `400 12px ${ED.display}`, fontStyle: 'italic', color: ED.inkDim }}>fig. 02</span>
      </div>

      {rows.map((row) => {
        const pct = (row.v / total) * 100;
        return (
          <div key={row.k} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 60px 50px', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${ED.rule}` }}>
            <span style={{ font: `500 13px ${ED.sans}`, color: ED.ink }}>{row.k}</span>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: row.c }} />
            </div>
            <span style={{ font: `400 16px ${ED.display}`, color: ED.ink, textAlign: 'right' }}>{row.v}</span>
            <span style={{ font: `500 10px ${ED.mono}`, color: ED.inkFaint, textAlign: 'right' }}>{Math.round(pct)}%</span>
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 8, borderTop: `1px solid ${ED.ruleHi}` }}>
        <span style={{ font: `500 11px ${ED.mono}`, color: ED.inkDim, letterSpacing: 1, textTransform: 'uppercase' }}>Total</span>
        <span style={{ font: `400 18px ${ED.display}`, color: ED.ink, fontStyle: 'italic' }}>
          {total}
          <span style={{ font: `500 10px ${ED.mono}`, color: ED.inkFaint, fontStyle: 'normal', marginLeft: 4 }}>kWh/m²·yr</span>
        </span>
      </div>
    </div>
  );
}

// ---- Full screen ----
function DirectionEditorial() {
  return (
    <div style={{
      width: 1440, height: 900,
      background: ED.bg,
      color: ED.ink,
      font: `400 14px ${ED.sans}`,
      display: 'grid',
      gridTemplateRows: '64px 1fr',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', borderBottom: `1px solid ${ED.rule}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Editorial logomark */}
            <svg width="34" height="34" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="16" fill="none" stroke={ED.teal} strokeWidth="1.5" />
              <text x="17" y="22" textAnchor="middle" fill={ED.ink} style={{ font: `400 16px ${ED.display}`, fontStyle: 'italic' }}>Æ</text>
            </svg>
            <div>
              <div style={{ font: `400 22px ${ED.display}`, color: ED.ink, lineHeight: 1, letterSpacing: -0.5 }}>
                <span style={{ fontStyle: 'italic' }}>All</span>EnergyDay
              </div>
              <div style={{ font: `500 10px ${ED.mono}`, letterSpacing: 1.5, color: ED.inkFaint, marginTop: 2 }}>
                A WORKSHOP IN BUILDING PHYSICS · ED. 26
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ font: `400 13px ${ED.display}`, fontStyle: 'italic', color: ED.inkDim }}>
            Group <span style={{ color: ED.ink, fontStyle: 'normal' }}>03</span> · Atelier
          </span>
          <span style={{ width: 1, height: 18, background: ED.rule }} />
          <div style={{ display: 'flex', font: `500 11px ${ED.mono}`, gap: 8, letterSpacing: 1 }}>
            <span style={{ color: ED.teal }}>EN</span>
            <span style={{ color: ED.inkFaint }}>·</span>
            <span style={{ color: ED.inkFaint }}>NL</span>
          </div>
          <span style={{ width: 1, height: 18, background: ED.rule }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: `500 11px ${ED.mono}`, color: ED.amber, letterSpacing: 1 }}>
            ☀ Light
          </span>
        </div>
      </header>

      {/* Body */}
      <main style={{ display: 'grid', gridTemplateColumns: '340px 1fr 360px', minHeight: 0 }}>
        {/* LEFT — Inputs as a "form" with tasteful section labels */}
        <section style={{
          padding: '28px 28px 32px',
          borderRight: `1px solid ${ED.rule}`,
          overflow: 'auto',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div>
            <div style={{ font: `500 10px ${ED.mono}`, letterSpacing: 2, color: ED.teal }}>§ I.</div>
            <div style={{ font: `400 22px ${ED.display}`, color: ED.ink, lineHeight: 1.1, marginTop: 4 }}>
              The dwelling
            </div>
          </div>

          <EdSelect label="Apartment type" paramKey="apartmentType" value="Mid-floor" />
          <EdSlider label="Floor" paramKey="floor" value={SAMPLE_INPUTS.floor} min={0} max={12} />
          <EdSlider label="Floor area" paramKey="size" value={SAMPLE_INPUTS.size} min={30} max={150} unit="m²" />

          <div style={{ marginTop: 8 }}>
            <div style={{ font: `500 10px ${ED.mono}`, letterSpacing: 2, color: ED.teal }}>§ II.</div>
            <div style={{ font: `400 22px ${ED.display}`, color: ED.ink, lineHeight: 1.1, marginTop: 4 }}>
              Façade & orientation
            </div>
          </div>

          <EdSlider label="Glazing ratio" paramKey="glassPct" value={SAMPLE_INPUTS.glassPct} min={10} max={80} unit="%" />
          <EdSelect label="Orientation" paramKey="orientation" value="South" hint="180°" />

          <div style={{ marginTop: 8 }}>
            <div style={{ font: `500 10px ${ED.mono}`, letterSpacing: 2, color: ED.teal }}>§ III.</div>
            <div style={{ font: `400 22px ${ED.display}`, color: ED.ink, lineHeight: 1.1, marginTop: 4 }}>
              Systems
            </div>
          </div>

          <EdSelect label="Ventilation" paramKey="ventilation" value="MV + HR" />
          <EdSelect label="Heating" paramKey="heating" value="Heat pump" />
          <EdSelect label="Insulation" paramKey="insulation" value="Rc 4.5" />
        </section>

        {/* CENTER — A "plate": large image, captioned */}
        <section style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ font: `500 10px ${ED.mono}`, letterSpacing: 2, color: ED.amber, textTransform: 'uppercase' }}>
                Plate I
              </div>
              <div style={{ font: `400 30px ${ED.display}`, color: ED.ink, marginTop: 4, letterSpacing: -0.5 }}>
                Massing study, <span style={{ fontStyle: 'italic' }}>floor 4</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['rotate', 'pan', 'reset'].map((t, i) => (
                <span key={t} style={{
                  padding: '6px 12px', borderRadius: 999,
                  border: `1px solid ${ED.rule}`, font: `500 10px ${ED.mono}`,
                  letterSpacing: 1, color: i === 0 ? ED.ink : ED.inkDim, textTransform: 'uppercase',
                  background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                }}>{t}</span>
              ))}
            </div>
          </div>

          <div id="buildingCanvas" style={{
            flex: 1,
            background: `radial-gradient(ellipse at 50% 35%, rgba(34,179,154,0.08) 0%, transparent 60%), ${ED.bg}`,
            border: `1px solid ${ED.rule}`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            minHeight: 0,
          }}>
            {/* Scale ruler */}
            <div style={{ position: 'absolute', left: 18, bottom: 18, font: `500 10px ${ED.mono}`, color: ED.inkFaint, letterSpacing: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 60, height: 1, background: ED.inkFaint }} />
                <span>5 m</span>
              </div>
            </div>
            <div style={{ position: 'absolute', right: 18, top: 18, font: `400 12px ${ED.display}`, color: ED.inkDim, fontStyle: 'italic' }}>
              <span style={{ color: ED.amber }}>↑</span> N · 24° rotation
            </div>
            <BuildingAxon
              floors={6}
              highlightFloor={SAMPLE_INPUTS.floor}
              glassPct={SAMPLE_INPUTS.glassPct}
              palette={{
                sky: ED.bg, wall: '#dcc7a8', wallShade: '#a39072',
                roof: '#5e503f', glass: ED.teal, glassDim: ED.tealDeep,
                accent: ED.amber, line: '#0a1f1c', sun: ED.amber,
              }}
            />
          </div>

          {/* Caption */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'flex-start' }}>
            <div>
              <div style={{ font: `400 12px ${ED.display}`, fontStyle: 'italic', color: ED.amber, marginBottom: 4 }}>
                Observation
              </div>
              <div style={{ font: `400 15px ${ED.display}`, color: ED.ink, lineHeight: 1.45, fontStyle: 'italic' }}>
                "{SAMPLE_RESULTS.insight}"
              </div>
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: ED.rule }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 11px ${ED.mono}`, color: ED.inkDim }}>
                <span>Solar gain</span>
                <span style={{ color: ED.amber }}>+18 kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 11px ${ED.mono}`, color: ED.inkDim }}>
                <span>Envelope loss</span>
                <span style={{ color: '#e8804a' }}>−42 kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 11px ${ED.mono}`, color: ED.inkDim }}>
                <span>Air-tightness</span>
                <span style={{ color: ED.teal }}>0.6 ach⁻¹</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — Results stacked like a printed plate's facing margin */}
        <aside style={{ borderLeft: `1px solid ${ED.rule}`, overflow: 'auto', minWidth: 0 }}>
          <EdScore />
          <EdBreakdown />

          <div style={{ padding: '20px 24px', borderTop: `1px solid ${ED.rule}` }}>
            <div style={{ font: `500 10px ${ED.mono}`, letterSpacing: 2, textTransform: 'uppercase', color: ED.inkFaint, marginBottom: 12 }}>
              Comparative — class of 42
            </div>
            {[
              { l: 'Yours',  v: 84, c: ED.teal },
              { l: 'Median', v: 96, c: '#9c8970' },
              { l: 'Best',   v: 52, c: ED.amber },
            ].map((row) => (
              <div key={row.l} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 50px', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ font: `500 11px ${ED.mono}`, color: ED.inkDim, letterSpacing: 0.8, textTransform: 'uppercase' }}>{row.l}</span>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(row.v / 150) * 100}%`, background: row.c }} />
                </div>
                <span style={{ font: `400 16px ${ED.display}`, color: ED.ink, textAlign: 'right' }}>{row.v}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

window.DirectionEditorial = DirectionEditorial;
window.ED = ED;
