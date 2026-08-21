/* Gera a versão em arquivo único, com o vídeo embutido como data URI,
   para publicar ou levar sem a pasta junto. */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(dir, 'player.js'), 'utf8');
const mp4 = fs.readFileSync(path.join(dir, 'aquario.mp4'));

const dataUri = 'data:video/mp4;base64,' + mp4.toString('base64');

// função em vez de string: o conteúdo tem $ e não pode ser lido como padrão
const inline = html
  .replace('<script src="player.js"></script>',
           () => '<script>\n' + js.replace("|| 'aquario.mp4'", () => "|| VIDEO_EMBUTIDO") + '\n</script>')
  .replace('<body>', () => '<body>\n<script>const VIDEO_EMBUTIDO = "' + dataUri + '";</script>');

fs.writeFileSync(path.join(dir, 'aquario-video.html'), inline);

const semDoc = inline
  .replace(/^[\s\S]*?<head>\s*/, '')
  .replace(/<meta[^>]*>\s*/g, '')
  .replace(/<\/head>\s*<body>\s*/, '\n')
  .replace(/\s*<\/body>\s*<\/html>\s*$/, '\n');
fs.writeFileSync(path.join(dir, 'aquario-video.artifact.html'), semDoc);

const mb = (p) => (fs.statSync(path.join(dir, p)).size / 1048576).toFixed(2) + ' MB';
console.log('aquario.mp4            ', mb('aquario.mp4'));
console.log('aquario-video.html     ', mb('aquario-video.html'));
console.log('aquario-video.artifact.html', mb('aquario-video.artifact.html'));
