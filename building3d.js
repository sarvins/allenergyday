// building3d.js — Three.js 3D Building Visualization
// Requires: three.min.js + OrbitControls.js loaded before this file

class BuildingViz {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container || typeof THREE === 'undefined') return;
    this.isDark    = true;
    this._pivot    = null;      // Group holding all building meshes
    this._compass  = null;      // Compass group
    this._lastInputs = null;
    this._init();
    this._addEnvironment();
    this._animate();
    window.addEventListener('resize', () => this._resize());
  }

  // ─── THEME COLOURS ───────────────────────────────────────────────────────────
  get C() {
    return this.isDark ? {
      bg:         0x0f172a,
      ground:     0x1e293b,
      grid:       0x334155,
      fog:        0x0f172a,
      concrete:   0x64748b,
      wood:       0x92400e,
      hybrid:     0x78716c,
      windowGlass:0x93c5fd,
      highlight:  0x3b82f6,
      highlightGlow:0x1d4ed8,
      gallery:    0x475569,
      railing:    0x64748b,
      roofGreen:  0x22c55e,
      roofBlack:  0x1e293b,
      compassN:   0xef4444,
      compassRing:0x475569,
    } : {
      bg:         0xf0f9ff,
      ground:     0xdde1e7,
      grid:       0xb0b8c4,
      fog:        0xdde8f0,
      concrete:   0x94a3b8,
      wood:       0xb45309,
      hybrid:     0xa8a29e,
      windowGlass:0x3b82f6,
      highlight:  0x1d4ed8,
      highlightGlow:0x3b82f6,
      gallery:    0x64748b,
      railing:    0x94a3b8,
      roofGreen:  0x16a34a,
      roofBlack:  0x475569,
      compassN:   0xdc2626,
      compassRing:0x94a3b8,
    };
  }

  // ─── INIT ────────────────────────────────────────────────────────────────────
  _init() {
    // clientWidth may still be 0 if called too early; fall back to getBoundingClientRect or 400
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(rect.width  || this.container.clientWidth  || 0, 100);
    const h = Math.max(rect.height || this.container.clientHeight || 0, 380);

    this.scene    = new THREE.Scene();
    this.scene.background = new THREE.Color(this.C.bg);
    this.scene.fog        = new THREE.FogExp2(this.C.fog, 0.012);

    this.camera   = new THREE.PerspectiveCamera(42, w / h, 0.1, 500);
    this.camera.position.set(22, 20, 30);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffaf0, 0.9);
    sun.position.set(40, 80, 50);
    sun.castShadow = true;
    Object.assign(sun.shadow.camera, { near:1, far:200, left:-40, right:40, top:50, bottom:-40 });
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0xc8e0ff, 0.25);
    fill.position.set(-30, 20, -40);
    this.scene.add(fill);

    // Orbit controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping  = true;
    this.controls.dampingFactor  = 0.07;
    this.controls.minDistance    = 8;
    this.controls.maxDistance    = 90;
    this.controls.maxPolarAngle  = Math.PI * 0.48;
    this.controls.target.set(0, 9, 0);
    this.camera.lookAt(0, 9, 0);
  }

  _addEnvironment() {
    const C = this.C;

    // Ground plane
    const gGeo = new THREE.PlaneGeometry(120, 120);
    const gMat = new THREE.MeshLambertMaterial({ color: C.ground });
    const ground = new THREE.Mesh(gGeo, gMat);
    ground.rotation.x   = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(120, 60, C.grid, C.grid);
    grid.material.opacity    = 0.35;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Compass rose (will rotate with orientation)
    this._buildCompass();
  }

  _buildCompass() {
    if (this._compass) this.scene.remove(this._compass);
    const C = this.C;
    this._compass = new THREE.Group();

    // Ring
    const ringGeo = new THREE.TorusGeometry(2.2, 0.06, 8, 48);
    const ringMat = new THREE.MeshLambertMaterial({ color: C.compassRing });
    this._compass.add(new THREE.Mesh(ringGeo, ringMat));

    // North spike (red)
    const nGeo = new THREE.ConeGeometry(0.18, 1.1, 6);
    const nMat = new THREE.MeshLambertMaterial({ color: C.compassN });
    const nSpike = new THREE.Mesh(nGeo, nMat);
    nSpike.position.set(0, 0, -2.2);
    nSpike.rotation.x = Math.PI / 2;
    this._compass.add(nSpike);

    // South spike (grey)
    const sGeo = new THREE.ConeGeometry(0.14, 0.8, 6);
    const sMat = new THREE.MeshLambertMaterial({ color: C.compassRing });
    const sSpike = new THREE.Mesh(sGeo, sMat);
    sSpike.position.set(0, 0, 2.2);
    sSpike.rotation.x = -Math.PI / 2;
    this._compass.add(sSpike);

    this._compass.position.set(12, 0.05, 12);
    this._compass.rotation.x = Math.PI / 2; // lay flat on ground
    this.scene.add(this._compass);
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
  _mesh(geo, color, opacity = 1) {
    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      shininess: opacity < 1 ? 80 : 20,
      side: THREE.FrontSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.castShadow    = true;
    m.receiveShadow = true;
    return m;
  }

  _box(w, h, d, color, opacity = 1) {
    return this._mesh(new THREE.BoxGeometry(w, h, d), color, opacity);
  }

  _addEdges(mesh, group) {
    const eg  = new THREE.EdgesGeometry(mesh.geometry);
    const em  = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.12, transparent: true });
    const el  = new THREE.LineSegments(eg, em);
    el.position.copy(mesh.position);
    el.rotation.copy(mesh.rotation);
    group.add(el);
  }

  // ─── MAIN UPDATE ─────────────────────────────────────────────────────────────
  update(inputs) {
    this._lastInputs = inputs;
    if (this._pivot) this.scene.remove(this._pivot);

    this._pivot = new THREE.Group();
    this.scene.add(this._pivot);

    const { aptType, floor, totalFloors, size, glassRatio,
            construction, roofType, orientation, climate2050 } = inputs;

    const FH = 3.2; // metres per floor
    const C  = this.C;

    // ── Building dimensions by type
    let bW, bD;
    if (aptType === 2) {           // Gallery: long horizontal slab
      bW = Math.max(18, Math.min(30, Math.sqrt(size) * 4.0));
      bD = Math.max(7,  size / bW * 1.5);
    } else if (aptType === 3 || aptType === 4) {  // Corner
      bW = Math.max(12, Math.min(20, Math.sqrt(size * 1.5)));
      bD = bW * 0.80;
    } else {                       // Standard tower
      bW = Math.max(10, Math.min(18, Math.sqrt(size * 1.2)));
      bD = bW;
    }
    const bH = totalFloors * FH;

    // ── Body colour by construction
    const bodyColor = construction === 0 ? C.wood
                    : construction <= 2  ? C.hybrid
                    : C.concrete;

    // ── Main building shell
    const shell = this._box(bW, bH, bD, bodyColor);
    shell.position.set(0, bH / 2, 0);
    this._pivot.add(shell);
    this._addEdges(shell, this._pivot);

    // ── Window grid
    this._addWindows(bW, bD, FH, totalFloors, glassRatio, aptType, C);

    // ── Gallery: open corridor ledges
    if (aptType === 2) this._addGallery(bW, bD, FH, totalFloors, C);

    // ── Highlighted apartment floor (blue band)
    this._addHighlight(floor, FH, bW, bD, aptType, C);

    // ── Roof
    if (roofType > 0) {
      const roofColor = roofType === 2 ? C.roofGreen : C.roofBlack;
      const roof = this._box(bW + 0.2, 0.35, bD + 0.2, roofColor);
      roof.position.set(0, bH + 0.18, 0);
      this._pivot.add(roof);
      if (roofType === 2) this._addGreenRoofVegetation(bW, bD, bH, C);
    }

    // ── Orientation: rotate pivot so main facade faces camera (fixed S=front)
    // orientation index: 0=N,1=NE,2=E,3=SE,4=S,5=SW,6=W,7=NW
    // Camera looks from south → to show north facade, rotate 180°
    const ORIENT_Y = [Math.PI, Math.PI*3/4, Math.PI/2, Math.PI/4,
                      0, -Math.PI/4, -Math.PI/2, -Math.PI*3/4];
    this._pivot.rotation.y = ORIENT_Y[orientation];

    // ── Compass: rotate to match orientation (N arrow always points north)
    if (this._compass) {
      // compass is flat (rotation.x = PI/2), rotate around Y in world space
      this._compass.rotation.z = -ORIENT_Y[orientation];
    }

    // ── Fog tint on 2050
    this.scene.fog = climate2050
      ? new THREE.FogExp2(0xff8c42, 0.007)
      : new THREE.FogExp2(this.C.fog, 0.012);

    // ── Camera target at mid-height
    this.controls.target.set(0, bH * 0.38, 0);
  }

  // ─── WINDOWS ─────────────────────────────────────────────────────────────────
  _addWindows(bW, bD, FH, totalFloors, glassRatio, aptType, C) {
    const colCount = Math.max(3, Math.round(bW / 2.8));
    const colW     = bW / colCount;
    const winW     = colW * Math.min(0.90, glassRatio * 1.8);
    const winH     = FH  * Math.min(0.80, glassRatio * 1.6);

    // Which faces get windows
    // 0=single:front | 1=double-core:front+back | 2=gallery:front only
    // 3=corner:front+right | 4=corner+double:front+back+right
    const faces = {
      0: ['front'],
      1: ['front', 'back'],
      2: ['front'],
      3: ['front', 'right'],
      4: ['front', 'back', 'right'],
    }[aptType] || ['front'];

    for (let f = 0; f < totalFloors; f++) {
      const y = f * FH + FH / 2;

      if (faces.includes('front')) {
        for (let c = 0; c < colCount; c++) {
          const x = (c - (colCount - 1) / 2) * colW;
          const w = this._box(winW, winH, 0.04, C.windowGlass, 0.55);
          w.position.set(x, y, bD / 2 + 0.02);
          this._pivot.add(w);
        }
      }

      if (faces.includes('back')) {
        for (let c = 0; c < colCount; c++) {
          const x = (c - (colCount - 1) / 2) * colW;
          const w = this._box(winW, winH, 0.04, C.windowGlass, 0.40);
          w.position.set(x, y, -bD / 2 - 0.02);
          this._pivot.add(w);
        }
      }

      if (faces.includes('right')) {
        const sideCol = Math.max(2, Math.round(bD / 2.8));
        const sColW   = bD / sideCol;
        const sWinW   = sColW * Math.min(0.88, glassRatio * 1.6);
        for (let c = 0; c < sideCol; c++) {
          const z = (c - (sideCol - 1) / 2) * sColW;
          const w = this._box(0.04, winH, sWinW, C.windowGlass, 0.45);
          w.position.set(bW / 2 + 0.02, y, z);
          this._pivot.add(w);
        }
      }
    }
  }

  // ─── GALLERY LEDGES ──────────────────────────────────────────────────────────
  _addGallery(bW, bD, FH, totalFloors, C) {
    for (let f = 0; f < totalFloors; f++) {
      const y = f * FH;

      // Floor slab overhang
      const ledge = this._box(bW, 0.18, 1.8, C.gallery);
      ledge.position.set(0, y, bD / 2 + 0.9);
      this._pivot.add(ledge);

      // Railing posts
      const posts = Math.max(4, Math.round(bW / 2.0));
      for (let p = 0; p < posts; p++) {
        const x    = -bW / 2 + (p + 0.5) * (bW / posts);
        const post = this._box(0.06, 1.0, 0.06, C.railing);
        post.position.set(x, y + 0.59, bD / 2 + 1.74);
        this._pivot.add(post);
      }

      // Horizontal rail
      const rail = this._box(bW, 0.06, 0.06, C.railing);
      rail.position.set(0, y + 1.0, bD / 2 + 1.74);
      this._pivot.add(rail);
    }
  }

  // ─── HIGHLIGHTED APARTMENT ───────────────────────────────────────────────────
  _addHighlight(floor, FH, bW, bD, aptType, C) {
    const aptH = FH * 0.82;
    const yPos = (floor - 1) * FH + aptH / 2;
    let w, d, x, z;

    if (aptType === 2) {       // Gallery: one unit in the slab width
      w = bW * 0.22; d = bD * 0.80; x = -bW * 0.12; z = 0;
    } else if (aptType === 3 || aptType === 4) {  // Corner
      w = bW * 0.48; d = bD * 0.48; x = bW * 0.26; z = bD * 0.26;
    } else {
      w = bW * 0.88; d = bD * 0.80; x = 0; z = 0;
    }

    // Main highlight
    const apt = this._box(w, aptH, d, C.highlight, 0.80);
    apt.position.set(x, yPos, z);
    this._pivot.add(apt);

    // Soft glow envelope
    const glow = this._box(w + 0.3, aptH + 0.15, d + 0.3, C.highlightGlow, 0.14);
    glow.position.set(x, yPos, z);
    this._pivot.add(glow);

    // Floor indicator line on building face
    const lineH = 0.08;
    const line  = this._box(bW + 0.1, lineH, 0.06, C.highlight, 0.7);
    line.position.set(0, (floor - 1) * FH, bD / 2 + 0.04);
    this._pivot.add(line);
  }

  // ─── GREEN ROOF VEGETATION ───────────────────────────────────────────────────
  _addGreenRoofVegetation(bW, bD, bH, C) {
    const patches = 7;
    for (let i = 0; i < patches; i++) {
      const pw = 0.5 + Math.random() * 1.2;
      const ph = 0.15 + Math.random() * 0.5;
      const pd = 0.5 + Math.random() * 1.0;
      const patch = this._box(pw, ph, pd, C.roofGreen);
      patch.position.set(
        (Math.random() - 0.5) * bW * 0.75,
        bH + 0.35 + ph / 2,
        (Math.random() - 0.5) * bD * 0.70
      );
      this._pivot.add(patch);
    }
  }

  // ─── THEME SWITCH ────────────────────────────────────────────────────────────
  setTheme(isDark) {
    this.isDark = isDark;
    this.scene.background = new THREE.Color(this.C.bg);
    this.scene.fog = new THREE.FogExp2(this.C.fog, 0.012);
    // Rebuild compass with new colours
    this._buildCompass();
    // Re-render environment
    // (full rebuild happens on next update() call)
    if (this._lastInputs) this.update(this._lastInputs);
  }

  // ─── ANIMATE ─────────────────────────────────────────────────────────────────
  _animate() {
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _resize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(rect.width  || this.container.clientWidth  || 100, 100);
    const h = Math.max(rect.height || this.container.clientHeight || 380, 100);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
