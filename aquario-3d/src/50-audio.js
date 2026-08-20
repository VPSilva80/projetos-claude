/* Ambiência sintetizada com Web Audio: rumor grave da água filtrado, mais
   estalos de bolha esporádicos. É síntese, não uma gravação de campo — para
   usar um áudio real, ver a seção de som no README. Fica desligada por padrão. */
const Ambience = (() => {
  let ctx = null, master = null, timer = null, noiseSrc = null;

  function makeNoiseBuffer(seconds) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    // ruído marrom: mais grave e mais próximo de água que o ruído branco
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.2;
    }
    return buf;
  }

  function bubblePop() {
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const base = 260 + Math.random() * 900;
    osc.frequency.setValueAtTime(base * 0.55, now);
    osc.frequency.exponentialRampToValueAtTime(base, now + 0.055);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.06, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  function schedule() {
    timer = setTimeout(() => {
      const n = 1 + ((Math.random() * 3) | 0);
      for (let i = 0; i < n; i++) setTimeout(bubblePop, Math.random() * 260);
      schedule();
    }, 220 + Math.random() * 1100);
  }

  return {
    get running() { return !!ctx; },
    async start() {
      if (ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      if (ctx.state === 'suspended') await ctx.resume();

      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);

      noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = makeNoiseBuffer(6);
      noiseSrc.loop = true;

      // debaixo d'água quase só passa grave
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 340;
      lp.Q.value = 0.6;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 45;

      const g = ctx.createGain();
      g.gain.value = 0.16;

      // oscilação lenta, dá a sensação de massa de água em movimento
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.07;
      lfoGain.gain.value = 0.05;
      lfo.connect(lfoGain).connect(g.gain);
      lfo.start();

      noiseSrc.connect(hp).connect(lp).connect(g).connect(master);
      noiseSrc.start();
      schedule();
    },
    stop() {
      clearTimeout(timer);
      timer = null;
      try { noiseSrc && noiseSrc.stop(); } catch (e) { /* já parado */ }
      if (ctx) ctx.close();
      ctx = null; master = null; noiseSrc = null;
    },
  };
})();
