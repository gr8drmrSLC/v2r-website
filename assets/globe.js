(function () {
  var canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var group = new THREE.Group();
  scene.add(group);

  function gauss(spread) {
    return ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * spread;
  }

  // Irregular, interconnected cluster -- not a bounded shape like a globe,
  // meant to read as many different capabilities (marketing, research,
  // automation...) connected together toward one objective, rather than
  // a generic "we operate worldwide" wireframe planet.
  //
  // Two tiers, on purpose: a business needs both a foundation that holds
  // and a layer that responds. Anchors (few, bigger, calm) are that
  // foundation -- visible now, not just an invisible generation bias.
  // Satellites (many, smaller, carrying the labeled business functions)
  // drift more freely around their own anchor, the ebb and flow.
  var anchorCount = 4;
  var basePositions = [];
  var nodeSizes = [];
  var anchorIndices = [];
  var anchorWords = ['Mission', 'Vision', 'Values', 'Principles'];
  for (var a = 0; a < anchorCount; a++) {
    anchorIndices.push(basePositions.length);
    basePositions.push(new THREE.Vector3(
      (Math.random() - 0.5) * 4.4,
      (Math.random() - 0.5) * 3.2,
      (Math.random() - 0.5) * 2.6
    ));
    nodeSizes.push(0.7);
  }

  var satelliteCount = 74;
  var satelliteParent = [];
  for (var i = 0; i < satelliteCount; i++) {
    var parentIdx = anchorIndices[Math.floor(Math.random() * anchorIndices.length)];
    var anchor = basePositions[parentIdx];
    basePositions.push(new THREE.Vector3(
      anchor.x + gauss(1.3),
      anchor.y + gauss(1.05),
      anchor.z + gauss(1.0)
    ));
    nodeSizes.push(0.4);
    satelliteParent.push({ index: basePositions.length - 1, parent: parentIdx });
  }

  // Anchors drift on a much calmer, smaller cycle than satellites -- not
  // frozen (a perfectly static node next to drifting ones would read as
  // broken, not intentional), just visibly steadier and heavier. The
  // contrast itself is the point: calm versus active, not still versus
  // moving.
  var anchorSet = {};
  anchorIndices.forEach(function (idx) { anchorSet[idx] = true; });
  var drift = basePositions.map(function (pos, idx) {
    if (anchorSet[idx]) {
      return {
        phase: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        speed: [0.04 + Math.random() * 0.05, 0.035 + Math.random() * 0.04, 0.04 + Math.random() * 0.04],
        amp: 0.04 + Math.random() * 0.03
      };
    }
    return {
      phase: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
      speed: [0.13 + Math.random() * 0.18, 0.1 + Math.random() * 0.15, 0.11 + Math.random() * 0.15],
      amp: 0.16 + Math.random() * 0.12
    };
  });
  var current = basePositions.map(function (p) { return p.clone(); });

  var edgeSet = {};
  var edgePairs = [];
  function addEdge(a2, b) {
    var key = Math.min(a2, b) + '_' + Math.max(a2, b);
    if (edgeSet[key]) return;
    edgeSet[key] = true;
    edgePairs.push([a2, b]);
  }

  // Every satellite connects to its own anchor -- the foundation is
  // never orphaned from what it supports.
  satelliteParent.forEach(function (s) { addEdge(s.index, s.parent); });

  // Anchors connect to each other -- even the fixed foundations are
  // interconnected, not isolated pillars.
  for (var ai = 0; ai < anchorIndices.length; ai++) {
    addEdge(anchorIndices[ai], anchorIndices[(ai + 1) % anchorIndices.length]);
  }

  // Organic proximity connections across the whole structure on top of
  // the guaranteed anchor relationships above.
  var k = 3;
  for (var p = 0; p < basePositions.length; p++) {
    var dists = [];
    for (var q = 0; q < basePositions.length; q++) {
      if (p === q) continue;
      dists.push({ j: q, d: basePositions[p].distanceTo(basePositions[q]) });
    }
    dists.sort(function (a1, b1) { return a1.d - b1.d; });
    for (var n = 0; n < k && n < dists.length; n++) addEdge(p, dists[n].j);
  }
  for (var extra = 0; extra < 6; extra++) {
    var ea = Math.floor(Math.random() * basePositions.length);
    var eb = Math.floor(Math.random() * basePositions.length);
    if (ea !== eb) addEdge(ea, eb);
  }

  // Each connection pulses on its own independent cycle, rather than the
  // structure holding one constant brightness.
  var edgeLines = edgePairs.map(function (pair) {
    var geo = new THREE.BufferGeometry().setFromPoints([current[pair[0]], current[pair[1]]]);
    var mat = new THREE.LineBasicMaterial({
      color: 0x22c7dd, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var line = new THREE.Line(geo, mat);
    line.userData.phase = Math.random() * Math.PI * 2;
    line.userData.speed = 0.15 + Math.random() * 0.35;
    line.userData.pair = pair;
    group.add(line);
    return line;
  });

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

  var starTex = makeStarSprite();
  var pointObjs = current.map(function (pos, idx) {
    var geo = new THREE.BufferGeometry().setFromPoints([pos]);
    var mat = new THREE.PointsMaterial({
      map: starTex, color: 0xffffff, size: nodeSizes[idx], transparent: true,
      opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false
    });
    var pts = new THREE.Points(geo, mat);
    group.add(pts);
    return pts;
  });

  // A handful of satellite points carry real business-function words --
  // hover near one and it lights up with a label, so the structure reads
  // as "this is all the interconnected parts of my business," not an
  // abstract cloud. This is discovery: you find these by exploring.
  var keywords = ['Marketing', 'Sales', 'Analytics', 'Operations', 'Logistics', 'Research', 'Automation', 'Training', 'Content', 'Profit', 'Growth', 'Support'];
  var eligible = satelliteParent.map(function (s) { return s.index; });
  for (var ei2 = eligible.length - 1; ei2 > 0; ei2--) {
    var swapIdx = Math.floor(Math.random() * (ei2 + 1));
    var tmpE = eligible[ei2]; eligible[ei2] = eligible[swapIdx]; eligible[swapIdx] = tmpE;
  }
  var keywordPoints = [];
  var wordCount = Math.min(keywords.length, eligible.length);
  for (var wi = 0; wi < wordCount; wi++) {
    keywordPoints.push({ index: eligible[wi], word: keywords[wi], screenX: 0, screenY: 0, front: false });
  }

  var tooltipEl = document.createElement('div');
  tooltipEl.style.cssText = 'position:absolute; transform:translate(-50%,-130%); padding:5px 10px; background:rgba(13,32,38,0.92); border:1px solid rgba(34,199,221,0.5); border-radius:6px; color:#dffbff; font-size:12px; font-weight:700; letter-spacing:0.02em; white-space:nowrap; pointer-events:none; opacity:0; transition:opacity 0.12s ease; z-index:3;';
  canvas.parentElement.appendChild(tooltipEl);

  // Anchor labels are the opposite of the satellite tooltip: always on,
  // not hover-gated. The foundation isn't something you discover by
  // exploring -- it's just plainly there, known, so the label is a
  // permanent caption (no box, just glowing text), not a popup.
  var anchorLabelEls = anchorIndices.map(function (idx, wIdx) {
    var el = document.createElement('div');
    el.textContent = anchorWords[wIdx];
    el.style.cssText = 'position:absolute; transform:translate(-50%,-50%); font-size:11px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; color:#dffbff; text-shadow:0 0 8px rgba(34,199,221,0.85), 0 0 2px rgba(0,0,0,0.8); white-space:nowrap; pointer-events:none; z-index:3;';
    canvas.parentElement.appendChild(el);
    return { el: el, index: idx };
  });

  var mouseX = -9999, mouseY = -9999;
  canvas.parentElement.addEventListener('mousemove', function (ev) {
    var rect = canvas.getBoundingClientRect();
    mouseX = ev.clientX - rect.left;
    mouseY = ev.clientY - rect.top;
  });
  canvas.parentElement.addEventListener('mouseleave', function () {
    mouseX = -9999; mouseY = -9999;
  });

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
  var tmpV = new THREE.Vector3();

  function updatePositions(t) {
    for (var i = 0; i < basePositions.length; i++) {
      var d = drift[i];
      current[i].set(
        basePositions[i].x + Math.sin(t * d.speed[0] + d.phase[0]) * d.amp,
        basePositions[i].y + Math.sin(t * d.speed[1] + d.phase[1]) * d.amp,
        basePositions[i].z + Math.sin(t * d.speed[2] + d.phase[2]) * d.amp
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

  function updateAnchorLabels(w, h) {
    anchorLabelEls.forEach(function (item) {
      tmpV.copy(current[item.index]).applyMatrix4(group.matrixWorld).project(camera);
      item.el.style.left = ((tmpV.x * 0.5 + 0.5) * w) + 'px';
      item.el.style.top = ((-tmpV.y * 0.5 + 0.5) * h - 18) + 'px';
      item.el.style.opacity = tmpV.z < 1 ? '1' : '0';
    });
  }

  function updateHover() {
    group.updateMatrixWorld(true);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    updateAnchorLabels(w, h);
    var nearest = null, nearestDist = 26;
    keywordPoints.forEach(function (kp) {
      tmpV.copy(current[kp.index]).applyMatrix4(group.matrixWorld).project(camera);
      kp.screenX = (tmpV.x * 0.5 + 0.5) * w;
      kp.screenY = (-tmpV.y * 0.5 + 0.5) * h;
      kp.front = tmpV.z < 1;
      if (!kp.front) return;
      var dx = kp.screenX - mouseX, dy = kp.screenY - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) { nearestDist = dist; nearest = kp; }
    });
    keywordPoints.forEach(function (kp) {
      pointObjs[kp.index].material.size = nodeSizes[kp.index] * (kp === nearest ? 1.5 : 1);
    });
    if (nearest) {
      tooltipEl.textContent = nearest.word;
      tooltipEl.style.left = nearest.screenX + 'px';
      tooltipEl.style.top = nearest.screenY + 'px';
      tooltipEl.style.opacity = '1';
    } else {
      tooltipEl.style.opacity = '0';
    }
  }

  function render() {
    var t = clock.getElapsedTime();
    group.rotation.y = t * 0.05;
    group.rotation.x = 0.12;
    updatePositions(t);
    for (var i = 0; i < edgeLines.length; i++) {
      var el = edgeLines[i];
      var pulse = (Math.sin(t * el.userData.speed + el.userData.phase) + 1) / 2;
      el.material.opacity = 0.14 + pulse * 0.55;
    }
    renderer.render(scene, camera);
    updateHover();
  }

  if (reduceMotion) {
    group.rotation.x = 0.12;
    group.rotation.y = 0.4;
    edgeLines.forEach(function (l) { l.material.opacity = 0.35; });
    renderer.render(scene, camera);
    updateHover();
  } else {
    (function loop() {
      render();
      requestAnimationFrame(loop);
    })();
  }
})();
