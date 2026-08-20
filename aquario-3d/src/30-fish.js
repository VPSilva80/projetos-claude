/* Espécies. `len` está em unidades de cena; `height`/`width` são frações de `len`.
   O corpo é comprimido lateralmente (width < height), como num peixe de verdade. */
const SPECIES = [
  { name: 'palhaço',   len: 5.0, height: 0.42, width: 0.20, seed: 3,
    back: '#e8701a', belly: '#ffc37a', bands: 3, bandColor: '#fbf4e8', bandWidth: 0.06,
    fin: '#f08a2a', finEdge: '#1b1005', tail: 1.0, dorsal: 0.9 },
  { name: 'cirurgião', len: 6.2, height: 0.52, width: 0.16, seed: 11,
    back: '#1d5fc8', belly: '#5aa8ee', bands: 1, bandColor: '#0b1f3d', bandWidth: 0.09, bandAlpha: 0.55,
    fin: '#f2c92f', finEdge: '#3a2c00', tail: 1.1, dorsal: 1.15 },
  { name: 'amarelo',   len: 4.6, height: 0.60, width: 0.15, seed: 5,
    back: '#f2c516', belly: '#ffe998', bands: 0, bandColor: '#fff',
    fin: '#e8ba00', finEdge: '#4a3a00', tail: 0.95, dorsal: 1.3 },
  { name: 'anjo',      len: 5.6, height: 0.66, width: 0.13, seed: 17,
    back: '#e6e0d0', belly: '#fbf8ef', bands: 4, bandColor: '#2a2318', bandWidth: 0.05, bandSkew: 0.3,
    fin: '#e3c46a', finEdge: '#2a2318', tail: 1.25, dorsal: 1.45 },
  { name: 'cardeal',   len: 2.8, height: 0.34, width: 0.14, seed: 23,
    back: '#cf3a34', belly: '#f6b9ab', bands: 1, bandColor: '#26262a', bandWidth: 0.05,
    fin: '#f3e4da', finEdge: '#5a1a16', tail: 0.9, dorsal: 0.7 },
  { name: 'guppy',     len: 2.5, height: 0.30, width: 0.12, seed: 31,
    back: '#6d4fe0', belly: '#c3b0ff', bands: 0, bandColor: '#fff',
    fin: '#ff6fd0', finEdge: '#3a1358', tail: 1.7, dorsal: 0.8 },
  { name: 'neon',      len: 2.2, height: 0.28, width: 0.11, seed: 37,
    back: '#1fb9cc', belly: '#e6fafd', bands: 1, bandColor: '#e0404f', bandWidth: 0.30, bandAlpha: 0.5, bandSkew: 0,
    fin: '#a8e8f2', finEdge: '#0a3b42', tail: 0.85, dorsal: 0.6 },
  { name: 'borboleta', len: 4.4, height: 0.58, width: 0.14, seed: 43,
    back: '#f0bd35', belly: '#fdf1c8', bands: 5, bandColor: '#b8790d', bandWidth: 0.035, bandSkew: 0.35,
    fin: '#e8ae20', finEdge: '#3d2c04', tail: 1.0, dorsal: 1.2 },
];

/* Corpo: anéis elípticos ao longo de Z (o peixe olha para +Z, que é a direção
   para onde Object3D.lookAt vira uma malha comum). */
const WIDEST = 0.58;   // ponto mais alto do corpo, medido da cauda ao focinho

function bodyProfile(u) {
  u = clamp(u, 0, 1);
  const t = u < WIDEST ? (WIDEST - u) / WIDEST : (u - WIDEST) / (1 - WIDEST);
  const ellipse = Math.sqrt(Math.max(0, 1 - t * t));
  // afina o pedúnculo, senão o peixe fica com cara de bolha
  const st = clamp(u / 0.3, 0, 1);
  const taper = 0.32 + 0.68 * (st * st * (3 - 2 * st));
  return ellipse * taper;
}

// meia-largura e meia-altura do corpo em um ponto qualquer, para
// encaixar olhos e peitorais exatamente na superfície
function bodyRadii(sp, u) {
  const p = bodyProfile(u);
  return { rx: sp.len * sp.width * 0.5 * p, ry: sp.len * sp.height * 0.5 * p };
}

function makeFishBody(sp, rings = 30, sides = 16) {
  const L = sp.len;
  const H = L * sp.height;
  const W = L * sp.width;

  const positions = [], normals = [], uvs = [], bodyU = [], indices = [];
  const profile = bodyProfile;

  for (let i = 0; i <= rings; i++) {
    const u = i / rings;                       // 0 = cauda, 1 = focinho
    const z = -L / 2 + u * L;
    const p = profile(u);
    // barriga um pouco mais cheia que o dorso
    const ry = H * 0.5 * p;
    const rx = W * 0.5 * p;
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * TAU;             // 0 = dorso
      const cy = Math.cos(a), sx = Math.sin(a);
      const belly = cy < 0 ? 1.14 : 1.0;       // engorda a barriga
      positions.push(sx * rx, cy * ry * belly, z);
      normals.push(sx, cy, 0);
      uvs.push(u, j / sides);
      bodyU.push(u);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j;
      const b = a + sides + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('aBody', new THREE.Float32BufferAttribute(bodyU, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* Nadadeira: leque plano no plano XY, preso na origem. */
function makeFinGeo(len, spread, curve = 0.35, segments = 10) {
  const positions = [], uvs = [], indices = [], bodyU = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;                       // 0 = raiz, 1 = ponta
    const x = -len * t;
    const half = spread * (0.18 + t * 0.82) * 0.5;
    const droop = Math.sin(t * Math.PI) * curve * spread * 0.25;
    positions.push(x, half + droop, 0);
    positions.push(x, -half + droop, 0);
    uvs.push(t, 1, t, 0);
    bodyU.push(0, 0);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('aBody', new THREE.Float32BufferAttribute(bodyU, 1));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* Injeta a ondulação da natação no vertex shader.
   A onda percorre o corpo da cabeça para a cauda e cresce em direção à cauda. */
function addSwim(material, uniforms) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.time;
    shader.uniforms.uSwim = uniforms.swim;   // amplitude x frequência x fase
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>',
        '#include <common>\nuniform float uTime;\nuniform vec3 uSwim;\nattribute float aBody;')
      .replace('#include <begin_vertex>', `
        #include <begin_vertex>
        float tailW = pow(1.0 - aBody, 1.7);
        float wave = sin(aBody * uSwim.y - uTime * 7.0 + uSwim.z) * uSwim.x * tailW;
        transformed.x += wave;
        // guinada leve do focinho, na direção contrária
        transformed.x -= sin(uTime * 7.0 - uSwim.z) * uSwim.x * 0.18 * pow(aBody, 3.0);
      `)
      .replace('#include <defaultnormal_vertex>', `
        #include <defaultnormal_vertex>
        float dW = cos(aBody * uSwim.y - uTime * 7.0 + uSwim.z) * uSwim.x * uSwim.y * pow(1.0 - aBody, 1.7);
        transformedNormal = normalize(transformedNormal + vec3(0.0, 0.0, dW * 0.28));
      `);
  };
  material.customProgramCacheKey = () => 'swim';
}

const skinCache = new Map();
function skinFor(sp) {
  if (!skinCache.has(sp.name)) skinCache.set(sp.name, makeFishSkin(sp));
  return skinCache.get(sp.name);
}
const finTexCache = new Map();
function finTexFor(sp) {
  if (!finTexCache.has(sp.name)) finTexCache.set(sp.name, makeFinTex(sp.fin, sp.finEdge));
  return finTexCache.get(sp.name);
}

class Fish {
  constructor() {
    const sp = pick(SPECIES);
    this.sp = sp;
    this.scale = rand(0.72, 1.35);

    this.uniforms = {
      time: shared.time,
      swim: { value: new THREE.Vector3(sp.len * 0.055, 5.4, rand(0, TAU)) },
    };

    this.group = new THREE.Group();

    // ---- corpo
    const skin = skinFor(sp);
    const bodyMat = new THREE.MeshStandardMaterial({
      map: skin.map,
      roughnessMap: skin.roughnessMap,
      normalMap: makeScaleNormal(),
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughness: 0.34, metalness: 0.18, envMapIntensity: 1.5,
    });
    addSwim(bodyMat, this.uniforms);
    this.body = new THREE.Mesh(makeFishBody(sp), bodyMat);
    this.group.add(this.body);

    // ---- nadadeiras
    const finTex = finTexFor(sp);
    const finMat = new THREE.MeshStandardMaterial({
      map: finTex, transparent: true, opacity: 0.95,
      side: THREE.DoubleSide, roughness: 0.5, metalness: 0.04,
      depthWrite: false, alphaTest: 0.02,
    });
    addSwim(finMat, this.uniforms);
    this.finMat = finMat;

    const L = sp.len, H = L * sp.height;

    // caudal — presa na ponta da cauda, oscila junto com a onda do corpo
    this.tail = new THREE.Mesh(makeFinGeo(L * 0.38 * sp.tail, H * 1.15 * sp.tail, 0.5), finMat);
    this.tail.rotation.y = Math.PI / 2;
    this.tail.position.z = -L * 0.5;
    this.group.add(this.tail);

    // dorsal
    const dorsal = new THREE.Mesh(makeFinGeo(L * 0.34, H * 0.62 * sp.dorsal, 0.7), finMat);
    dorsal.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
    dorsal.position.set(0, bodyRadii(sp, 0.55).ry * 0.96, L * 0.02);
    this.group.add(dorsal);

    // ventral
    const anal = new THREE.Mesh(makeFinGeo(L * 0.22, H * 0.4, 0.6), finMat);
    anal.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
    anal.position.set(0, -bodyRadii(sp, 0.4).ry * 0.96, -L * 0.14);
    this.group.add(anal);

    // peitorais, uma de cada lado, batendo
    const uPect = 0.66;
    const rPect = bodyRadii(sp, uPect);
    this.pects = [];
    for (const side of [1, -1]) {
      const p = new THREE.Mesh(makeFinGeo(L * 0.19, H * 0.3, 0.5), finMat);
      p.position.set(side * rPect.rx * 0.92, -rPect.ry * 0.28, -L * 0.5 + uPect * L);
      p.rotation.y = side * 0.55;
      p.rotation.z = -0.2;
      p.userData.side = side;
      this.group.add(p);
      this.pects.push(p);
    }

    // ---- olhos, encostados na superfície do corpo
    const uEye = 0.83;
    const rEye = bodyRadii(sp, uEye);
    const zEye = -L * 0.5 + uEye * L;
    const eyeR = Math.min(H * 0.1, rEye.rx * 0.8);
    const eyeGeo = new THREE.SphereGeometry(eyeR, 14, 12);
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.2, metalness: 0.0 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x07090d, roughness: 0.06, metalness: 0.4 });
    for (const side of [1, -1]) {
      const eye = new THREE.Mesh(eyeGeo, scleraMat);
      eye.position.set(side * (rEye.rx - eyeR * 0.35), rEye.ry * 0.34, zEye);
      this.group.add(eye);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.55, 12, 10), irisMat);
      iris.position.set(side * (rEye.rx + eyeR * 0.12), rEye.ry * 0.34, zEye + eyeR * 0.16);
      this.group.add(iris);
    }

    this.group.scale.setScalar(this.scale);

    // ---- estado de nado
    this.pos = new THREE.Vector3(
      rand(-TANK.w * 0.45, TANK.w * 0.45),
      rand(TANK.floor + 4, TANK.h * 0.55),
      rand(-TANK.d * 0.7, TANK.d * 0.35),
    );
    this.dir = new THREE.Vector3(rand(-1, 1), 0, rand(-1, 1)).normalize();
    this.baseSpeed = rand(3.2, 6.4) / this.scale;
    this.speed = this.baseSpeed;
    this.target = new THREE.Vector3();
    this.lureOffset = new THREE.Vector3(rand(-5, 5), rand(-3, 3), rand(-5, 5));
    this.wait = 0;
    this.pickTarget();
    this.group.position.copy(this.pos);
    scene.add(this.group);
  }

  pickTarget() {
    this.target.set(
      rand(-TANK.w * 0.5, TANK.w * 0.5),
      rand(TANK.floor + 3.5, TANK.h * 0.6),
      rand(-TANK.d * 0.8, TANK.d * 0.35),
    );
    this.wait = rand(2.5, 7);
  }

  dispose() {
    scene.remove(this.group);
    this.group.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
  }

  update(dt, t) {
    // prioridade: ração > ponto tocado > passeio
    let boost = 1;
    const food = nearestFood(this.pos, 26);
    if (food) {
      this.target.copy(food.pos);
      boost = 2.7;
      if (this.pos.distanceToSquared(food.pos) < 1.9 * 1.9) food.eaten = true;
    } else if (lure.active) {
      this.target.copy(lure.pos).add(this.lureOffset);
      const d = this.pos.distanceTo(this.target);
      boost = d > 3 ? 2.2 : 0.4;
      this.wait = rand(0.5, 1.4);
    } else {
      this.wait -= dt;
      if (this.wait <= 0 || this.pos.distanceToSquared(this.target) < 9) this.pickTarget();
    }

    // desvia das paredes do tanque
    const want = this.target.clone().sub(this.pos);
    const m = 8;
    if (this.pos.x < -TANK.w * 0.55 + m) want.x += (-TANK.w * 0.55 + m - this.pos.x) * 3;
    if (this.pos.x > TANK.w * 0.55 - m) want.x -= (this.pos.x - (TANK.w * 0.55 - m)) * 3;
    if (this.pos.y < TANK.floor + 3) want.y += (TANK.floor + 3 - this.pos.y) * 4;
    if (this.pos.y > TANK.h * 0.62) want.y -= (this.pos.y - TANK.h * 0.62) * 4;
    if (this.pos.z < -TANK.d * 0.9) want.z += (-TANK.d * 0.9 - this.pos.z) * 3;
    if (this.pos.z > TANK.d * 0.42) want.z -= (this.pos.z - TANK.d * 0.42) * 3;

    if (want.lengthSq() > 1e-6) {
      want.normalize();
      // curva suave: nada gira instantaneamente
      this.dir.lerp(want, clamp(dt * 1.5, 0, 1)).normalize();
    }

    this.speed = lerp(this.speed, this.baseSpeed * boost, dt * 2.2);
    const v = this.speed * CFG.speed;
    this.pos.addScaledVector(this.dir, v * dt);

    // a batida da cauda acompanha a velocidade
    const sw = this.uniforms.swim.value;
    sw.x = this.sp.len * 0.055 * (0.7 + (this.speed / this.baseSpeed) * 0.5);

    this.group.position.copy(this.pos);
    const look = this.pos.clone().add(this.dir);
    this.group.lookAt(look);
    // inclina para dentro da curva
    this.group.rotation.z += Math.sin(t * 7 + sw.z) * 0.05;

    // caudal e peitorais acompanham a onda
    const phase = Math.sin(-t * 7 * CFG.speed + sw.z);
    this.tail.rotation.z = phase * 0.5;
    const flap = Math.sin(t * 9 * CFG.speed + sw.z) * 0.4;
    for (const p of this.pects) p.rotation.z = -0.2 + flap * p.userData.side;
  }
}

const fishes = [];

function syncFishCount() {
  const want = Math.round(clamp(CFG.fishCount, 1, 45));
  while (fishes.length > want) fishes.pop().dispose();
  while (fishes.length < want) fishes.push(new Fish());
}
