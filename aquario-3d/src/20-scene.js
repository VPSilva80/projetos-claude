const canvas = document.getElementById('tank');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: false, powerPreference: 'high-performance',
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
camera.position.set(0, 5.5, 44);

const WATER = new THREE.Color(0x11577f);
scene.fog = new THREE.FogExp2(WATER.getHex(), 0.018);
scene.background = WATER.clone();

// ---------------------------------------------------------------- ambiente
// céu de água gerado por código, usado como reflexo especular nos peixes
function buildEnvironment() {
  const tex = canvasTex(512, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.00, '#c7f2ff');
    grad.addColorStop(0.30, '#43a8d0');
    grad.addColorStop(0.62, '#0e5075');
    grad.addColorStop(1.00, '#041e2c');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const sunGlow = g.createRadialGradient(w * 0.34, h * 0.09, 0, w * 0.34, h * 0.09, h * 0.45);
    sunGlow.addColorStop(0, 'rgba(255,255,255,.95)');
    sunGlow.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sunGlow;
    g.fillRect(0, 0, w, h);
  });
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  tex.dispose();
}

// ---------------------------------------------------------------- luzes
const sunLight = new THREE.DirectionalLight(0xe8f8ff, 2.45);
sunLight.position.set(-9, 42, 16);
scene.add(sunLight);

const fillLight = new THREE.HemisphereLight(0x9adcf5, 0x14384a, 0.55);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x74d4ee, 0.45);
rimLight.position.set(14, 7, -24);
scene.add(rimLight);

const BASE_LIGHT = { sun: sunLight.intensity, fill: fillLight.intensity, rim: rimLight.intensity };

// ---------------------------------------------------------------- cáusticas
const CAUSTIC_GLSL = `
  // Rede de cáusticas: o domínio é distorcido algumas vezes e as linhas brilhantes
  // nascem onde o produto dos senos passa por zero. Fica limitada a [0,1] por
  // construção — a fórmula clássica de shadertoy satura e chapa tudo de branco.
  float causticLayer(vec2 p, float t) {
    vec2 q = p;
    float acc = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      q += vec2(sin(q.y * 1.3 + t * (0.7 + fi * 0.28)),
                cos(q.x * 1.1 - t * (0.9 - fi * 0.18))) * 0.45;
      float ridge = abs(sin(q.x * 1.15) * sin(q.y * 1.15));
      acc += pow(1.0 - ridge, 11.0);
    }
    return clamp(acc / 3.0, 0.0, 1.0);
  }
`;

const shared = {
  time: { value: 0 },
  caustic: { value: 1 },
};

function applyCaustics(material, scale, strength) {
  const key = 'caustic_' + scale + '_' + strength;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shared.time;
    shader.uniforms.uCaustic = shared.caustic;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <worldpos_vertex>',
        '#include <worldpos_vertex>\n\tvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>',
        '#include <common>\nvarying vec3 vWPos;\nuniform float uTime;\nuniform float uCaustic;\n' + CAUSTIC_GLSL)
      .replace('#include <emissivemap_fragment>', `
        #include <emissivemap_fragment>
        {
          float cst = causticLayer(vWPos.xz * ${scale.toFixed(4)}, uTime * 0.32);
          totalEmissiveRadiance += vec3(0.48, 0.86, 0.95) * cst * ${strength.toFixed(3)} * uCaustic;
        }
      `);
  };
  material.customProgramCacheKey = () => key;
}

// ---------------------------------------------------------------- chão
function buildFloor() {
  const { map, normalMap } = makeSand(512);
  const geo = new THREE.PlaneGeometry(TANK.w * 2.8, TANK.d * 3.4, 130, 96);
  const pos = geo.attributes.position;
  const noise = valueNoise(19);
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, (fbm(noise, pos.getX(i) * 0.032, pos.getY(i) * 0.032, 3) - 0.5) * 2.8);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    map, normalMap,
    normalScale: new THREE.Vector2(1.6, 1.6),
    roughness: 0.95, metalness: 0.02,
    color: 0x8e816a,
  });
  applyCaustics(mat, 0.5, 0.6);

  const floor = new THREE.Mesh(geo, mat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = TANK.floor;
  scene.add(floor);
}

// ---------------------------------------------------------------- pedras
function buildRocks() {
  const noise = valueNoise(41);
  const mat = new THREE.MeshStandardMaterial({ color: 0x585448, roughness: 0.92, metalness: 0.03 });
  applyCaustics(mat, 0.5, 0.4);

  const v = new THREE.Vector3();
  for (let i = 0; i < 12; i++) {
    const r = rand(1.5, 5.4);
    const geo = new THREE.IcosahedronGeometry(r, 3);
    const pos = geo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      v.fromBufferAttribute(pos, j);
      const n = fbm(noise, v.x * 0.5 + i * 13, v.z * 0.5 + v.y * 0.3, 4);
      v.multiplyScalar(0.76 + n * 0.52);
      pos.setXYZ(j, v.x, v.y * 0.6, v.z);
    }
    geo.computeVertexNormals();

    const rock = new THREE.Mesh(geo, mat);
    rock.position.set(
      rand(-TANK.w * 0.58, TANK.w * 0.58),
      TANK.floor + rand(-0.6, 0.6),
      rand(-TANK.d * 0.85, TANK.d * 0.3),
    );
    rock.rotation.set(rand(0, TAU), rand(0, TAU), rand(0, TAU));
    scene.add(rock);
  }
}

// ---------------------------------------------------------------- plantas
function plantMaterial(color) {
  const mat = new THREE.MeshStandardMaterial({
    color, roughness: 0.68, metalness: 0.0,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(color).multiplyScalar(0.12),
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shared.time;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>',
        '#include <common>\nuniform float uTime;\nattribute float aSway;')
      .replace('#include <begin_vertex>', `
        #include <begin_vertex>
        float up = clamp(uv.y, 0.0, 1.0);
        float bend = up * up;
        transformed.x += sin(uTime * 0.85 + aSway) * bend * 2.7;
        transformed.z += cos(uTime * 0.66 + aSway * 1.7) * bend * 1.6;
        transformed.x += sin(uTime * 2.4 + aSway + up * 5.0) * bend * 0.4;
      `);
  };
  mat.customProgramCacheKey = () => 'plant';
  return mat;
}

function makeBlade(h, w, sway) {
  const geo = new THREE.PlaneGeometry(w, h, 1, 14);
  geo.translate(0, h / 2, 0);
  // afina em direção à ponta
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const t = uv.getY(i);
    pos.setX(i, pos.getX(i) * (1 - t * 0.82));
  }
  const swayAttr = new Float32Array(pos.count).fill(sway);
  geo.setAttribute('aSway', new THREE.BufferAttribute(swayAttr, 1));
  return geo;
}

function buildPlants() {
  const greens = [0x27703a, 0x2f8a46, 0x1b6344, 0x3f9137, 0x155a3d, 0x4aa053];
  const clusters = 22;
  for (let c = 0; c < clusters; c++) {
    const cx = rand(-TANK.w * 0.6, TANK.w * 0.6);
    const cz = rand(-TANK.d * 0.9, TANK.d * 0.25);
    const color = pick(greens);
    const mat = plantMaterial(color);
    const blades = 6 + ((Math.random() * 8) | 0);
    for (let b = 0; b < blades; b++) {
      const h = rand(6, 20);
      const geo = makeBlade(h, rand(0.32, 0.95), rand(0, TAU));
      const m = new THREE.Mesh(geo, mat);
      m.position.set(cx + rand(-2.4, 2.4), TANK.floor - 0.4, cz + rand(-2, 2));
      m.rotation.y = rand(0, TAU);
      m.rotation.z = rand(-0.16, 0.16);
      scene.add(m);
    }
  }
}

// ---------------------------------------------------------------- raios de sol
let rayGroup = null;

function buildRays() {
  rayGroup = new THREE.Group();
  const tex = canvasTex(64, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.00, 'rgba(200,244,255,.9)');
    grad.addColorStop(0.42, 'rgba(150,222,250,.32)');
    grad.addColorStop(1.00, 'rgba(120,200,240,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const side = g.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(0,0,0,1)');
    side.addColorStop(0.5, 'rgba(0,0,0,0)');
    side.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = side;
    g.fillRect(0, 0, w, h);
  }, { wrap: THREE.ClampToEdgeWrapping });

  for (let i = 0; i < 10; i++) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, opacity: rand(0.14, 0.3), side: THREE.DoubleSide, fog: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(rand(3, 9), 78), mat);
    m.position.set(rand(-TANK.w * 0.7, TANK.w * 0.7), 16, rand(-TANK.d * 0.95, TANK.d * 0.35));
    m.rotation.z = rand(-0.2, 0.2);
    m.rotation.y = rand(-0.55, 0.55);
    m.userData.base = mat.opacity;
    m.userData.phase = rand(0, TAU);
    rayGroup.add(m);
  }
  scene.add(rayGroup);
}
