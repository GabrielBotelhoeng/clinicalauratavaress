import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { normalizeText } from '../../src/lib/text';

const DIST = join(process.cwd(), 'dist');

/** Lê e faz o parse de uma página gerada (padrão: dist/index.html). */
export function loadPage(file = 'index.html'): { html: string; document: Document } {
  const path = join(DIST, file);
  if (!existsSync(path)) {
    throw new Error(`dist/${file} não existe — rode "npm run build" antes de "npm run test:dist".`);
  }
  const html = readFileSync(path, 'utf8');
  const { document } = parseHTML(html);
  return { html, document: document as unknown as Document };
}

export function readDist(file: string): string {
  return readFileSync(join(DIST, file), 'utf8');
}

export function existsInDist(file: string): boolean {
  return existsSync(join(DIST, file));
}

/** Lista arquivos (recursivo) de dist/<subdir>, com caminhos relativos a dist/ e barras normais. */
export function listDist(subdir = ''): string[] {
  const root = join(DIST, subdir);
  if (!existsSync(root)) return [];
  return readdirSync(root, { recursive: true, encoding: 'utf8' }).map((path) =>
    (subdir ? `${subdir}/${path}` : path).replaceAll('\\', '/'),
  );
}

/** Texto visível normalizado de um nó. */
export function textOf(node: { textContent: string | null } | null | undefined): string {
  return normalizeText(node?.textContent ?? '');
}

/** Todo o CSS da página: arquivos de dist/_astro + blocos <style> inline. */
export function cssOf(document: Document): string {
  const files = listDist('_astro')
    .filter((file) => file.endsWith('.css'))
    .map(readDist);
  const inline = Array.from(document.querySelectorAll('style'), (style) => style.textContent ?? '');
  return [...files, ...inline].join('\n');
}
