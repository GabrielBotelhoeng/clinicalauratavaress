// Gera placeholders elegantes (sem texto) nas cores da marca, o apple-touch-icon e a imagem OG provisória.
// Uso: npm run placeholders — idempotente; não sobrescreve public/og.jpg se ela já existir (a Task 32 gera a final).
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const path = (relative) => fileURLToPath(new URL(relative, root));

const KINDS = {
  portrait: { width: 1280, height: 1600, base: '#EBCBC3', glow: '#F1DCD6' },
  landscape: { width: 1600, height: 1200, base: '#EBCBC3', glow: '#F1DCD6' },
  tall: { width: 900, height: 1200, base: '#F1DCD6', glow: '#FBF6F2' },
  before: { width: 1280, height: 1600, base: '#E4B9B0', glow: '#EBCBC3' },
  after: { width: 1280, height: 1600, base: '#F1DCD6', glow: '#FBF6F2' },
};

function archSvg({ width, height, base, glow }) {
  const archWidth = Math.round(width * 0.56);
  const archHeight = Math.round(height * 0.62);
  const x = Math.round((width - archWidth) / 2);
  const y = Math.round(height * 0.2);
  const radius = archWidth / 2;
  const stroke = Math.max(2, Math.round(width / 640));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><radialGradient id="g" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="${base}"/></radialGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <path d="M${x} ${y + archHeight} V${y + radius} A${radius} ${radius} 0 0 1 ${x + archWidth} ${y + radius} V${y + archHeight} Z" fill="none" stroke="#B8925A" stroke-opacity="0.45" stroke-width="${stroke}"/>
</svg>`;
}

mkdirSync(path('src/assets/placeholders/'), { recursive: true });
for (const [name, spec] of Object.entries(KINDS)) {
  const out = path(`src/assets/placeholders/${name}.jpg`);
  await sharp(Buffer.from(archSvg(spec)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  console.log(`placeholder: src/assets/placeholders/${name}.jpg`);
}

await sharp(readFileSync(path('public/favicon.svg')), { density: 300 })
  .resize(180, 180)
  .png()
  .toFile(path('public/apple-touch-icon.png'));
console.log('ícone: public/apple-touch-icon.png');

const og = path('public/og.jpg');
if (existsSync(og)) {
  console.log('public/og.jpg já existe — mantida.');
} else {
  const ogSvg = archSvg({ width: 1200, height: 630, base: '#F3E3DE', glow: '#FBF6F2' });
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 85, mozjpeg: true }).toFile(og);
  console.log('og provisória: public/og.jpg');
}
