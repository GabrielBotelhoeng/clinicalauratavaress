import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';

const NON_EXECUTABLE_TYPES = new Set([
  'application/ld+json',
  'application/json',
  'importmap',
  'speculationrules',
]);

/** SHA-256 em base64 (UTF-8) — mesmo cálculo que o navegador usa para validar um 'sha256-...' do CSP. */
export function sha256Base64(text) {
  return createHash('sha256').update(text, 'utf8').digest('base64');
}

/** Formata como fonte do CSP: 'sha256-<base64>'. */
export function cspHash(text) {
  return `'sha256-${sha256Base64(text)}'`;
}

/** true para tipos que o navegador executa como JavaScript (vazio, text/javascript, module, ...). */
export function isExecutableScriptType(type) {
  const value = (type ?? '').trim().toLowerCase();
  return value === '' || !NON_EXECUTABLE_TYPES.has(value);
}

/** Hashes (deduplicados, ordenados) de todo <script> inline executável (sem src) de uma página. */
export function collectInlineScriptHashes(html) {
  const { document } = parseHTML(html);
  const hashes = new Set();
  for (const script of document.querySelectorAll('script')) {
    if (script.hasAttribute('src')) continue;
    if (!isExecutableScriptType(script.getAttribute('type'))) continue;
    hashes.add(cspHash(script.textContent ?? ''));
  }
  return [...hashes].sort();
}

/**
 * CSP do site: só 'self' + os hashes de script inline encontrados no dist. style-src-attr libera o
 * atributo `style="object-position: ..."` das fotos de mídia sem afrouxar style-src (sem 'unsafe-inline').
 * Sem formulário (LGPD): form-action 'none'. Sem plugins/base tag injection: object-src/base-uri estritos.
 */
export function buildCsp(hashes) {
  const scriptSrc = ["'self'", ...hashes].join(' ');
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self'",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
