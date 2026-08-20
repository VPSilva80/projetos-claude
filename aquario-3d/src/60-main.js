// ---------------------------------------------------------------- qualidade
const QUALITY = {
  alta:  { dpr: 1.75, snow: true,  rays: 10 },
  media: { dpr: 1.25, snow: true,  rays: 6 },
  baixa: { dpr: 1.0,  snow: false, rays: 3 },
};

function applyQuality() {
  const q = QUALITY[CFG.quality] || QUALITY.alta;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q.dpr));
  if (snowMesh) snowMesh.visible = q.snow;
  if (rayGroup) {
    rayGroup.children.forEach((m, i) => { m.visible = CFG.rays && i < q.rays; });
  }
  resize();
}

function applyLight() {
  sunLight.intensity = BASE_LIGHT.sun * CFG.light;
  fillLight.intensity = BASE_LIGHT.fill * lerp(0.45, 1, CFG.light);
  rimLight.intensity = BASE_LIGHT.rim * CFG.light;
  shared.caustic.value = CFG.light;
  renderer.toneMappingExposure = 1.08 * lerp(0.8, 1.12, clamp(CFG.light, 0, 2) / 2);
}

function applyMurk() {
  scene.fog.density = 0.018 * CFG.murk;
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// ---------------------------------------------------------------- interação
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
// plano vertical no meio do tanque: converte o clique 2D num ponto 3D na água
const touchPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 6);
const hit = new THREE.Vector3();

function pointFromEvent(e) {
  ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  if (!raycaster.ray.intersectPlane(touchPlane, hit)) return null;
  hit.x = clamp(hit.x, -TANK.w * 0.5, TANK.w * 0.5);
  hit.y = clamp(hit.y, TANK.floor + 2.5, TANK.h * 0.6);
  return hit;
}

canvas.addEventListener('pointerdown', (e) => {
  const p = pointFromEvent(e);
  if (!p) return;
  lure.held = true;
  touchTank(p);
});
canvas.addEventListener('pointermove', (e) => {
  if (!lure.held) return;
  const p = pointFromEvent(e);
  if (p) lure.pos.copy(p);
});
const release = () => { lure.held = false; };
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);
window.addEventListener('blur', release);

let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});

// ---------------------------------------------------------------- painel
const painel = document.getElementById('painel');
const outs = {};
document.querySelectorAll('[data-out]').forEach((el) => { outs[el.dataset.out] = el; });

function bind(id, apply, fmt) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'checkbox') el.checked = CFG[id];
  else el.value = CFG[id];
  if (outs[id]) outs[id].textContent = fmt ? fmt(CFG[id]) : CFG[id];

  el.addEventListener('input', () => {
    const val = el.type === 'checkbox' ? el.checked
      : el.type === 'range' ? parseFloat(el.value)
      : el.value;
    CFG[id] = val;
    if (outs[id]) outs[id].textContent = fmt ? fmt(val) : val;
    if (apply) apply(val);
  });
}

const oneDecimal = (v) => v.toFixed(1);
bind('fishCount', syncFishCount);
bind('speed', null, oneDecimal);
bind('light', applyLight, oneDecimal);
bind('murk', applyMurk, oneDecimal);
bind('quality', applyQuality);
bind('rays', applyQuality);

function setSom(on) {
  CFG.som = on;
  const el = document.getElementById('som');
  if (el) el.checked = on;
  if (on) Ambience.start(); else Ambience.stop();
}
const somEl = document.getElementById('som');
if (somEl) somEl.addEventListener('change', () => setSom(somEl.checked));

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k === 's') painel.classList.toggle('aberto');
  if (e.key === 'Escape') painel.classList.remove('aberto');
  if (k === 'm') setSom(!CFG.som);
  if (k === 'f') {
    touchTank(new THREE.Vector3(rand(-TANK.w * 0.3, TANK.w * 0.3), TANK.h * 0.4, rand(-8, 4)));
  }
});

// ---------------------------------------------------------------- montagem
buildEnvironment();
buildFloor();
buildRocks();
buildPlants();
buildRays();
buildBubbles();
buildBubbler();
buildFood();
buildSnow();
buildLureRing();
syncFishCount();
applyLight();
applyMurk();
applyQuality();

const aviso = document.getElementById('carregando');
if (aviso) {
  aviso.classList.add('pronto');
  setTimeout(() => aviso.remove(), 700);
}

// integração com programas de wallpaper
const applyExternal = (name, val) => {
  if (!(name in CFG)) return;
  if (name === 'quality' && typeof val === 'number') val = ['alta', 'media', 'baixa'][val] || 'alta';
  CFG[name] = val;
  if (name === 'fishCount') syncFishCount();
  if (name === 'light') applyLight();
  if (name === 'murk') applyMurk();
  if (name === 'quality' || name === 'rays') applyQuality();
  if (name === 'som') setSom(val);
};
window.livelyPropertyListener = applyExternal;
window.wallpaperPropertyListener = {
  applyUserProperties(props) { for (const k in props) applyExternal(k, props[k].value); },
};

// ---------------------------------------------------------------- laço
let last = performance.now();
let clock = 0;
const camHome = camera.position.clone();

function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden) { last = now; return; }

  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.1) dt = 0.1;
  clock += dt * CFG.speed;
  const t = clock;

  shared.time.value = t;

  for (const f of fishes) f.update(dt, t);
  updateBubbles(dt, t);
  updateFood(dt, t);
  if (snowMesh && snowMesh.visible) updateSnow(dt, t);
  updateLure(dt);

  if (rayGroup) {
    for (const m of rayGroup.children) {
      m.material.opacity = m.userData.base * (0.65 + 0.35 * Math.sin(t * 0.5 + m.userData.phase));
      m.rotation.y = m.userData.phase + Math.sin(t * 0.15 + m.userData.phase) * 0.12;
    }
  }

  // deriva lenta da câmera: tira a sensação de imagem parada
  camera.position.x = camHome.x + Math.sin(t * 0.07) * 2.2;
  camera.position.y = camHome.y + Math.sin(t * 0.05 + 1.3) * 1.1;
  camera.lookAt(0, -1.5, -12);

  renderer.render(scene, camera);
}

resize();
requestAnimationFrame(frame);
