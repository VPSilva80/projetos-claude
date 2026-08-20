function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = opts.wrap || THREE.RepeatWrapping;
  if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1]);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// areia: mapa de cor e mapa de normais derivados do mesmo campo de altura
function makeSand(size = 512) {
  const noise = valueNoise(7);
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      height[y * size + x] = fbm(noise, (x / size) * 6, (y / size) * 6, 5);
    }
  }
  const at = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];

  const colC = document.createElement('canvas'); colC.width = colC.height = size;
  const norC = document.createElement('canvas'); norC.width = norC.height = size;
  const cg = colC.getContext('2d'), ng = norC.getContext('2d');
  const cimg = cg.createImageData(size, size), nimg = ng.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const h = height[y * size + x];
      let grain = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      if (grain < 0) grain += 1;
      const tone = 0.6 + h * 0.34 + grain * 0.17;
      cimg.data[i]     = clamp(tone * 216, 0, 255);
      cimg.data[i + 1] = clamp(tone * 201, 0, 255);
      cimg.data[i + 2] = clamp(tone * 170, 0, 255);
      cimg.data[i + 3] = 255;

      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.4 + (grain - 0.5) * 0.9;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 2.4;
      const len = Math.hypot(-dx, -dy, 1);
      nimg.data[i]     = ((-dx / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 3] = 255;
    }
  }
  cg.putImageData(cimg, 0, 0);
  ng.putImageData(nimg, 0, 0);

  const map = new THREE.CanvasTexture(colC);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(9, 6);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;

  const normalMap = new THREE.CanvasTexture(norC);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(9, 6);
  normalMap.anisotropy = 8;

  return { map, normalMap };
}

/* Pele do peixe. A textura é mapeada com u = ao longo do corpo (0 cauda, 1 focinho)
   e v = ao redor do corpo (0 e 1 no dorso, 0.5 na barriga). */
function makeFishSkin(sp) {
  const W = 512, H = 256;
  const colC = document.createElement('canvas'); colC.width = W; colC.height = H;
  const g = colC.getContext('2d');

  // base: dorso escuro, barriga clara
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0.00, sp.back);
  grad.addColorStop(0.30, sp.back);
  grad.addColorStop(0.50, sp.belly);
  grad.addColorStop(0.70, sp.back);
  grad.addColorStop(1.00, sp.back);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  // faixas verticais
  if (sp.bands > 0) {
    g.globalAlpha = sp.bandAlpha ?? 0.85;
    g.fillStyle = sp.bandColor;
    for (let b = 0; b < sp.bands; b++) {
      const u = 0.18 + (b + 0.5) / sp.bands * 0.66;
      const w = W * (sp.bandWidth ?? 0.055);
      g.save();
      g.translate(u * W, 0);
      g.transform(1, 0, sp.bandSkew ?? 0.18, 1, 0, 0);
      g.fillRect(-w / 2, 0, w, H);
      g.restore();
    }
    g.globalAlpha = 1;
  }

  // escamas
  const noise = valueNoise(sp.seed || 3);
  const cell = 11;
  g.globalAlpha = 0.26;
  for (let y = 0; y < H; y += cell * 0.62) {
    for (let x = 0; x < W; x += cell) {
      const off = ((y / (cell * 0.62)) | 0) % 2 ? cell * 0.5 : 0;
      const n = fbm(noise, x * 0.02, y * 0.02, 3);
      g.beginPath();
      g.arc(x + off, y, cell * 0.52, Math.PI * 0.15, Math.PI * 0.85);
      g.strokeStyle = n > 0.5 ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.8)';
      g.lineWidth = 1.1;
      g.stroke();
    }
  }
  g.globalAlpha = 1;

  // brilho especular ao longo da linha lateral
  const sheen = g.createLinearGradient(0, H * 0.34, 0, H * 0.5);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,.22)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = sheen;
  g.fillRect(0, H * 0.30, W, H * 0.24);

  // escurece a região da cauda, onde o corpo afina
  const tail = g.createLinearGradient(0, 0, W * 0.16, 0);
  tail.addColorStop(0, 'rgba(0,0,0,.35)');
  tail.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = tail;
  g.fillRect(0, 0, W * 0.16, H);

  const map = new THREE.CanvasTexture(colC);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  map.wrapS = map.wrapT = THREE.ClampToEdgeWrapping;

  // rugosidade: escamas brilham mais que as nadadeiras
  const roughC = document.createElement('canvas'); roughC.width = W; roughC.height = H;
  const rg = roughC.getContext('2d');
  const rgrad = rg.createLinearGradient(0, 0, 0, H);
  rgrad.addColorStop(0, '#6e6e6e');
  rgrad.addColorStop(0.5, '#3a3a3a');
  rgrad.addColorStop(1, '#6e6e6e');
  rg.fillStyle = rgrad;
  rg.fillRect(0, 0, W, H);
  const roughnessMap = new THREE.CanvasTexture(roughC);
  roughnessMap.anisotropy = 4;

  return { map, roughnessMap };
}

// Nadadeira: membrana translúcida com raios. A ponta some em alfa em vez de
// escurecer — nadadeira com ponta opaca escura lê como triângulo de papelão.
function makeFinTex(color, edge) {
  return canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);

    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0.00, color);
    grad.addColorStop(0.62, color);
    grad.addColorStop(1.00, '#ffffff');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);

    // raios da membrana
    g.strokeStyle = 'rgba(255,255,255,.32)';
    g.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      const y = (i + 0.5) / 16 * h;
      g.beginPath();
      g.moveTo(0, h / 2 + (y - h / 2) * 0.22);
      g.lineTo(w, y);
      g.stroke();
    }

    // rim escuro fininho só na beirada externa
    g.strokeStyle = edge;
    g.globalAlpha = 0.5;
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(w - 5, 0);
    g.lineTo(w - 5, h);
    g.stroke();
    g.globalAlpha = 1;

    // alfa: opaca na raiz, quase transparente na ponta
    const a = g.createLinearGradient(0, 0, w, 0);
    a.addColorStop(0.00, 'rgba(0,0,0,1)');
    a.addColorStop(0.55, 'rgba(0,0,0,.88)');
    a.addColorStop(1.00, 'rgba(0,0,0,.18)');
    g.globalCompositeOperation = 'destination-in';
    g.fillStyle = a;
    g.fillRect(0, 0, w, h);
  }, { wrap: THREE.ClampToEdgeWrapping });
}

// Relevo de escamas, compartilhado por todas as espécies. Gera um campo de
// altura com arcos sobrepostos e converte em mapa de normais.
let _scaleNormal = null;
function makeScaleNormal() {
  if (_scaleNormal) return _scaleNormal;
  const W = 512, H = 256;
  const hc = document.createElement('canvas'); hc.width = W; hc.height = H;
  const hg = hc.getContext('2d');
  hg.fillStyle = '#808080';
  hg.fillRect(0, 0, W, H);

  const cell = 13;
  for (let y = -cell; y < H + cell; y += cell * 0.58) {
    for (let x = -cell; x < W + cell; x += cell) {
      const off = (Math.round(y / (cell * 0.58)) % 2) ? cell * 0.5 : 0;
      const g2 = hg.createRadialGradient(x + off, y - cell * 0.2, 0, x + off, y - cell * 0.2, cell * 0.62);
      g2.addColorStop(0, 'rgba(255,255,255,.55)');
      g2.addColorStop(0.72, 'rgba(140,140,140,.35)');
      g2.addColorStop(1, 'rgba(0,0,0,.30)');
      hg.fillStyle = g2;
      hg.beginPath();
      hg.arc(x + off, y, cell * 0.6, 0, TAU);
      hg.fill();
    }
  }

  const src = hg.getImageData(0, 0, W, H).data;
  const nc = document.createElement('canvas'); nc.width = W; nc.height = H;
  const ng = nc.getContext('2d');
  const nimg = ng.createImageData(W, H);
  const at = (x, y) => src[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.6;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 2.6;
      const len = Math.hypot(-dx, -dy, 1);
      nimg.data[i]     = ((-dx / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 3] = 255;
    }
  }
  ng.putImageData(nimg, 0, 0);

  _scaleNormal = new THREE.CanvasTexture(nc);
  _scaleNormal.wrapS = _scaleNormal.wrapT = THREE.ClampToEdgeWrapping;
  _scaleNormal.anisotropy = 8;
  return _scaleNormal;
}

// pontinho redondo e suave, usado por bolhas distantes, ração e partículas
function makeDotTex(inner, outer) {
  return canvasTex(64, 64, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, inner);
    grad.addColorStop(1, outer);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }, { wrap: THREE.ClampToEdgeWrapping });
}
