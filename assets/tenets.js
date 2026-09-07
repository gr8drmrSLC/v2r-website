(function () {
  var canvas = document.getElementById('tenets-canvas');
  var labelContainer = document.getElementById('tenets-labels');
  if (!canvas || !labelContainer || typeof THREE === 'undefined') return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 5.4);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var group = new THREE.Group();
  group.rotation.x = 0.2;
  scene.add(group);

  // V2ADV's real Five Disciplines, in their real order -- this is a
  // reference diagram, not ambient decoration, so it stays legible: no
  // continuous rotation (labels would swing through each other), just a
  // fixed, slightly tilted ring.
  var names = ['Understand', 'Organize', 'Execute', 'Learn', 'Improve'];
  var ringRadius = 1.9;
  var basePositions = names.map(function (n, i) {
    var angle = (i / names.length) * Math.PI * 2 - Math.PI / 2;
    return new THREE.Vector3(Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0);
  });

  // Very small drift -- alive, not static, but never enough to threaten
  // the ring's legibility as a sequence.
  var drift = basePositions.map(function () {
    return {
      phase: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
      speed: [0.1 + Math.random() * 0.08, 0.09 + Math.random() * 0.07],
      amp: 0.03 + Math.random() * 0.02
    };
  });
  var current = basePositions.map(function (p) { return p.clone(); });

  function makeStarSprite() {
    var size = 256;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var cx = size / 2, cy = size / 2;

    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.1, 'rgba(255,255,255,1)');
    g.addColorStop(0.28, 'rgba(150,230,235,0.95)');
    g.addColorStop(0.5, 'rgba(34,199,221,0.75)');
    g.addColorStop(0.75, 'rgba(13,74,84,0.3)');
    g.addColorStop(1, 'rgba(13,74,84,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    ctx.globalCompositeOperation = 'lighter';
    var spikes = [
      { angle: 0, len: size * 0.5, width: size * 0.05, alpha: 1 },
      { angle: Math.PI / 2, len: size * 0.5, width: size * 0.05, alpha: 1 },
      { angle: Math.PI / 4, len: size * 0.32, width: size * 0.028, alpha: 0.55 },
      { angle: -Math.PI / 4, len: size * 0.32, width: size * 0.028, alpha: 0.55 }
    ];
    spikes.forEach(function (s) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(s.angle);
      var sg = ctx.createLinearGradient(-s.len, 0, s.len, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,' + s.alpha + ')');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(-s.len, -s.width / 2, s.len * 2, s.width);
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-over';

    var tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  // A soft, large glow sitting behind the ring -- reads as a sphere the
  // five points sit on, not a bare flat outline floating in empty space.
  // Plain radial falloff, no star spikes (those distort badly at this scale).
  function makeGlowOnly() {
    var size = 256;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(34,199,221,0.6)');
    g.addColorStop(0.5, 'rgba(34,199,221,0.22)');
    g.addColorStop(1, 'rgba(34,199,221,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }
  var glowMat = new THREE.PointsMaterial({
    map: makeGlowOnly(), color: 0xffffff, size: ringRadius * 2.7, transparent: true,
    opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false
  });
  var glowGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -0.4)]);
  group.add(new THREE.Points(glowGeo, glowMat));

  var starTex = makeStarSprite();
  var pointObjs = current.map(function (pos) {
    var geo = new THREE.BufferGeometry().setFromPoints([pos]);
    var mat = new THREE.PointsMaterial({
      map: starTex, color: 0xffffff, size: 0.55, transparent: true,
      opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false
    });
    var pts = new THREE.Points(geo, mat);
    group.add(pts);
    return pts;
  });

  // Each edge's pulse phase is offset around the ring, not random --
  // brightness travels Understand -> Organize -> Execute -> Learn ->
  // Improve -> back to Understand in one continuous lap. This is meant
  // to visualize the real cyclical method, not just decorate the shape.
  var lapSeconds = 7;
  var edgeLines = names.map(function (n, i) {
    var a = current[i], b = current[(i + 1) % names.length];
    var geo = new THREE.BufferGeometry().setFromPoints([a, b]);
    var mat = new THREE.LineBasicMaterial({
      color: 0x22c7dd, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var line = new THREE.Line(geo, mat);
    line.userData.pair = [i, (i + 1) % names.length];
    line.userData.offset = (i / names.length) * lapSeconds;
    group.add(line);
    return line;
  });

  var labelEls = names.map(function (n) {
    var el = document.createElement('div');
    el.textContent = n;
    el.style.cssText = 'position:absolute; transform:translate(-50%,-50%); font-size:12px; font-weight:800; letter-spacing:0.05em; text-transform:uppercase; color:#dffbff; text-shadow:0 0 8px rgba(34,199,221,0.85), 0 0 2px rgba(0,0,0,0.8); white-space:nowrap; pointer-events:none;';
    labelContainer.appendChild(el);
    return el;
  });

  var fitted = false;
  function fitCanvas() {
    var parent = canvas.parentElement;
    var w = parent.clientWidth, h = parent.clientHeight;
    if (!w || !h) return false;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return true;
  }
  window.addEventListener('resize', fitCanvas);
  fitted = fitCanvas();
  if (!fitted) {
    // The parent's size (sticky + aspect-ratio) can read as zero the
    // instant this script runs, before layout has actually settled --
    // if that first fit is skipped, nothing ever retries and the
    // renderer stays stuck at a broken size. Keep trying every frame
    // until it succeeds, rather than only on the next window resize.
    (function waitForLayout() {
      if (fitCanvas()) return;
      requestAnimationFrame(waitForLayout);
    })();
  }

  var clock = new THREE.Clock();
  var tmpV = new THREE.Vector3();

  function updatePositions(t) {
    for (var i = 0; i < basePositions.length; i++) {
      var d = drift[i];
      current[i].set(
        basePositions[i].x + Math.sin(t * d.speed[0] + d.phase[0]) * d.amp,
        basePositions[i].y + Math.sin(t * d.speed[1] + d.phase[1]) * d.amp,
        0
      );
      var pos = pointObjs[i].geometry.attributes.position;
      pos.setXYZ(0, current[i].x, current[i].y, current[i].z);
      pos.needsUpdate = true;
    }
    edgeLines.forEach(function (line) {
      var pair = line.userData.pair;
      var pos = line.geometry.attributes.position;
      pos.setXYZ(0, current[pair[0]].x, current[pair[0]].y, current[pair[0]].z);
      pos.setXYZ(1, current[pair[1]].x, current[pair[1]].y, current[pair[1]].z);
      pos.needsUpdate = true;
    });
  }

  function updateLabels() {
    group.updateMatrixWorld(true);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    labelEls.forEach(function (el, i) {
      tmpV.copy(current[i]).applyMatrix4(group.matrixWorld).project(camera);
      el.style.left = ((tmpV.x * 0.5 + 0.5) * w) + 'px';
      el.style.top = ((-tmpV.y * 0.5 + 0.5) * h) + 'px';
    });
  }

  function render() {
    var t = clock.getElapsedTime();
    updatePositions(t);
    edgeLines.forEach(function (line) {
      var local = ((t + line.userData.offset) % lapSeconds) / lapSeconds;
      var pulse = Math.pow(Math.max(0, Math.cos(local * Math.PI * 2)), 3);
      line.material.opacity = 0.18 + pulse * 0.6;
    });
    renderer.render(scene, camera);
    updateLabels();
  }

  if (reduceMotion) {
    edgeLines.forEach(function (line) { line.material.opacity = 0.4; });
    renderer.render(scene, camera);
    updateLabels();
  } else {
    (function loop() {
      render();
      requestAnimationFrame(loop);
    })();
  }
})();
