// Gera (ou confere, com --check) o Content-Security-Policy do vercel.json a partir do que o build
// realmente produziu em dist/. Uso:
//   npm run build && npm run csp          grava vercel.json
//   npm run build && npm run csp:check    confere; sai com 1 se vercel.json estiver desatualizado
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildCsp, collectInlineScriptHashes } from './lib/csp.mjs';

const PAGES = ['dist/index.html', 'dist/politica-de-privacidade.html'];
const VERCEL_JSON = 'vercel.json';
const SOURCE = '/(.*)';

const EXTRA_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

function computeCsp() {
  const missing = PAGES.filter((page) => !existsSync(page));
  if (missing.length > 0) {
    console.error(
      `dist/ incompleto: ${missing.join(', ')} não encontrado(s) — rode "npm run build" antes.`,
    );
    process.exit(2);
  }
  const hashes = [
    ...new Set(PAGES.flatMap((page) => collectInlineScriptHashes(readFileSync(page, 'utf8')))),
  ].sort();
  return buildCsp(hashes);
}

function headerBlock(csp) {
  return {
    source: SOURCE,
    headers: [
      { key: 'Content-Security-Policy', value: csp },
      ...Object.entries(EXTRA_HEADERS).map(([key, value]) => ({ key, value })),
    ],
  };
}

function loadVercelJson() {
  return existsSync(VERCEL_JSON) ? JSON.parse(readFileSync(VERCEL_JSON, 'utf8')) : { headers: [] };
}

const csp = computeCsp();

if (process.argv.includes('--check')) {
  if (!existsSync(VERCEL_JSON)) {
    console.error('vercel.json não encontrado — rode "npm run csp" primeiro.');
    process.exit(1);
  }
  const current = loadVercelJson();
  const block = current.headers?.find((entry) => entry.source === SOURCE);
  const currentCsp = block?.headers?.find(
    (header) => header.key === 'Content-Security-Policy',
  )?.value;
  const problems = [];
  if (currentCsp !== csp) {
    problems.push(
      `CSP desatualizado.\n  Esperado: ${csp}\n  Atual:    ${currentCsp ?? '(ausente)'}`,
    );
  }
  if (current.cleanUrls !== true) {
    problems.push(
      `cleanUrls deveria ser true (atual: ${JSON.stringify(current.cleanUrls)}) — sem ele, /politica-de-privacidade (canonical/sitemap/rodapé) dá 404 na Vercel.`,
    );
  }
  if (current.trailingSlash !== false) {
    problems.push(
      `trailingSlash deveria ser false (atual: ${JSON.stringify(current.trailingSlash)}).`,
    );
  }
  if (problems.length > 0) {
    console.error('vercel.json desatualizado. Rode "npm run csp" e commite o arquivo.');
    for (const problem of problems) console.error(problem);
    process.exit(1);
  }
  console.log('CSP, cleanUrls e trailingSlash em dia com o dist/ atual.');
  process.exit(0);
}

const data = loadVercelJson();
data.headers = [
  headerBlock(csp),
  ...(data.headers ?? []).filter((entry) => entry.source !== SOURCE),
];
// cleanUrls: true é o que resolve /politica-de-privacidade (sem .html) na Vercel — o build
// (format: 'file', Task 2) gera dist/politica-de-privacidade.html, mas canonical/sitemap/rodapé
// (Tasks 7/24) linkam sem extensão. trailingSlash: false acompanha o trailingSlash: 'never' do Astro.
data.cleanUrls = true;
data.trailingSlash = false;
writeFileSync(VERCEL_JSON, `${JSON.stringify(data, null, 2)}\n`);
console.log(
  `vercel.json atualizado — script-src com ${csp.match(/sha256-/g)?.length ?? 0} hash(es); cleanUrls e trailingSlash ajustados.`,
);
