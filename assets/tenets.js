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

  // Nodes stay fixed exactly on the circle -- this is a reference
  // diagram of a real, ordered cycle, so geometric correctness (a true
  // circle, arrows reading clearly) matters more here than the organic
  // wobble used elsewhere on the site.
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

  // A true circle, not a five-sided polygon: sample many points around
  // the ring and drive per-vertex color, so a bright "comet" of light
  // can travel continuously around a real curve. Direction of travel
  // (Understand -> Organize -> Execute -> Learn -> Improve -> back to
  // Understand) matches increasing angle, i.e. counterclockwise here.
  var startAngle = -Math.PI / 2;
  var segments = 128;
  var ringPositions = new Float32Array((segments + 1) * 3);
  var ringFractions = [];
  for (var s = 0; s <= segments; s++) {
    var frac = s / segments;
    var ang = startAngle + frac * Math.PI * 2;
    ringPositions[s * 3] = Math.cos(ang) * ringRadius;
    ringPositions[s * 3 + 1] = Math.sin(ang) * ringRadius;
    ringPositions[s * 3 + 2] = 0;
    ringFractions.push(frac);
  }
  var ringColors = new Float32Array((segments + 1) * 3);
  var ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
  ringGeo.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));
  var ringMat = new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  var ringLine = new THREE.Line(ringGeo, ringMat);
  group.add(ringLine);
  var lapSeconds = 7;

  // Small arrowheads at the midpoint of each leg, pointing tangent to
  // the circle in the direction of travel -- an explicit, unambiguous
  // "this is the order" marker, not just implied by the moving glow.
  function buildArrow(angle) {
    var size = 0.16;
    var shape = new THREE.Shape();
    shape.moveTo(size, 0);
    shape.lineTo(-size * 0.6, size * 0.6);
    shape.lineTo(-size * 0.6, -size * 0.6);
    shape.lineTo(size, 0);
    var geo = new THREE.ShapeGeometry(shape);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x22c7dd, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geo, mat);
    var tangent = angle + Math.PI / 2;
    mesh.position.set(Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0.01);
    mesh.rotation.z = tangent;
    return mesh;
  }
  for (var ai = 0; ai < names.length; ai++) {
    var a0 = startAngle + (ai / names.length) * Math.PI * 2;
    var a1 = startAngle + ((ai + 1) / names.length) * Math.PI * 2;
    group.add(buildArrow((a0 + a1) / 2));
  }

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

  var baseColor = new THREE.Color(0x22c7dd);
  var hotColor = new THREE.Color(0xdffbff);
  var tmpColor = new THREE.Color();

  function updateRingPulse(t) {
    var colorAttr = ringGeo.attributes.color;
    for (var s = 0; s <= segments; s++) {
      var local = ((t / lapSeconds + ringFractions[s]) % 1 + 1) % 1;
      var pulse = Math.pow(Math.max(0, Math.cos(local * Math.PI * 2)), 5);
      var brightness = 0.16 + pulse * 0.84;
      tmpColor.copy(baseColor).lerp(hotColor, pulse).multiplyScalar(brightness);
      colorAttr.setXYZ(s, tmpColor.r, tmpColor.g, tmpColor.b);
    }
    colorAttr.needsUpdate = true;
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
    updateRingPulse(t);
    renderer.render(scene, camera);
    updateLabels();
  }

  if (reduceMotion) {
    updateRingPulse(0);
    renderer.render(scene, camera);
    updateLabels();
  } else {
    (function loop() {
      render();
      requestAnimationFrame(loop);
    })();
  }
})();
