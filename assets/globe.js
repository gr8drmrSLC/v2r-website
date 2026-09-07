(function () {
  var canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6.8);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var group = new THREE.Group();
  scene.add(group);

  var RADIUS = 2.4;
  var icoGeo = new THREE.IcosahedronGeometry(RADIUS, 1);
  var positionAttr = icoGeo.attributes.position;
  var nodeCount = positionAttr.count;
  var nodePoints = [];
  for (var i = 0; i < nodeCount; i++) {
    nodePoints.push(new THREE.Vector3(
      positionAttr.getX(i), positionAttr.getY(i), positionAttr.getZ(i)
    ));
  }

  // Each edge pulses on its own independent cycle, rather than the
  // structure holding one constant brightness -- meant to read as a
  // living, adapting system (activity moving through the connections),
  // not a static shape that only spins.
  var wireGeo = new THREE.WireframeGeometry(icoGeo);
  var wirePos = wireGeo.attributes.position;
  var edgeLines = [];
  for (var e = 0; e < wirePos.count; e += 2) {
    var p1 = new THREE.Vector3().fromBufferAttribute(wirePos, e);
    var p2 = new THREE.Vector3().fromBufferAttribute(wirePos, e + 1);
    var edgeGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    var edgeMat = new THREE.LineBasicMaterial({
      color: 0x1f7aff, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var edgeLine = new THREE.Line(edgeGeo, edgeMat);
    edgeLine.userData.phase = Math.random() * Math.PI * 2;
    edgeLine.userData.speed = 0.15 + Math.random() * 0.35;
    edgeLines.push(edgeLine);
    group.add(edgeLine);
  }

  function makeStarSprite() {
    var size = 256;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var cx = size / 2, cy = size / 2;

    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.1, 'rgba(255,255,255,1)');
    g.addColorStop(0.28, 'rgba(130,205,255,0.95)');
    g.addColorStop(0.5, 'rgba(20,120,255,0.75)');
    g.addColorStop(0.75, 'rgba(10,60,200,0.3)');
    g.addColorStop(1, 'rgba(10,60,200,0)');
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

  var nodeGeo = new THREE.BufferGeometry().setFromPoints(nodePoints);
  var nodeMat = new THREE.PointsMaterial({
    map: makeStarSprite(), color: 0xffffff, size: 0.36, transparent: true,
    opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false
  });
  group.add(new THREE.Points(nodeGeo, nodeMat));

  function positionGroup() {
    group.position.x = window.innerWidth < 760 ? 0 : 1.6;
  }

  function fitCanvas() {
    var parent = canvas.parentElement;
    var w = parent.clientWidth;
    var h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    positionGroup();
  }

  window.addEventListener('resize', fitCanvas);
  fitCanvas();

  var clock = new THREE.Clock();

  function render() {
    var t = clock.getElapsedTime();
    group.rotation.y = t * 0.12;
    group.rotation.x = 0.15;
    for (var i = 0; i < edgeLines.length; i++) {
      var el = edgeLines[i];
      var pulse = (Math.sin(t * el.userData.speed + el.userData.phase) + 1) / 2;
      el.material.opacity = 0.12 + pulse * 0.55;
    }
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    group.rotation.x = 0.15;
    group.rotation.y = 0.6;
    for (var j = 0; j < edgeLines.length; j++) {
      edgeLines[j].material.opacity = 0.35;
    }
    renderer.render(scene, camera);
  } else {
    (function loop() {
      render();
      requestAnimationFrame(loop);
    })();
  }
})();
