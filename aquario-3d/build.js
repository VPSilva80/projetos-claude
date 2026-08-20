/* Junta o Three.js e os módulos de src/ num único HTML autônomo.
   O Three.js só é distribuído como ES module; aqui o `export{a as B,...}` final
   vira `const THREE={B:a,...}` para que tudo caiba num <script> clássico —
   que é o que funciona em file:// e nos programas de wallpaper. */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const three = fs.readFileSync(path.join(dir, 'vendor/three.module.js'), 'utf8');

const m = three.match(/export\{([^}]*)\};?\s*$/);
if (!m) throw new Error('não achei o statement de export do three.js');

const namespace = m[1].split(',').map((entry) => {
  const parts = entry.trim().split(/\s+as\s+/);
  return parts.length === 2 ? `${parts[1]}:${parts[0]}` : `${parts[0]}:${parts[0]}`;
}).join(',');

// o three.js fica no próprio escopo: os nomes internos dele não podem colidir
// com os do aplicativo, que vive no escopo de fora
const threeClassic = three.slice(0, m.index) + `return {${namespace}};`;

const parts = fs.readdirSync(path.join(dir, 'src')).filter((f) => f.endsWith('.js')).sort();
const app = parts.map((f) => {
  const body = fs.readFileSync(path.join(dir, 'src', f), 'utf8');
  return `/* ===== ${f} ===== */\n${body}`;
}).join('\n\n');

const bundle = `(() => {\n'use strict';\nconst THREE = (() => {\n${threeClassic}\n})();\n\n${app}\n})();`;

const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
// função em vez de string: evita que padrões $& / $' dentro do bundle
// sejam interpretados como referências do replace
const inlined = html.replace(
  '<script type="module" src="aquarium3d.js"></script>',
  () => '<script>\n' + bundle + '\n</script>',
);
fs.writeFileSync(path.join(dir, 'aquario-3d.html'), inlined);

// versão sem as tags de documento, para publicar como artifact
const bodyOnly = inlined
  .replace(/^[\s\S]*?<head>\s*/, '')
  .replace(/<meta[^>]*>\s*/g, '')
  .replace(/<\/head>\s*<body>\s*/, '\n')
  .replace(/\s*<\/body>\s*<\/html>\s*$/, '\n');
fs.writeFileSync(path.join(dir, 'aquario-3d.artifact.html'), bodyOnly);

const kb = (p) => (fs.statSync(path.join(dir, p)).size / 1024).toFixed(0) + ' KB';
console.log('módulos:', parts.join(', '));
console.log('aquario-3d.html:', kb('aquario-3d.html'));
console.log('aquario-3d.artifact.html:', kb('aquario-3d.artifact.html'));
