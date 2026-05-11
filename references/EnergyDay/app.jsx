// app.jsx — entrypoint. Lays out all directions on a Design Canvas
// so the user can compare side-by-side, pick a winner, and we'll then
// build the production HTML/CSS from the chosen direction.

const { DesignCanvas, DCSection, DCArtboard, DCPostIt } = window;

function Intro() {
  return (
    <div style={{
      maxWidth: 920, margin: '40px auto 0', padding: '0 32px',
      font: `400 16px "Inter Tight", -apple-system, sans-serif`,
      color: '#3a342a',
    }}>
      <div style={{ font: `500 11px "JetBrains Mono", ui-monospace, monospace`, letterSpacing: 2, color: '#7a6850', textTransform: 'uppercase', marginBottom: 8 }}>
        AllEnergyDay · Visual mockup · v1
      </div>
      <h1 style={{ font: `400 44px "Fraunces", Georgia, serif`, letterSpacing: -0.8, margin: '0 0 14px', lineHeight: 1.05, color: '#1a1814' }}>
        Three directions for the workshop redesign.
      </h1>
      <p style={{ font: `400 17px "Fraunces", Georgia, serif`, color: '#5a4a3a', lineHeight: 1.5, fontStyle: 'italic', maxWidth: 720 }}>
        Same content, three feels — pick a direction (or mix and match) and I'll produce the production HTML/CSS for <code style={{ font: `500 14px "JetBrains Mono", monospace`, background: '#fff', padding: '2px 6px', borderRadius: 4 }}>index.html</code> + <code style={{ font: `500 14px "JetBrains Mono", monospace`, background: '#fff', padding: '2px 6px', borderRadius: 4 }}>teacher.html</code> with all your existing JS hooks intact.
      </p>

      <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap', font: `500 13px "Inter Tight", sans-serif` }}>
        {[
          { c: '#0a1f1c', t: 'A · HUD / Telemetry', s: 'dense, monospace, cockpit' },
          { c: '#11201f', t: 'B · Editorial / Scientific', s: 'serif, museum-grade' },
          { c: '#0d4d44', t: 'C · Game dashboard', s: 'big blocks, score reveal' },
        ].map((d) => (
          <div key={d.t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: 7, background: d.c, border: '1px solid rgba(0,0,0,0.1)' }} />
            <div>
              <div style={{ color: '#1a1814', fontWeight: 600 }}>{d.t}</div>
              <div style={{ color: '#7a6850', font: `400 12px "Fraunces", Georgia, serif`, fontStyle: 'italic' }}>{d.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f0eee9' }}>
      <Intro />

      <DesignCanvas>
        <DCSection id="desktop" title="Desktop · Main workshop screen" subtitle="The student-facing app — left inputs · center 3D · right results">
          <DCArtboard id="hud-desktop" label="A · HUD / Telemetry" width={1440} height={900}>
            <DirectionHUD />
          </DCArtboard>
          <DCArtboard id="ed-desktop" label="B · Editorial" width={1440} height={900}>
            <DirectionEditorial />
          </DCArtboard>
          <DCArtboard id="ar-desktop" label="C · Game dashboard" width={1440} height={900}>
            <DirectionArcade />
          </DCArtboard>
        </DCSection>

        <DCSection id="drawer" title="Info drawer state" subtitle="What it looks like when a student taps the (i) on a parameter">
          <DCArtboard id="hud-drawer" label="A · HUD drawer" width={1440} height={900}>
            <DrawerHud />
          </DCArtboard>
          <DCArtboard id="ar-drawer" label="C · Arcade drawer" width={1440} height={900}>
            <DrawerArcade />
          </DCArtboard>
        </DCSection>

        <DCSection id="leaderboard" title="Teacher leaderboard · teacher.html" subtitle="Live ranked view of all groups in the room">
          <DCArtboard id="hud-leaderboard" label="A · HUD scoreboard" width={1440} height={900}>
            <LeaderboardHud />
          </DCArtboard>
          <DCArtboard id="ar-leaderboard" label="C · Arcade podium" width={1440} height={900}>
            <LeaderboardArcade />
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile" title="Mobile · single-column" subtitle="How the layout collapses on a phone">
          <DCArtboard id="hud-mobile" label="A · HUD mobile" width={390} height={844}>
            <MobileHud />
          </DCArtboard>
          <DCArtboard id="ar-mobile" label="C · Arcade mobile" width={390} height={844}>
            <MobileArcade />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
