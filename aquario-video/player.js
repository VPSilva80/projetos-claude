/* Papel de parede em vídeo, com reescala em shader.
 *
 * A origem é uma gravação de tela de celular 640x360: tem barra de status,
 * barra de navegação do Android e os botões do app por cima da imagem. O player
 * recorta tudo isso, reproduz em laço só o trecho sem menu aberto e desenha o
 * quadro num canvas WebGL2 com:
 *
 *   - reamostragem bicúbica Catmull-Rom, no lugar do filtro bilinear do
 *     navegador, que é o que mais borra numa ampliação de 4x ou mais;
 *   - máscara de nitidez (unsharp mask) para recuperar a definição de borda;
 *   - leve realce de contraste e saturação, que a ampliação achata.
 *
 * Nada disso cria detalhe que não foi gravado — melhora a leitura, não a
 * resolução. Sem WebGL2, cai para o caminho simples com CSS.
 */
(() => {
  'use strict';

  const q = new URLSearchParams(location.search);
  const num = (k, p) => { const v = parseFloat(q.get(k)); return isNaN(v) ? p : v; };

  const SRC = q.get('src') || 'aquario.mp4';
  const CROP = { x: num('cx', 0), y: num('cy', 74), w: num('cw', 598), h: num('ch', 234) };
  const INICIO = num('inicio', 84);
  const FIM = num('fim', 101.5);
  const FADE = num('fade', 1.2);
  const NITIDEZ = num('nitidez', 0.85);
  const SATURACAO = num('saturacao', 1.1);
  const CONTRASTE = num('contraste', 1.05);
  const DPR_MAX = num('dpr', 1);

  const palco = document.getElementById('palco');
  const cv = document.getElementById('tela');
  const a = document.getElementById('a');
  const b = document.getElementById('b');
  const erro = document.getElementById('erro');

  let atual = a, proximo = b;
  let fundindo = false, mistura = 0;   // 0 = só `atual`, 1 = só `proximo`
  let comSom = false;

  [a, b].forEach((v) => {
    v.src = SRC;
    v.loop = false;
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = 'anonymous';
    v.addEventListener('error', () => { if (a.error && b.error) erro.classList.add('aparece'); });
  });

  const tocar = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };

  // ================================================================ WebGL
  const VS = `#version 300 es
    in vec2 aPos;
    out vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      vUv.y = 1.0 - vUv.y;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }`;

  const FS = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;

    uniform sampler2D uA;
    uniform sampler2D uB;
    uniform float uMix;
    uniform vec2 uTexSize;     // 640 x 360
    uniform vec4 uSrc;         // retângulo visível: x, y, largura, altura em pixels
    uniform float uSharp;
    uniform float uSat;
    uniform float uCon;

    // Catmull-Rom em 9 amostras, aproveitando o filtro bilinear do hardware
    vec3 bicubico(sampler2D tex, vec2 px) {
      vec2 tp1 = floor(px - 0.5) + 0.5;
      vec2 f = px - tp1;

      vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
      vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
      vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
      vec2 w3 = f * f * (-0.5 + 0.5 * f);
      vec2 w12 = w1 + w2;
      vec2 off12 = w2 / w12;

      vec2 p0 = (tp1 - 1.0) / uTexSize;
      vec2 p3 = (tp1 + 2.0) / uTexSize;
      vec2 p12 = (tp1 + off12) / uTexSize;

      vec3 r = vec3(0.0);
      r += texture(tex, vec2(p0.x,  p0.y )).rgb * w0.x  * w0.y;
      r += texture(tex, vec2(p12.x, p0.y )).rgb * w12.x * w0.y;
      r += texture(tex, vec2(p3.x,  p0.y )).rgb * w3.x  * w0.y;
      r += texture(tex, vec2(p0.x,  p12.y)).rgb * w0.x  * w12.y;
      r += texture(tex, vec2(p12.x, p12.y)).rgb * w12.x * w12.y;
      r += texture(tex, vec2(p3.x,  p12.y)).rgb * w3.x  * w12.y;
      r += texture(tex, vec2(p0.x,  p3.y )).rgb * w0.x  * w3.y;
      r += texture(tex, vec2(p12.x, p3.y )).rgb * w12.x * w3.y;
      r += texture(tex, vec2(p3.x,  p3.y )).rgb * w3.x  * w3.y;
      return r;
    }

    vec3 amostra(sampler2D tex, vec2 px) {
      vec3 c = bicubico(tex, px);

      // borrado de referência para a máscara de nitidez
      vec2 d = vec2(1.15, 1.15);
      vec3 bl = (
        texture(tex, (px + vec2( d.x, 0.0)) / uTexSize).rgb +
        texture(tex, (px + vec2(-d.x, 0.0)) / uTexSize).rgb +
        texture(tex, (px + vec2(0.0,  d.y)) / uTexSize).rgb +
        texture(tex, (px + vec2(0.0, -d.y)) / uTexSize).rgb) * 0.25;

      c = c + uSharp * (c - bl);
      return clamp(c, 0.0, 1.0);
    }

    void main() {
      vec2 px = uSrc.xy + vUv * uSrc.zw;
      vec3 c = mix(amostra(uA, px), amostra(uB, px), uMix);

      float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(l), c, uSat);
      c = clamp((c - 0.5) * uCon + 0.5, 0.0, 1.0);

      fragColor = vec4(c, 1.0);
    }`;

  let gl = null, prog = null, texA = null, texB = null, uni = {};

  function compilar(tipo, fonte) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || 'falha ao compilar shader');
    }
    return s;
  }

  function novaTextura() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function iniciarGL() {
    gl = cv.getContext('webgl2', { alpha: false, antialias: false, depth: false });
    if (!gl) return false;

    prog = gl.createProgram();
    gl.attachShader(prog, compilar(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compilar(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'falha ao ligar o programa');
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const n of ['uA','uB','uMix','uTexSize','uSrc','uSharp','uSat','uCon']) {
      uni[n] = gl.getUniformLocation(prog, n);
    }
    gl.uniform1i(uni.uA, 0);
    gl.uniform1i(uni.uB, 1);
    gl.uniform1f(uni.uSharp, NITIDEZ);
    gl.uniform1f(uni.uSat, SATURACAO);
    gl.uniform1f(uni.uCon, CONTRASTE);

    texA = novaTextura();
    texB = novaTextura();
    return true;
  }

  // ---- retângulo do vídeo realmente visível, preenchendo a tela
  function calcularSrc() {
    const CW = cv.width, CH = cv.height;
    const escala = Math.max(CW / CROP.w, CH / CROP.h);
    const visW = CW / escala, visH = CH / escala;
    return [
      CROP.x + (CROP.w - visW) / 2,
      CROP.y + (CROP.h - visH) / 2,
      visW, visH,
    ];
  }

  function dimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    cv.width = Math.round(palco.clientWidth * dpr);
    cv.height = Math.round(palco.clientHeight * dpr);
    cv.style.width = palco.clientWidth + 'px';
    cv.style.height = palco.clientHeight + 'px';
    if (gl) gl.viewport(0, 0, cv.width, cv.height);
  }
  window.addEventListener('resize', dimensionar);

  function subir(unidade, tex, v) {
    if (!v.videoWidth) return;
    gl.activeTexture(gl.TEXTURE0 + unidade);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
  }

  function desenhar() {
    if (!gl) return;
    subir(0, texA, atual);
    subir(1, texB, proximo);
    gl.uniform2f(uni.uTexSize, atual.videoWidth || 640, atual.videoHeight || 360);
    gl.uniform4f(uni.uSrc, ...calcularSrc());
    gl.uniform1f(uni.uMix, mistura);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ================================================================ laço
  function prepararProximo() {
    proximo.pause();
    try { proximo.currentTime = INICIO; } catch (e) { /* ainda sem metadados */ }
  }

  function fundir() {
    fundindo = true;
    proximo.currentTime = INICIO;
    proximo.volume = 0;
    proximo.muted = !comSom;
    tocar(proximo);

    const t0 = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - t0) / (FADE * 1000));
      mistura = t * t * (3 - 2 * t);
      if (comSom) { proximo.volume = mistura; atual.volume = 1 - mistura; }
      if (t < 1) return requestAnimationFrame(passo);

      const antigo = atual;
      atual = proximo;
      proximo = antigo;
      mistura = 0;
      if (comSom) atual.volume = 1;
      fundindo = false;
      prepararProximo();
    };
    requestAnimationFrame(passo);
  }

  function verificarLaco() {
    if (fundindo || !isFinite(atual.duration)) return;
    if (atual.currentTime >= FIM - FADE) fundir();
    else if (atual.currentTime > FIM + 0.4) atual.currentTime = INICIO;
  }

  function quadro() {
    requestAnimationFrame(quadro);
    if (document.hidden) return;
    verificarLaco();
    desenhar();
  }

  // ---- caminho alternativo sem WebGL2: CSS puro
  function modoCSS() {
    cv.style.display = 'none';
    for (const v of [a, b]) {
      v.classList.add('visivel');
      v.style.transformOrigin = '0 0';
    }
    b.style.opacity = 0;
    const enquadrar = () => {
      const CW = palco.clientWidth, CH = palco.clientHeight;
      const e = Math.max(CW / CROP.w, CH / CROP.h);
      const cx = CROP.x + CROP.w / 2, cy = CROP.y + CROP.h / 2;
      for (const v of [a, b]) {
        v.style.width = (v.videoWidth || 640) + 'px';
        v.style.height = (v.videoHeight || 360) + 'px';
        v.style.transform = `translate(${CW/2 - cx*e}px, ${CH/2 - cy*e}px) scale(${e})`;
      }
    };
    window.addEventListener('resize', enquadrar);
    a.addEventListener('loadedmetadata', enquadrar);
    const laco = () => {
      requestAnimationFrame(laco);
      if (document.hidden) return;
      verificarLaco();
      a.style.opacity = atual === a ? 1 - mistura : mistura;
      b.style.opacity = atual === b ? 1 - mistura : mistura;
    };
    enquadrar();
    laco();
  }

  // ================================================================ início
  let usandoGL = false;
  try { usandoGL = iniciarGL(); } catch (e) { usandoGL = false; }
  dimensionar();

  a.addEventListener('loadedmetadata', () => { a.currentTime = INICIO; }, { once: true });
  b.addEventListener('loadedmetadata', () => { b.currentTime = INICIO; }, { once: true });
  a.addEventListener('canplay', () => tocar(a), { once: true });
  b.addEventListener('canplay', prepararProximo, { once: true });

  if (usandoGL) quadro(); else modoCSS();

  // ---- som
  const ALTO = 'M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1c2.9.9 5 3.6 5 6.7s-2.1 5.8-5 6.7v2.1c4-1 7-4.6 7-8.8s-3-7.8-7-8.8z';
  const MUDO = 'M3 9v6h4l5 5V4L7 9H3zm16.6 3l2.7-2.7-1.4-1.4L18.2 10.6 15.5 7.9l-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4L19.6 12z';
  const btSom = document.getElementById('btSom');
  const icSom = document.getElementById('icSom');
  const txtSom = document.getElementById('txtSom');

  function pintar() {
    icSom.innerHTML = '<path d="' + (comSom ? ALTO : MUDO) + '"/>';
    txtSom.textContent = comSom ? 'Som ligado' : 'Som desligado';
    btSom.setAttribute('aria-pressed', String(comSom));
  }
  function alternarSom() {
    comSom = !comSom;
    atual.muted = !comSom;
    atual.volume = comSom ? 1 : 0;
    proximo.muted = true;
    pintar();
    mostrarBarra();
  }
  btSom.addEventListener('click', alternarSom);
  pintar();

  // ---- nitidez ajustável ao vivo, para comparar
  function ajustarNitidez(delta) {
    if (!gl) return;
    const atualV = gl.getUniform(prog, uni.uSharp);
    const novo = Math.max(0, Math.min(2.5, atualV + delta));
    gl.uniform1f(uni.uSharp, novo);
    txtSom.textContent = 'Nitidez ' + novo.toFixed(2);
    mostrarBarra();
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'm') alternarSom();
    if (k === '+' || k === '=') ajustarNitidez(0.15);
    if (k === '-' || k === '_') ajustarNitidez(-0.15);
    if (k === '0') { if (gl) { gl.uniform1f(uni.uSharp, 0); txtSom.textContent = 'Nitidez 0 (cru)'; mostrarBarra(); } }
  });

  // ---- barra some sozinha
  const barra = document.getElementById('barra');
  let sumir = null;
  function mostrarBarra() {
    barra.classList.add('visivel');
    clearTimeout(sumir);
    sumir = setTimeout(() => { barra.classList.remove('visivel'); pintar(); }, 2600);
  }
  window.addEventListener('pointermove', mostrarBarra);
  window.addEventListener('pointerdown', mostrarBarra);
  mostrarBarra();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { a.pause(); b.pause(); }
    else tocar(atual);
  });
})();
