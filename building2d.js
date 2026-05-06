// building2d.js — Rotatable 3D building, Canvas 2D + orthographic projection
// Drag horizontally to rotate around Y axis. No CDN needed.

const _bs = new WeakMap(); // per-canvas rotation state

// ── Attach drag handlers once per canvas ─────────────────────────────────────
function _initDrag(canvas) {
  if (_bs.has(canvas)) return;
  const s = { rotY: 0.55, dragging: false, lastX: 0, inp: null, dark: true };
  _bs.set(canvas, s);
  canvas.style.cursor = 'grab';

  const start = x => { s.dragging = true; s.lastX = x; canvas.style.cursor = 'grabbing'; };
  const move  = x => {
    if (!s.dragging || !s.inp) return;
    s.rotY += (x - s.lastX) * 0.007;
    s.lastX = x;
    _draw(canvas, s.inp, s.dark, s.rotY);
  };
  const end = () => { s.dragging = false; canvas.style.cursor = 'grab'; };

  canvas.addEventListener('mousedown',  e => start(e.clientX));
  canvas.addEventListener('touchstart', e => { e.preventDefault(); start(e.touches[0].clientX); }, {passive:false});
  window.addEventListener('mousemove',  e => move(e.clientX));
  window.addEventListener('touchmove',  e => { if (s.dragging) { e.preventDefault(); move(e.touches[0].clientX); } }, {passive:false});
  window.addEventListener('mouseup',    end);
  window.addEventListener('touchend',   end);
}

// ── Public API ────────────────────────────────────────────────────────────────
function drawBuilding2D(canvas, inputs, isDark) {
  _initDrag(canvas);
  const s = _bs.get(canvas);
  s.inp = inputs; s.dark = isDark;
  _draw(canvas, inputs, isDark, s.rotY);
}

// ── Renderer ──────────────────────────────────────────────────────────────────
function _draw(canvas, inputs, isDark, rotY) {
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const W   = Math.max(100, canvas.clientWidth  || 500);
  const H   = Math.max(100, canvas.clientHeight || 340);
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  ctx.scale(DPR, DPR);

  const { aptType, floor, totalFloors, size, glassRatio,
          construction, roofType, orientation, climate2050 } = inputs;
  const isGallery = aptType === 2;
  const isCorner  = aptType === 3 || aptType === 4;
  const isTwoSide = aptType === 1 || aptType === 4;

  // ── Sky ──────────────────────────────────────────────────────────────────────
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.85);
  if (climate2050) {
    sky.addColorStop(0, isDark ? '#1c0500' : '#fde68a');
    sky.addColorStop(1, isDark ? '#451a03' : '#fcd34d');
  } else {
    sky.addColorStop(0, isDark ? '#0f172a' : '#dbeafe');
    sky.addColorStop(1, isDark ? '#1e293b' : '#bfdbfe');
  }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  // ── Ground ───────────────────────────────────────────────────────────────────
  const gY = H - 30;
  ctx.fillStyle = isDark ? '#1e293b' : '#d1d5db'; ctx.fillRect(0, gY, W, H - gY);
  ctx.fillStyle = isDark ? '#334155' : '#9ca3af'; ctx.fillRect(0, gY, W, 1.5);

  // ── Building dimensions in SCREEN PIXELS ────────────────────────────────────
  // Define in pixels so orthographic projection is clean — no world-unit confusion.
  const FH_px = Math.max(8, Math.min(28, (gY - 22) * 0.88 / totalFloors));
  const bH    = FH_px * totalFloors;                        // building height px
  const bW    = W * 0.44;                                   // building width px
  const bD    = isGallery ? bW * 0.42 : bW * 0.80;         // building depth px
  const hw    = bW / 2,  hd = bD / 2;
  const cx    = W / 2;  // horizontal centre

  // ── Orthographic projection with Y-rotation ──────────────────────────────────
  // Input: world-pixel coords (same scale as bW, bH)
  // Output: [screenX, screenY, depthZ]  — depthZ for back-to-front sorting
  const cos = Math.cos(rotY), sin = Math.sin(rotY);
  const proj = (wx, wy, wz) => [
    cx + wx * cos + wz * sin,   // screenX
    gY - wy,                    // screenY (Y=0 at ground)
    -wx * sin + wz * cos        // depthZ  (more positive = farther back)
  ];

  // ── 8 box vertices ────────────────────────────────────────────────────────────
  const V3 = [
    [-hw, 0,   -hd], // 0  front-left-bottom
    [+hw, 0,   -hd], // 1  front-right-bottom
    [+hw, bH,  -hd], // 2  front-right-top
    [-hw, bH,  -hd], // 3  front-left-top
    [-hw, 0,   +hd], // 4  back-left-bottom
    [+hw, 0,   +hd], // 5  back-right-bottom
    [+hw, bH,  +hd], // 6  back-right-top
    [-hw, bH,  +hd], // 7  back-left-top
  ];
  const P3 = V3.map(v => proj(...v));               // projected [sx, sy, sz]
  const P  = P3.map(p => [p[0], p[1]]);             // 2D screen coords only

  // ── Faces: vertex indices in CCW order (outside-facing = visible) ─────────────
  const FACES = [
    { id:'front', v:[0,1,2,3], lum:1.00, wall:true,  main:true  },
    { id:'back',  v:[5,4,7,6], lum:0.65, wall:true,  main:false }, // gallery corridor side
    { id:'right', v:[1,5,6,2], lum:0.78, wall:isCorner||isTwoSide, main:false },
    { id:'left',  v:[4,0,3,7], lum:0.72, wall:isTwoSide,           main:false },
    { id:'top',   v:[3,2,6,7], lum:0.88, wall:false, main:false },
  ];

  // ── Visibility: face is visible when its 2D polygon has positive signed area ──
  const signedArea = vi => {
    let a = 0;
    for (let i = 0; i < vi.length; i++) {
      const j = (i+1) % vi.length;
      a += P[vi[i]][0] * P[vi[j]][1] - P[vi[j]][0] * P[vi[i]][1];
    }
    return a;
  };
  const visible = FACES.filter(f => signedArea(f.v) > 0);

  // ── Sort back to front (painter's algorithm) ──────────────────────────────────
  const faceDepth = f => f.v.reduce((s, i) => s + P3[i][2], 0) / f.v.length;
  visible.sort((a, b) => faceDepth(b) - faceDepth(a));

  // ── UV helpers ────────────────────────────────────────────────────────────────
  // Bilinear interpolation on face: u=0..1 left→right, v=0..1 bottom→top
  const uv = (fv, u, v) => {
    const [p0,p1,p2,p3] = fv.map(i => P[i]);
    const bx = p0[0]+(p1[0]-p0[0])*u, by = p0[1]+(p1[1]-p0[1])*u;
    const tx = p3[0]+(p2[0]-p3[0])*u, ty = p3[1]+(p2[1]-p3[1])*u;
    return [bx+(tx-bx)*v, by+(ty-by)*v];
  };
  const fillQ = (a,b,c,d, col, alpha=1) => {
    ctx.globalAlpha=alpha; ctx.fillStyle=col;
    ctx.beginPath();
    ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]);
    ctx.lineTo(c[0],c[1]); ctx.lineTo(d[0],d[1]);
    ctx.closePath(); ctx.fill(); ctx.globalAlpha=1;
  };
  const fRect = (fv, u0,v0,u1,v1, col, alpha=1) =>
    fillQ(uv(fv,u0,v0), uv(fv,u1,v0), uv(fv,u1,v1), uv(fv,u0,v1), col, alpha);

  // ── Colours ───────────────────────────────────────────────────────────────────
  const darken = (hex, f) => {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `rgb(${~~(r*f)},${~~(g*f)},${~~(b*f)})`;
  };
  const BASE = (isDark
    ? ['#7c3d12','#57534e','#57534e','#475569','#334155']
    : ['#b45309','#78716c','#78716c','#94a3b8','#64748b']
  )[Math.min(construction, 4)];
  const WIN = isDark ? '#93c5fd' : '#2563eb';

  // ── Draw each visible face ────────────────────────────────────────────────────
  for (const face of visible) {
    const fv = face.v;
    const [p0,p1,p2,p3] = fv.map(i => P[i]);

    // Base colour
    fillQ(p0,p1,p2,p3, darken(BASE, face.lum));

    // ── Top / Roof ──
    if (face.id === 'top') {
      if (roofType > 0) {
        const rc = roofType===2 ? (isDark?'#22c55e':'#16a34a') : (isDark?'#0f172a':'#374151');
        fillQ(p0,p1,p2,p3, rc);
        if (roofType === 2) {
          for (let i=0; i<5; i++) {
            const pt = uv(fv, 0.1+i*0.2, 0.5);
            ctx.fillStyle='#4ade80'; ctx.globalAlpha=0.8;
            ctx.beginPath(); ctx.arc(pt[0],pt[1],3.5,0,Math.PI*2); ctx.fill();
            ctx.globalAlpha=1;
          }
        }
      }
      continue;
    }

    // ── Wall faces ──
    if (!face.wall) continue;

    const isGalBack = isGallery && face.id === 'back';
    // Gallery: windows on front (main façade) AND back (gallery side — two-sided!)
    const shouldDrawWindows = face.main || isGalBack || (isCorner && face.id==='right') || (isTwoSide && (face.id==='right'||face.id==='left'));
    if (!shouldDrawWindows) continue;

    const cols  = face.main ? (isGallery ? 6 : 3) : (isGalBack ? 4 : 2);
    const wWf   = Math.min(0.85, glassRatio * 1.80) / cols;  // window width fraction per col
    const wHf   = Math.min(0.76, glassRatio * 1.58);         // window height fraction per floor
    const gapW  = (1/cols - wWf) / 2;
    const gapH  = (1 - wHf) / 2 / totalFloors;

    for (let fl = 0; fl < totalFloors; fl++) {
      const isApt = fl === floor - 1;
      const v0    = fl / totalFloors;
      const v1    = (fl+1) / totalFloors;

      // Apartment highlight (all visible wall faces show the floor band)
      if (isApt) {
        fRect(fv, 0, v0, 1, v1, face.main ? '#3b82f618' : '#3b82f610', 1);
        if (face.main) fRect(fv, 0, v0+0.003, 0.016, v1-0.003, '#3b82f6', 0.9);
      }

      // Windows
      for (let wc = 0; wc < cols; wc++) {
        const u0w = wc/cols + gapW;
        const u1w = (wc+1)/cols - gapW;
        const v0w = v0 + gapH;
        const v1w = v1 - gapH;
        const wCol   = (isApt && face.main) ? '#60a5fa' : WIN;
        const wAlpha = (isApt && face.main) ? 0.90 : (isDark ? 0.50 : 0.42);
        fRect(fv, u0w, v0w, u1w, v1w, wCol, wAlpha);
        fRect(fv, u0w, v0w, u1w, v0w+(v1w-v0w)*0.28, '#ffffff', 0.15); // shimmer
      }

      // Floor divider
      if (fl > 0 && FH_px > 9) {
        const la = uv(fv,0,v0), lb = uv(fv,1,v0);
        ctx.globalAlpha=0.25; ctx.strokeStyle=isDark?'#334155':'#e2e8f0'; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(la[0],la[1]); ctx.lineTo(lb[0],lb[1]); ctx.stroke();
        ctx.globalAlpha=1;
      }

      // Gallery ledge on back face
      if (isGalBack) {
        fRect(fv, 0, v0, 1, v0+0.02, isDark?'#334155':'#9ca3af', 0.88);
        // Railing
        const railV = v0 + (v1-v0)*0.42;
        const ra = uv(fv,0,railV), rb = uv(fv,1,railV);
        ctx.globalAlpha=0.40; ctx.strokeStyle=isDark?'#475569':'#6b7280'; ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.moveTo(ra[0],ra[1]); ctx.lineTo(rb[0],rb[1]); ctx.stroke();
        ctx.globalAlpha=1;
      }
    }

    // Apartment floor label on main (front) face
    if (face.main && FH_px >= 10) {
      const vMid = (floor - 0.5) / totalFloors;
      const lp   = uv(fv, 0.03, vMid);
      const fs   = Math.max(9, Math.min(12, FH_px * 0.50));
      ctx.fillStyle = isDark ? '#93c5fd' : '#1d4ed8';
      ctx.font = `bold ${fs}px 'Segoe UI',sans-serif`;
      ctx.fillText(`▶ ${floor}`, lp[0]+2, lp[1]+fs*0.35);
    }
  }

  // ── Compass ───────────────────────────────────────────────────────────────────
  _compass(ctx, W-42, 42, orientation, isDark);

  // ── Climate 2050 badge ────────────────────────────────────────────────────────
  if (climate2050) {
    ctx.fillStyle = isDark?'#fb923c':'#ea580c'; ctx.font='bold 10px sans-serif';
    ctx.fillText('🌡 2050', 10, 18);
  }

  // ── Drag hint ─────────────────────────────────────────────────────────────────
  ctx.fillStyle = isDark?'#334155':'#94a3b8'; ctx.font='10px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('↔ sleep om te draaien', W-8, H-7);
  ctx.textAlign = 'left';
}

// ── Compass rose ──────────────────────────────────────────────────────────────
function _compass(ctx, cx, cy, orientation, isDark) {
  const r = 19;
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = isDark?'#1e293b':'#ffffff';
  ctx.beginPath(); ctx.arc(cx,cy,r+3,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = isDark?'#475569':'#94a3b8'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();

  const arrow = (deg, len, hw2, color) => {
    const a = (deg-90)*Math.PI/180;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*r*len,     cy+Math.sin(a)*r*len);
    ctx.lineTo(cx+Math.cos(a+hw2)*r*0.30, cy+Math.sin(a+hw2)*r*0.30);
    ctx.lineTo(cx+Math.cos(a-hw2)*r*0.30, cy+Math.sin(a-hw2)*r*0.30);
    ctx.closePath(); ctx.fill();
  };
  arrow(0,   0.85, 0.42, '#ef4444');
  arrow(180, 0.52, 0.38, isDark?'#475569':'#9ca3af');
  arrow(orientation*45, 0.78, 0.48, '#3b82f6');

  ctx.fillStyle = isDark?'#94a3b8':'#64748b';
  ctx.font = 'bold 8px sans-serif'; ctx.textAlign='center';
  ctx.fillText('N', cx, cy-r-4); ctx.textAlign='left';
}
