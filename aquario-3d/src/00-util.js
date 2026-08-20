const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;

const CFG = {
  fishCount: 18,
  speed: 1,
  light: 1,
  murk: 1,
  quality: 'alta',
  som: false,
  rays: true,
};

new URLSearchParams(location.search).forEach((raw, k) => {
  if (!(k in CFG)) return;
  const cur = CFG[k];
  if (typeof cur === 'number') { const n = parseFloat(raw); if (!isNaN(n)) CFG[k] = n; }
  else if (typeof cur === 'boolean') CFG[k] = raw !== '0' && raw !== 'false';
  else CFG[k] = raw;
});

// dimensões do tanque, em unidades de cena
const TANK = { w: 62, h: 30, d: 34, floor: -14 };

// ruído de valor com oitavas, usado para areia, pedras e escamas
function valueNoise(seed) {
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  const perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y) => {
    const u = (h & 1) ? x : y, v = (h & 2) ? x : y;
    return ((h & 4) ? -u : u) + ((h & 8) ? -v : v);
  };
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = p[p[X] + Y], ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y], bb = p[p[X + 1] + Y + 1];
    const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
    const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
    return (lerp(x1, x2, v) + 1) * 0.5;
  };
}

function fbm(noise, x, y, oct = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += noise(x * f, y * f) * a; f *= 2; a *= 0.5; }
  return v;
}
