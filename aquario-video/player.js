/* Papel de parede em vídeo.
 *
 * O arquivo de origem é uma gravação de tela de celular: tem barra de status,
 * barra de navegação do Android e os botões do próprio app por cima da imagem.
 * Este player recorta tudo isso e reproduz em laço apenas o trecho em que
 * nenhum menu está aberto, com fusão cruzada para o corte não aparecer.
 */
(() => {
  'use strict';

  const q = new URLSearchParams(location.search);
  const num = (k, padrao) => { const v = parseFloat(q.get(k)); return isNaN(v) ? padrao : v; };

  const SRC = q.get('src') || 'aquario.mp4';

  // recorte, em pixels do vídeo original (640x360), medido a partir da imagem:
  // linhas 0-24 = barra de status, 30-71 = botões de cima, 313+ = botões de baixo,
  // colunas 598+ = barra de navegação do Android
  const CORTE = {
    x: num('cx', 0), y: num('cy', 74),
    w: num('cw', 598), h: num('ch', 234),
  };

  // trecho sem nenhum menu aberto
  const INICIO = num('inicio', 84);
  const FIM    = num('fim', 101.5);
  const FADE   = num('fade', 1.2);

  const palco = document.getElementById('palco');
  const a = document.getElementById('a');
  const b = document.getElementById('b');
  const erro = document.getElementById('erro');

  let atual = a, proximo = b;
  let fundindo = false;
  let comSom = false;

  [a, b].forEach((v) => {
    v.src = SRC;
    v.loop = false;
    v.muted = true;
    v.playsInline = true;
    v.addEventListener('error', () => { if (a.error && b.error) erro.classList.add('aparece'); });
  });

  function tocar(v) {
    const p = v.play();
    if (p && p.catch) p.catch(() => { /* autoplay bloqueado até haver interação */ });
  }

  // ---- posiciona o recorte preenchendo a tela
  function enquadrar() {
    const CW = palco.clientWidth, CH = palco.clientHeight;
    const escala = Math.max(CW / CORTE.w, CH / CORTE.h);
    const cx = CORTE.x + CORTE.w / 2;
    const cy = CORTE.y + CORTE.h / 2;
    for (const v of [a, b]) {
      const vw = v.videoWidth || 640, vh = v.videoHeight || 360;
      v.style.width = vw + 'px';
      v.style.height = vh + 'px';
      v.style.transform =
        `translate(${CW / 2 - cx * escala}px, ${CH / 2 - cy * escala}px) scale(${escala})`;
    }
  }
  window.addEventListener('resize', enquadrar);

  // ---- laço do trecho, com fusão cruzada
  function prepararProximo() {
    proximo.pause();
    proximo.style.opacity = 0;
    try { proximo.currentTime = INICIO; } catch (e) { /* ainda sem metadados */ }
  }

  function aoAvancar() {
    if (fundindo || !isFinite(atual.duration)) return;
    if (atual.currentTime < FIM - FADE) return;
    fundir();
  }

  function fundir() {
    fundindo = true;
    proximo.currentTime = INICIO;
    proximo.volume = 0;
    proximo.muted = !comSom;
    tocar(proximo);

    const t0 = performance.now();
    const saindo = atual, entrando = proximo;

    const passo = (agora) => {
      const t = Math.min(1, (agora - t0) / (FADE * 1000));
      const s = t * t * (3 - 2 * t);
      entrando.style.opacity = s;
      saindo.style.opacity = 1 - s;
      if (comSom) { entrando.volume = s; saindo.volume = 1 - s; }
      if (t < 1) return requestAnimationFrame(passo);

      saindo.style.opacity = 0;
      entrando.style.opacity = 1;
      if (comSom) entrando.volume = 1;
      atual = entrando;
      proximo = saindo;
      fundindo = false;
      prepararProximo();
    };
    requestAnimationFrame(passo);
  }

  [a, b].forEach((v) => {
    v.addEventListener('timeupdate', aoAvancar);
    // rede de segurança: nunca deixa passar do fim do trecho
    v.addEventListener('timeupdate', () => {
      if (v === atual && !fundindo && v.currentTime > FIM + 0.4) v.currentTime = INICIO;
    });
    v.addEventListener('ended', () => { if (v === atual) { v.currentTime = INICIO; tocar(v); } });
  });

  a.addEventListener('loadedmetadata', () => {
    enquadrar();
    a.currentTime = INICIO;
  }, { once: true });
  b.addEventListener('loadedmetadata', () => { b.currentTime = INICIO; }, { once: true });

  a.addEventListener('canplay', () => { a.style.opacity = 1; tocar(a); }, { once: true });
  b.addEventListener('canplay', prepararProximo, { once: true });

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
  window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'm') alternarSom(); });
  pintar();

  // ---- barra some sozinha
  const barra = document.getElementById('barra');
  let sumir = null;
  function mostrarBarra() {
    barra.classList.add('visivel');
    clearTimeout(sumir);
    sumir = setTimeout(() => barra.classList.remove('visivel'), 2600);
  }
  window.addEventListener('pointermove', mostrarBarra);
  window.addEventListener('pointerdown', mostrarBarra);
  mostrarBarra();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { a.pause(); b.pause(); }
    else tocar(atual);
  });

  enquadrar();
})();
