// shared.jsx — common building blocks used across all three directions
// (BuildingSVG, sample data, icons). Direction-specific styling lives
// in each direction's own file.

// ---- Sample data (matches the inputs the real app exposes) -------------
const SAMPLE_INPUTS = {
  apartmentType: 'Mid-floor apartment',
  floor: 4,
  size: 78,        // m²
  glassPct: 35,    // %
  orientation: 'South',
  ventilation: 'MV with heat recovery',
  heating: 'Heat pump (air–water)',
  insulation: 'Rc 4.5 (renovated)',
};

const SAMPLE_RESULTS = {
  label: 'B',
  kwh: 84,
  co2: 12.4,        // kg/m²/yr
  heating: 41,      // kWh/m²/yr
  cooling: 8,
  ventilation: 14,
  hotwater: 16,
  appliances: 5,
  insight:
    'Your south-facing glass adds 18 kWh/m²/yr of free winter heat, but tips into overheating in summer. External shading would shave ~6 kWh.',
};

// ---- Building SVG (stylized stand-in for the 3D canvas) -----------------
// Drawn in axonometric projection so it reads as a 3D massing model.
// Floors / window density / orientation respond to props so the picture
// looks like the inputs actually drive it.
function BuildingAxon({
  floors = 6,
  highlightFloor = 4,
  windowDensity = 0.6,
  glassPct = 35,
  palette = {
    sky: '#0a1f1c',
    wall: '#cdb89a',
    wallShade: '#9c8970',
    roof: '#7a6850',
    glass: '#22b39a',
    glassDim: '#0d4d44',
    accent: '#f5b544',
    line: '#0a1f1c',
    sun: '#f5b544',
  },
  showSun = true,
  showGround = true,
  size = 1,
}) {
  const W = 480 * size;
  const H = 520 * size;
  const cx = W / 2;
  const cy = H / 2 + 30 * size;
  // Axon angles
  const dx = 90 * size;     // horizontal offset of side face
  const dy = 50 * size;     // vertical offset (depth)
  const fw = 150 * size;    // facade half-width
  const floorH = 36 * size;
  const totalH = floors * floorH;

  // 3 anchor points of the prism (front-bottom-left, front-bottom-right, back-bottom)
  // We use a simple cabinet projection: front face is rectangle, side face skews back.
  const baseY = cy + totalH / 2;
  const topY = baseY - totalH;

  // Front face corners
  const fbl = [cx - fw, baseY];
  const fbr = [cx + fw, baseY];
  const ftl = [cx - fw, topY];
  const ftr = [cx + fw, topY];
  // Back face corners (offset by dx, -dy)
  const bbl = [fbl[0] + dx, fbl[1] - dy];
  const bbr = [fbr[0] + dx, fbr[1] - dy];
  const btr = [ftr[0] + dx, ftr[1] - dy];
  const btl = [ftl[0] + dx, ftl[1] - dy];

  // Window grid
  const cols = 5;
  const winW = (fw * 2) / (cols + 1) * 0.6;
  const winH = floorH * (0.45 + glassPct / 200);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`bgrad-${palette.sky}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.sky} />
          <stop offset="1" stopColor={palette.sky} stopOpacity="0.4" />
        </linearGradient>
        <pattern id="dot-grid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill={palette.line} fillOpacity="0.18" />
        </pattern>
      </defs>

      {/* Background dot grid */}
      <rect width={W} height={H} fill="url(#dot-grid)" />

      {/* Sun */}
      {showSun && (
        <g>
          <circle cx={W - 60 * size} cy={70 * size} r={26 * size} fill={palette.sun} fillOpacity="0.18" />
          <circle cx={W - 60 * size} cy={70 * size} r={14 * size} fill={palette.sun} />
        </g>
      )}

      {/* Ground shadow */}
      {showGround && (
        <ellipse
          cx={cx + dx / 2}
          cy={baseY + 6 * size}
          rx={fw + dx / 2 + 12 * size}
          ry={14 * size}
          fill={palette.line}
          fillOpacity="0.18"
        />
      )}

      {/* Side (right) face */}
      <polygon
        points={`${fbr[0]},${fbr[1]} ${bbr[0]},${bbr[1]} ${btr[0]},${btr[1]} ${ftr[0]},${ftr[1]}`}
        fill={palette.wallShade}
        stroke={palette.line}
        strokeWidth="1.2"
      />

      {/* Roof */}
      <polygon
        points={`${ftl[0]},${ftl[1]} ${ftr[0]},${ftr[1]} ${btr[0]},${btr[1]} ${btl[0]},${btl[1]}`}
        fill={palette.roof}
        stroke={palette.line}
        strokeWidth="1.2"
      />

      {/* Front face */}
      <polygon
        points={`${fbl[0]},${fbl[1]} ${fbr[0]},${fbr[1]} ${ftr[0]},${ftr[1]} ${ftl[0]},${ftl[1]}`}
        fill={palette.wall}
        stroke={palette.line}
        strokeWidth="1.4"
      />

      {/* Floor lines */}
      {Array.from({ length: floors - 1 }, (_, i) => {
        const y = baseY - (i + 1) * floorH;
        return (
          <g key={`fl${i}`}>
            <line
              x1={fbl[0]}
              y1={y}
              x2={fbr[0]}
              y2={y}
              stroke={palette.line}
              strokeOpacity="0.25"
              strokeWidth="0.8"
            />
            <line
              x1={fbr[0]}
              y1={y}
              x2={bbr[0]}
              y2={y - dy}
              stroke={palette.line}
              strokeOpacity="0.18"
              strokeWidth="0.8"
            />
          </g>
        );
      })}

      {/* Windows on the front */}
      {Array.from({ length: floors }, (_, i) => {
        const fy = baseY - (i + 0.5) * floorH;
        const isHi = i === floors - 1 - highlightFloor; // count from top
        return Array.from({ length: cols }, (_, c) => {
          const wx = fbl[0] + ((c + 1) * (fw * 2)) / (cols + 1) - winW / 2;
          const lit = ((c + i) % 7) / 7 < windowDensity;
          return (
            <rect
              key={`w${i}-${c}`}
              x={wx}
              y={fy - winH / 2}
              width={winW}
              height={winH}
              fill={lit ? palette.glass : palette.glassDim}
              stroke={isHi ? palette.accent : palette.line}
              strokeWidth={isHi ? 1.6 : 0.6}
              opacity={lit ? 1 : 0.7}
            />
          );
        });
      })}

      {/* Highlight floor band on front face */}
      {highlightFloor != null && (
        <rect
          x={fbl[0] - 4 * size}
          y={baseY - (highlightFloor + 1) * floorH}
          width={fw * 2 + 8 * size}
          height={floorH}
          fill="none"
          stroke={palette.accent}
          strokeWidth="2"
          strokeDasharray="4 3"
          opacity="0.85"
        />
      )}

      {/* Side windows (smaller, fewer) */}
      {Array.from({ length: floors }, (_, i) => {
        const fy = baseY - (i + 0.5) * floorH;
        return Array.from({ length: 2 }, (_, c) => {
          const t = (c + 1) / 3;
          const x1 = fbr[0] + (bbr[0] - fbr[0]) * t;
          const y1 = fy + (bbr[1] - fbr[1]) * t;
          return (
            <rect
              key={`sw${i}-${c}`}
              x={x1 - 6 * size}
              y={y1 - winH / 3}
              width={12 * size}
              height={winH * 0.7}
              fill={palette.glassDim}
              stroke={palette.line}
              strokeWidth="0.5"
              opacity="0.7"
              transform={`skewY(-30 ${x1} ${y1})`}
            />
          );
        });
      })}

      {/* Compass */}
      <g transform={`translate(${48 * size}, ${H - 56 * size})`}>
        <circle r={20 * size} fill="none" stroke={palette.line} strokeOpacity="0.5" strokeWidth="1" />
        <text
          x="0"
          y={-22 * size}
          textAnchor="middle"
          fill={palette.accent}
          style={{ font: `600 ${11 * size}px "JetBrains Mono", monospace` }}
        >
          N
        </text>
        <polygon
          points={`0,${-12 * size} ${4 * size},${4 * size} 0,0 ${-4 * size},${4 * size}`}
          fill={palette.accent}
        />
      </g>
    </svg>
  );
}

// ---- Tiny stat-bar utility -------------------------------------------------
function MiniBar({ value, max, color, height = 6 }) {
  const w = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <div style={{ position: 'relative', width: '100%', height, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${w}%`,
          background: color,
          borderRadius: 999,
        }}
      />
    </div>
  );
}

// ---- Info icon ------------------------------------------------------------
function InfoDot({ size = 14, color = 'currentColor', opacity = 0.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ opacity, flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1" />
      <circle cx="8" cy="5" r="0.9" fill={color} />
      <rect x="7.4" y="7" width="1.2" height="4.5" rx="0.6" fill={color} />
    </svg>
  );
}

// ---- Chevron --------------------------------------------------------------
function Chevron({ size = 10, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <path d="M2 4l3 3 3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Energy band labels A–G with their canonical colors (EU energy label).
const ENERGY_BANDS = [
  { band: 'A', color: '#1f9d4f', range: '< 50' },
  { band: 'B', color: '#5fb84a', range: '50–75' },
  { band: 'C', color: '#b6d342', range: '75–105' },
  { band: 'D', color: '#fed835', range: '105–135' },
  { band: 'E', color: '#f5a623', range: '135–175' },
  { band: 'F', color: '#ec6e2c', range: '175–250' },
  { band: 'G', color: '#d63a2f', range: '> 250' },
];

Object.assign(window, {
  SAMPLE_INPUTS,
  SAMPLE_RESULTS,
  BuildingAxon,
  MiniBar,
  InfoDot,
  Chevron,
  ENERGY_BANDS,
});
