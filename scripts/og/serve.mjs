// Servidor estático mínimo para renderizar scripts/og/template.html com as fontes self-hosted reais
// e a foto real da Dra. (ou o placeholder, se ainda não tiver chegado). Só serve arquivos sob o cwd.
// Uso: node scripts/og/serve.mjs [porta]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] ?? process.env.OG_PORT ?? 4825);
const ROOT = process.cwd();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const PHOTO = existsSync(join(ROOT, 'src/assets/media/dra/hero.jpg'))
  ? join(ROOT, 'src/assets/media/dra/hero.jpg')
  : join(ROOT, 'src/assets/placeholders/portrait.jpg');

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  if (url.pathname === '/og/photo.jpg') {
    response.writeHead(200, { 'Content-Type': 'image/jpeg' });
    createReadStream(PHOTO).pipe(response);
    return;
  }
  const relative = url.pathname === '/' ? '/scripts/og/template.html' : url.pathname;
  const file = normalize(join(ROOT, relative));
  if (!file.startsWith(ROOT) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404);
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
});

server.listen(PORT, '127.0.0.1', () => console.log(`og preview em http://127.0.0.1:${PORT}/`));
process.on('SIGTERM', () => server.close());
