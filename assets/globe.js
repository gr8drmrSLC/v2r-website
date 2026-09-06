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

  var wireGeo = new THREE.WireframeGeometry(icoGeo);
  var wireMat = new THREE.LineBasicMaterial({
    color: 0x1f7aff, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  group.add(new THREE.LineSegments(wireGeo, wireMat));

  var nodeGeo = new THREE.BufferGeometry().setFromPoints(nodePoints);
  var nodeMat = new THREE.PointsMaterial({
    color: 0x00c3ff, size: 0.13, transparent: true, opacity: 0.98,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  group.add(new THREE.Points(nodeGeo, nodeMat));

  function buildArc(a, b) {
    var dist = a.angleTo(b);
    var mid = a.clone().add(b).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(RADIUS * (1.15 + dist * 0.25));
    var curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    var geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    var mat = new THREE.LineBasicMaterial({
      color: 0x14b8ff, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var line = new THREE.Line(geo, mat);
    line.userData.phase = Math.random() * Math.PI * 2;
    line.userData.speed = 0.5 + Math.random() * 0.6;
    return line;
  }

  var arcs = [];
  var attempts = 0;
  while (arcs.length < 16 && attempts < 500) {
    attempts++;
    var ia = Math.floor(Math.random() * nodeCount);
    var ib = Math.floor(Math.random() * nodeCount);
    if (ia === ib) continue;
    var a = nodePoints[ia], b = nodePoints[ib];
    if (a.angleTo(b) < Math.PI * 0.42) continue;
    var arc = buildArc(a, b);
    arcs.push(arc);
    group.add(arc);
  }

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
    for (var i = 0; i < arcs.length; i++) {
      var arc = arcs[i];
      var pulse = (Math.sin(t * arc.userData.speed + arc.userData.phase) + 1) / 2;
      arc.material.opacity = 0.4 + pulse * 0.6;
    }
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    group.rotation.x = 0.15;
    group.rotation.y = 0.6;
    for (var j = 0; j < arcs.length; j++) {
      arcs[j].material.opacity = 0.6;
    }
    renderer.render(scene, camera);
  } else {
    (function loop() {
      render();
      requestAnimationFrame(loop);
    })();
  }
})();
