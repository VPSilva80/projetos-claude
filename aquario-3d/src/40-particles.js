// ---------------------------------------------------------------- bolhas
const MAX_BUBBLES = 420;
const bubbles = [];
let bubbleMesh = null;
let bubbleAcc = 0;
const bubblerPos = new THREE.Vector3(TANK.w * 0.34, TANK.floor + 0.5, -TANK.d * 0.35);

function bubbleMaterial() {
  // esfera de vidro barata: brilho de borda (fresnel) somado ao fundo
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: { uTint: { value: new THREE.Color(0xdff5ff) } },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uTint;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
        float core = smoothstep(0.9, 0.0, f) * 0.10;
        vec3 col = uTint * (f * 1.5 + core);
        gl_FragColor = vec4(col, clamp(f * 0.95 + core, 0.0, 0.92));
      }
    `,
  });
}

function buildBubbles() {
  const geo = new THREE.SphereGeometry(1, 12, 10);
  bubbleMesh = new THREE.InstancedMesh(geo, bubbleMaterial(), MAX_BUBBLES);
  bubbleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bubbleMesh.frustumCulled = false;
  bubbleMesh.count = 0;
  scene.add(bubbleMesh);
}

function spawnBubble(x, y, z, r) {
  if (bubbles.length >= MAX_BUBBLES) return;
  bubbles.push({
    pos: new THREE.Vector3(x, y, z),
    r, vy: rand(3.5, 7) * (0.5 + r), phase: rand(0, TAU), wob: rand(0.5, 1.8),
  });
}

const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();

function updateBubbles(dt, t) {
  bubbleAcc += dt;
  const rate = 0.045;
  while (bubbleAcc > rate) {
    bubbleAcc -= rate;
    spawnBubble(bubblerPos.x + rand(-0.6, 0.6), bubblerPos.y, bubblerPos.z + rand(-0.6, 0.6), rand(0.06, 0.24));
  }
  if (Math.random() < dt * 1.5) {
    spawnBubble(rand(-TANK.w * 0.5, TANK.w * 0.5), TANK.floor + 0.4, rand(-TANK.d * 0.8, TANK.d * 0.3), rand(0.04, 0.12));
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.pos.y += b.vy * dt;
    b.pos.x += Math.sin(t * 2.4 + b.phase) * b.wob * dt;
    b.pos.z += Math.cos(t * 1.9 + b.phase) * b.wob * 0.6 * dt;
    if (b.pos.y > TANK.h * 0.92) bubbles.splice(i, 1);
  }

  for (let i = 0; i < bubbles.length; i++) {
    const b = bubbles[i];
    _s.setScalar(b.r);
    _m4.compose(b.pos, _q, _s);
    bubbleMesh.setMatrixAt(i, _m4);
  }
  bubbleMesh.count = bubbles.length;
  bubbleMesh.instanceMatrix.needsUpdate = true;
}

// difusor visível na base da coluna
function buildBubbler() {
  const geo = new THREE.CylinderGeometry(1.1, 1.35, 0.9, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.85, metalness: 0.2 });
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(bubblerPos).setY(TANK.floor + 0.25);
  scene.add(m);
}

// ---------------------------------------------------------------- ração
const MAX_FOOD = 240;
const foods = [];
let foodMesh = null;

function buildFood() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_FOOD * 3), 3));
  const mat = new THREE.PointsMaterial({
    size: 0.5, map: makeDotTex('rgba(226,182,96,1)', 'rgba(160,110,40,0)'),
    transparent: true, depthWrite: false, sizeAttenuation: true,
  });
  foodMesh = new THREE.Points(geo, mat);
  foodMesh.frustumCulled = false;
  scene.add(foodMesh);
}

function dropFood(p) {
  for (let i = 0; i < 16 && foods.length < MAX_FOOD; i++) {
    foods.push({
      pos: p.clone().add(new THREE.Vector3(rand(-2.5, 2.5), rand(-1, 1.5), rand(-2.5, 2.5))),
      vy: -rand(0.8, 2.1), phase: rand(0, TAU), life: rand(16, 26), eaten: false,
    });
  }
}

function nearestFood(from, maxDist) {
  let best = null, bestD = maxDist * maxDist;
  for (const f of foods) {
    const d = from.distanceToSquared(f.pos);
    if (d < bestD) { bestD = d; best = f; }
  }
  return best;
}

function updateFood(dt, t) {
  const arr = foodMesh.geometry.attributes.position.array;
  for (let i = foods.length - 1; i >= 0; i--) {
    const f = foods[i];
    f.life -= dt;
    f.pos.y += f.vy * dt;
    f.pos.x += Math.sin(t * 1.2 + f.phase) * 0.6 * dt;
    if (f.eaten || f.life <= 0 || f.pos.y < TANK.floor + 0.4) foods.splice(i, 1);
  }
  for (let i = 0; i < foods.length; i++) {
    arr[i * 3] = foods[i].pos.x;
    arr[i * 3 + 1] = foods[i].pos.y;
    arr[i * 3 + 2] = foods[i].pos.z;
  }
  foodMesh.geometry.setDrawRange(0, foods.length);
  foodMesh.geometry.attributes.position.needsUpdate = true;
}

// ---------------------------------------------------------------- partículas em suspensão
let snowMesh = null;
let snowData = null;

function buildSnow() {
  const N = 900;
  const pos = new Float32Array(N * 3);
  snowData = [];
  for (let i = 0; i < N; i++) {
    const p = new THREE.Vector3(
      rand(-TANK.w, TANK.w),
      rand(TANK.floor, TANK.h),
      rand(-TANK.d * 1.1, TANK.d * 0.6),
    );
    snowData.push({ p, vy: rand(-0.5, 0.25), vx: rand(-0.3, 0.3), phase: rand(0, TAU) });
    pos.set([p.x, p.y, p.z], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.16, map: makeDotTex('rgba(220,244,255,.9)', 'rgba(200,235,255,0)'),
    transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true,
  });
  snowMesh = new THREE.Points(geo, mat);
  snowMesh.frustumCulled = false;
  scene.add(snowMesh);
}

function updateSnow(dt, t) {
  const arr = snowMesh.geometry.attributes.position.array;
  for (let i = 0; i < snowData.length; i++) {
    const s = snowData[i];
    s.p.y += s.vy * dt;
    s.p.x += (s.vx + Math.sin(t * 0.4 + s.phase) * 0.35) * dt;
    if (s.p.y < TANK.floor) s.p.y = TANK.h;
    if (s.p.y > TANK.h) s.p.y = TANK.floor;
    arr[i * 3] = s.p.x; arr[i * 3 + 1] = s.p.y; arr[i * 3 + 2] = s.p.z;
  }
  snowMesh.geometry.attributes.position.needsUpdate = true;
}

// ---------------------------------------------------------------- ponto tocado
const lure = { pos: new THREE.Vector3(), life: 0, active: false, held: false };
let lureRing = null;

function buildLureRing() {
  const geo = new THREE.RingGeometry(0.72, 0.8, 48);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xbfe9ff, transparent: true, opacity: 0, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  });
  lureRing = new THREE.Mesh(geo, mat);
  lureRing.visible = false;
  scene.add(lureRing);
}

function updateLure(dt) {
  if (lure.active) {
    if (!lure.held) lure.life -= dt;
    if (lure.life <= 0) lure.active = false;
  }
  if (lureRing) {
    const show = lure.active;
    lureRing.visible = show;
    if (show) {
      lureRing.position.copy(lure.pos);
      lureRing.quaternion.copy(camera.quaternion);
      const age = clamp(1 - lure.life / 4, 0, 1);
      lureRing.scale.setScalar(1 + age * 7);
      lureRing.material.opacity = (1 - age) * 0.22;
    }
  }
}

function touchTank(point) {
  lure.pos.copy(point);
  lure.life = 4;
  lure.active = true;
  dropFood(point);
}
