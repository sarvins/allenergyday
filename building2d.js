// building2d.js — Orbit-camera 3D building on Canvas 2D
// Drag horizontally = orbit left/right
// Drag vertically   = orbit up/down (bird's eye to ground)
// Scroll            = zoom in/out
// No CDN. Pure Canvas 2D + perspective projection.

const _bs = new WeakMap(); // per-canvas orbit state

// ── Vector math ───────────────────────────────────────────────────────────────
const _sub  = (a,b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const _dot  = (a,b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const _cross= (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const _norm = a => { const l=Math.sqrt(_dot(a,a)); return l<1e-9?[0,1,0]:[a[0]/l,a[1]/l,a[2]/l]; };

// ── Init orbit controls (once per canvas) ─────────────────────────────────────
function _initOrbit(canvas) {
  if (_bs.has(canvas)) return;
  const s = {
    az:   -0.55,  // azimuth  (rad): camera horizontal angle around building
    el:    0.32,  // elevation (rad): 0 = horizon, PI/2 = straight down
    zoom:  1.0,   // distance multiplier
    panX:  0,     // screen-space pan offset (px)
    panY:  0,
    drag:  false,
    panning: false,
    lx: 0, ly: 0,
    inp: null, dark: true
  };
  _bs.set(canvas, s);
  canvas.style.cursor = 'grab';

  const getXY = e => e.touches
    ? [e.touches[0].clientX, e.touches[0].clientY]
    : [e.clientX, e.clientY];

  canvas.addEventListener('mousedown', e => {
    if (e.button === 1) e.preventDefault(); // suppress middle-click autoscroll
    s.drag    = true;
    s.panning = e.shiftKey || e.button === 1;
    [s.lx, s.ly] = getXY(e);
    canvas.style.cursor = s.panning ? 'move' : 'grabbing';
  });
  canvas.addEventListener('touchstart', e => {
    e.preventDefault(); s.drag = true; s.panning = false; [s.lx, s.ly] = getXY(e);
  }, {passive:false});

  const onMove = (nx, ny, shiftKey) => {
    if (!s.drag || !s.inp) return;
    const dx = nx - s.lx, dy = ny - s.ly;
    if (s.panning || shiftKey) {
      s.panX += dx;
      s.panY += dy;
    } else {
      s.az -= dx * 0.008;
      s.el -= dy * 0.006;
      s.el  = Math.max(0.05, Math.min(Math.PI/2 - 0.03, s.el));
    }
    s.lx = nx; s.ly = ny;
    _render(canvas, s.inp, s.dark, s);
  };
  window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY, e.shiftKey));
  window.addEventListener('touchmove', e => {
    if (s.drag) { e.preventDefault(); const [x,y]=getXY(e); onMove(x,y,false); }
  }, {passive:false});

  window.addEventListener('mouseup',  () => { s.drag=false; canvas.style.cursor='grab'; });
  window.addEventListener('touchend', () => { s.drag=false; });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) return; // browser zoom, not canvas zoom
    s.zoom *= (1 + e.deltaY * 0.001);
    s.zoom = Math.max(0.25, Math.min(5.0, s.zoom));
    if (s.inp) _render(canvas, s.inp, s.dark, s);
  }, {passive:false});
}

function resetBuilding2D(canvas) {
  if (!_bs.has(canvas)) return;
  const s = _bs.get(canvas);
  s.az   = -0.55;
  s.el   =  0.32;
  s.zoom =  1.0;
  s.panX =  0;
  s.panY =  0;
  if (s.inp) _render(canvas, s.inp, s.dark, s);
}

// ── Public API ─────────────────────────────────────────────────────────────────
function drawBuilding2D(canvas, inputs, isDark) {
  _initOrbit(canvas);
  const s = _bs.get(canvas);
  s.inp = inputs; s.dark = isDark;
  _render(canvas, inputs, isDark, s);
}

// ── Renderer ───────────────────────────────────────────────────────────────────
function _render(canvas, inputs, isDark, s) {
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const W   = Math.max(200, canvas.clientWidth  || 500);
  const H   = Math.max(200, canvas.clientHeight || 680);
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  ctx.scale(DPR, DPR);

  const { aptType, floor, totalFloors, size, glassRatio,
          construction, roofType, orientation, climate2050, buildingType } = inputs;
  const isGallery = aptType === 2;
  // Tower always has corner (hoek) apartments → show windows on side faces
  const isCorner  = aptType === 1 || (!isGallery && inputs.buildingType === 0);

  // ── Building world dimensions (metres) ───────────────────────────────────────
  const FH = 3.2;
  const bH = FH * totalFloors;
  // Use the student's explicit footprint inputs; fall back to size-derived if absent.
  const bW = (inputs.width  > 0) ? inputs.width  : (isGallery ? 20 : Math.round(Math.max(10, Math.sqrt(size * 3))));
  const bD = (inputs.depth  > 0) ? inputs.depth  : (isGallery ? Math.round(Math.max(6, size / 10)) : bW);
  const hw = bW/2, hd = bD/2;
  const midY = bH/2;  // orbit target: vertical center of building

  // ── Orbit camera: spherical coords → Cartesian position ──────────────────────
  const radius   = Math.sqrt(hw*hw + midY*midY + hd*hd) * 3.0 * s.zoom;
  const camX = radius * Math.cos(s.el) * Math.sin(s.az);
  const camY = midY   + radius * Math.sin(s.el);
  const camZ = radius * Math.cos(s.el) * Math.cos(s.az);
  const cam  = [camX, camY, camZ];
  const tgt  = [0, midY, 0];

  // Camera axes: forward, right, up
  const fwd  = _norm(_sub(tgt, cam));
  const wUp  = Math.abs(_dot(fwd, [0,1,0])) > 0.98 ? [1,0,0] : [0,1,0];
  const rgt  = _norm(_cross(fwd, wUp));
  const upV  = _cross(rgt, fwd);

  // Perspective projection — 45° vertical FOV
  const focal = (H / 2) / Math.tan(22.5 * Math.PI / 180);

  const proj = (wx, wy, wz) => {
    const d  = _sub([wx, wy, wz], cam);
    const px = _dot(d, rgt);
    const py = _dot(d, upV);
    const pz = _dot(d, fwd);
    if (pz < 0.01) return null;
    return [ W/2 + s.panX + (px/pz)*focal,  H/2 + s.panY - (py/pz)*focal,  pz ];
  };

  // ── Sky + Ground background (always visible) ──────────────────────────────────
  // Estimate horizon Y from front-base projection; clamp so ground strip always shows.
  const _frontBase = proj(0, 0, -hd);
  const horizonY   = _frontBase
    ? Math.min(H * 0.92, Math.max(H * 0.10, _frontBase[1]))
    : H * 0.60;

  ctx.fillStyle = isDark ? '#1e293b' : '#d1d5db';
  ctx.fillRect(0, horizonY, W, H - horizonY);

  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  if (climate2050) {
    sky.addColorStop(0, isDark?'#1c0500':'#fde68a');
    sky.addColorStop(1, isDark?'#451a03':'#fcd34d');
  } else {
    sky.addColorStop(0, isDark?'#0f172a':'#dbeafe');
    sky.addColorStop(1, isDark?'#1e293b':'#bfdbfe');
  }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizonY);

  // ── 8 box vertices ────────────────────────────────────────────────────────────
  // Faces use CCW winding viewed from outside:
  // v[0]=bottom-left, v[1]=bottom-right, v[2]=top-right, v[3]=top-left (face local)
  const V = [
    [-hw, 0,  -hd], // 0  front-left-bottom
    [+hw, 0,  -hd], // 1  front-right-bottom
    [+hw, bH, -hd], // 2  front-right-top
    [-hw, bH, -hd], // 3  front-left-top
    [-hw, 0,  +hd], // 4  back-left-bottom
    [+hw, 0,  +hd], // 5  back-right-bottom
    [+hw, bH, +hd], // 6  back-right-top
    [-hw, bH, +hd], // 7  back-left-top
  ];
  const P3 = V.map(v => proj(...v));
  const P2 = P3.map(p => p ? [p[0],p[1]] : null);

  // ── Face definitions ──────────────────────────────────────────────────────────
  const FACES = [
    {id:'front', v:[0,1,2,3], n:[0,0,-1],  lum:1.00, wall:true,  main:true  },
    {id:'back',  v:[5,4,7,6], n:[0,0,+1],  lum:0.65, wall:true,  main:false },
    {id:'right', v:[1,5,6,2], n:[+1,0,0],  lum:0.78, wall:isCorner, main:false},
    {id:'left',  v:[4,0,3,7], n:[-1,0,0],  lum:0.72, wall:isCorner, main:false},
    {id:'top',   v:[3,2,6,7], n:[0,+1,0],  lum:0.90, wall:false, main:false },
    {id:'bot',   v:[0,4,5,1], n:[0,-1,0],  lum:0.30, wall:false, main:false },
  ];

  // ── Backface culling: visible if normal · (cam − faceCenter) > 0 ──────────────
  const fctr = vi => {
    const ps = vi.map(i=>V[i]);
    return [ps.reduce((a,p)=>a+p[0],0)/ps.length,
            ps.reduce((a,p)=>a+p[1],0)/ps.length,
            ps.reduce((a,p)=>a+p[2],0)/ps.length];
  };
  const visible = FACES.filter(f => _dot(f.n, _sub(cam, fctr(f.v))) > 0);

  // ── Depth sort (painter's algorithm): draw back faces first ───────────────────
  const fDepth = f => f.v.reduce((s,i) => s + (P3[i]?P3[i][2]:0), 0) / f.v.length;
  visible.sort((a,b) => fDepth(b) - fDepth(a));

  // ── Ground plane ──────────────────────────────────────────────────────────────
  const ext = Math.max(bW, bD) * 2.5;
  const gps = [proj(-ext,-0.05,-ext), proj(ext,-0.05,-ext),
                proj(ext,-0.05,ext),   proj(-ext,-0.05,ext)];
  if (gps.every(Boolean)) {
    ctx.fillStyle = isDark?'#1e293b':'#d1d5db';
    ctx.beginPath();
    ctx.moveTo(gps[0][0],gps[0][1]); ctx.lineTo(gps[1][0],gps[1][1]);
    ctx.lineTo(gps[2][0],gps[2][1]); ctx.lineTo(gps[3][0],gps[3][1]);
    ctx.closePath(); ctx.fill();
    // Ground edge line
    ctx.strokeStyle = isDark?'#334155':'#9ca3af'; ctx.lineWidth=1.5;
    ctx.stroke();
  }

  // ── Drawing helpers ───────────────────────────────────────────────────────────
  const darken = (hex,f) => {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `rgb(${~~(r*f)},${~~(g*f)},${~~(b*f)})`;
  };

  // Bilinear UV on face: u=0..1 left→right, v=0..1 bottom→top
  const uv = (fv, u, v) => {
    const ps = fv.map(i => P2[i] || [W/2,H/2]);
    const [p0,p1,p2,p3] = ps;
    const bx=p0[0]+(p1[0]-p0[0])*u, by=p0[1]+(p1[1]-p0[1])*u;
    const tx=p3[0]+(p2[0]-p3[0])*u, ty=p3[1]+(p2[1]-p3[1])*u;
    return [bx+(tx-bx)*v, by+(ty-by)*v];
  };

  const fillQ = (a,b,c,d, col, alpha=1) => {
    if (!a||!b||!c||!d) return;
    ctx.globalAlpha=alpha; ctx.fillStyle=col;
    ctx.beginPath();
    ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]);
    ctx.lineTo(c[0],c[1]); ctx.lineTo(d[0],d[1]);
    ctx.closePath(); ctx.fill(); ctx.globalAlpha=1;
  };
  const fRect = (fv,u0,v0,u1,v1,col,alpha=1) =>
    fillQ(uv(fv,u0,v0), uv(fv,u1,v0), uv(fv,u1,v1), uv(fv,u0,v1), col, alpha);

  const BASE = (isDark
    ? ['#7c3d12','#57534e','#57534e','#475569','#334155']
    : ['#b45309','#78716c','#78716c','#94a3b8','#64748b']
  )[Math.min(construction, 4)];
  const WIN = isDark ? '#93c5fd' : '#2563eb';

  // ── Draw each visible face ────────────────────────────────────────────────────
  for (const face of visible) {
    const fv = face.v;
    const corners = fv.map(i => P2[i] || [W/2,H/2]);

    fillQ(...corners, darken(BASE, face.lum));

    // ── Top face + roof ──
    if (face.id === 'top') {
      if (roofType > 0) {
        const rc = roofType===2 ? (isDark?'#22c55e':'#16a34a') : (isDark?'#0f172a':'#374151');
        fillQ(...corners, rc);
        if (roofType === 2) {
          for (let i=0;i<5;i++) {
            const pt = uv(fv, 0.1+i*0.2, 0.5);
            ctx.fillStyle='#4ade80'; ctx.globalAlpha=0.8;
            ctx.beginPath(); ctx.arc(pt[0],pt[1],4,0,Math.PI*2); ctx.fill();
            ctx.globalAlpha=1;
          }
        }
      }
      continue;
    }
    if (face.id === 'bot') continue;

    // ── Wall: decide which faces get windows ──
    const isGalBack   = isGallery && face.id==='back';
    const isTowerBack = !isGallery && buildingType === 0 && face.id==='back';
    const hasWin = face.main
      || isGalBack
      || isTowerBack
      || (face.id==='right' && isCorner)
      || (face.id==='left'  && isCorner);
    if (!hasWin) continue;

    // Window columns driven by how many apartments fit across the facade.
    // aptFW = facade width per apartment = floor area ÷ building depth.
    const aptFW     = Math.max(3, size / bD);
    const colsFront = Math.max(2, Math.min(12, Math.round(bW / aptFW)));
    const colsSide  = Math.max(1, Math.min(5,  Math.round(bD / 5.0)));
    const cols = face.main   ? colsFront
               : isTowerBack  ? colsFront
               : isGalBack    ? Math.max(2, Math.min(8, Math.round(colsFront * 0.6)))
               : colsSide;
    const wWf  = Math.min(0.84, glassRatio*1.78) / cols;
    const wHf  = Math.min(0.75, glassRatio*1.55);
    const gapW = (1/cols - wWf) / 2;
    const gapH = (1 - wHf) / 2 / totalFloors;

    // Approximate floor height in projected pixels (for label/divider threshold)
    const FH_px = Math.abs(uv(fv,0.5,1/totalFloors)[1] - uv(fv,0.5,0)[1]);

    for (let fl=0; fl<totalFloors; fl++) {
      const isApt = fl === floor - 1;
      const v0 = fl / totalFloors;
      const v1 = (fl+1) / totalFloors;

      // Apartment highlight band
      if (isApt) {
        fRect(fv, 0, v0, 1, v1, face.main?'#3b82f620':'#3b82f60e', 1);
        if (face.main) fRect(fv, 0, v0+0.002, 0.014, v1-0.002, '#3b82f6', 0.92);
      }

      // Windows
      for (let wc=0; wc<cols; wc++) {
        const u0w=wc/cols+gapW, u1w=(wc+1)/cols-gapW;
        const v0w=v0+gapH,      v1w=v1-gapH;
        const wCol   = (isApt&&face.main) ? '#60a5fa' : WIN;
        const wAlpha = (isApt&&face.main) ? 0.90 : (isDark?0.50:0.42);
        fRect(fv, u0w, v0w, u1w, v1w, wCol, wAlpha);
        fRect(fv, u0w, v0w, u1w, v0w+(v1w-v0w)*0.28, '#ffffff', 0.14); // shimmer
      }

      // Floor divider line
      if (fl > 0 && FH_px > 7) {
        const la=uv(fv,0,v0), lb=uv(fv,1,v0);
        ctx.globalAlpha=0.22; ctx.strokeStyle=isDark?'#334155':'#e2e8f0'; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(la[0],la[1]); ctx.lineTo(lb[0],lb[1]); ctx.stroke();
        ctx.globalAlpha=1;
      }

      // Gallery corridor ledge + railing on back face
      if (isGalBack) {
        fRect(fv, 0, v0, 1, v0+0.018, isDark?'#334155':'#9ca3af', 0.9);
        const rv = v0+(v1-v0)*0.42;
        const ra=uv(fv,0,rv), rb=uv(fv,1,rv);
        ctx.globalAlpha=0.40; ctx.strokeStyle=isDark?'#475569':'#6b7280'; ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.moveTo(ra[0],ra[1]); ctx.lineTo(rb[0],rb[1]); ctx.stroke();
        ctx.globalAlpha=1;
      }
    }

    // Apartment floor label on front face
    if (face.main && FH_px >= 9) {
      const vMid = (floor-0.5) / totalFloors;
      const lp   = uv(fv, 0.03, vMid);
      const fs   = Math.max(9, Math.min(13, FH_px*0.48));
      ctx.fillStyle = isDark?'#93c5fd':'#1d4ed8';
      ctx.font = `bold ${fs}px 'Segoe UI',sans-serif`;
      ctx.fillText(`▶ ${floor}`, lp[0]+2, lp[1]+fs*0.35);
    }
  }

  // ── Compass rose ──────────────────────────────────────────────────────────────
  _compass(ctx, W-44, 44, orientation, isDark);

  // ── Climate badge ─────────────────────────────────────────────────────────────
  if (climate2050) {
    ctx.fillStyle=isDark?'#fb923c':'#ea580c'; ctx.font='bold 10px sans-serif';
    ctx.fillText('🌡 2050', 10, 18);
  }

  // ── Hint ──────────────────────────────────────────────────────────────────────
  ctx.fillStyle=isDark?'#334155':'#94a3b8'; ctx.font='10px sans-serif'; ctx.textAlign='right';
  ctx.fillText('↕↔ sleep = roteren  ·  shift+sleep = pan  ·  scroll = zoom', W-8, H-8);
  ctx.textAlign='left';
}

// ── Compass ───────────────────────────────────────────────────────────────────
function _compass(ctx, cx, cy, orientation, isDark) {
  const r=20;
  ctx.globalAlpha=0.9; ctx.fillStyle=isDark?'#1e293b':'#ffffff';
  ctx.beginPath(); ctx.arc(cx,cy,r+3,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  ctx.strokeStyle=isDark?'#475569':'#94a3b8'; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  const arrow=(deg,len,hw2,col)=>{
    const a=(deg-90)*Math.PI/180;
    ctx.fillStyle=col; ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a)*r*len,   cy+Math.sin(a)*r*len);
    ctx.lineTo(cx+Math.cos(a+hw2)*r*.3, cy+Math.sin(a+hw2)*r*.3);
    ctx.lineTo(cx+Math.cos(a-hw2)*r*.3, cy+Math.sin(a-hw2)*r*.3);
    ctx.closePath(); ctx.fill();
  };
  arrow(0,   0.85, 0.42, '#ef4444');
  arrow(180, 0.52, 0.38, isDark?'#475569':'#9ca3af');
  arrow(orientation*45, 0.78, 0.48, '#3b82f6');
  ctx.fillStyle=isDark?'#94a3b8':'#64748b'; ctx.font='bold 8px sans-serif'; ctx.textAlign='center';
  ctx.fillText('N', cx, cy-r-4); ctx.textAlign='left';
}
