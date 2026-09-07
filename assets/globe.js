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

  function makeGlowSprite() {
    var size = 128;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.2, 'rgba(220,250,255,1)');
    g.addColorStop(0.45, 'rgba(0,195,255,0.9)');
    g.addColorStop(0.75, 'rgba(0,150,255,0.5)');
    g.addColorStop(1, 'rgba(0,150,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  var nodeGeo = new THREE.BufferGeometry().setFromPoints(nodePoints);
  var nodeMat = new THREE.PointsMaterial({
    map: makeGlowSprite(), color: 0xffffff, size: 0.26, transparent: true,
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
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    group.rotation.x = 0.15;
    group.rotation.y = 0.6;
    renderer.render(scene, camera);
  } else {
    (function loop() {
      render();
      requestAnimationFrame(loop);
    })();
  }
})();
