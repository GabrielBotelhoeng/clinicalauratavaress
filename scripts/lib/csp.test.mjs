import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  buildCsp,
  collectInlineScriptHashes,
  cspHash,
  isExecutableScriptType,
  sha256Base64,
} from './csp.mjs';

describe('sha256Base64', () => {
  it('calcula o SHA-256 em base64 do texto em UTF-8 (mesmo algoritmo que o navegador usa no CSP)', () => {
    const text = "document.documentElement.classList.add('js');";
    expect(sha256Base64(text)).toBe(createHash('sha256').update(text, 'utf8').digest('base64'));
  });
});

describe('cspHash', () => {
  it('formata como fonte do CSP, entre aspas simples', () => {
    expect(cspHash('a')).toBe(`'sha256-${sha256Base64('a')}'`);
  });
});

describe('isExecutableScriptType', () => {
  it('considera JS os tipos vazio, text/javascript e module', () => {
    expect(isExecutableScriptType(null)).toBe(true);
    expect(isExecutableScriptType('')).toBe(true);
    expect(isExecutableScriptType('text/javascript')).toBe(true);
    expect(isExecutableScriptType('module')).toBe(true);
  });

  it('não considera JSON-LD, JSON nem import maps', () => {
    expect(isExecutableScriptType('application/ld+json')).toBe(false);
    expect(isExecutableScriptType('application/json')).toBe(false);
    expect(isExecutableScriptType('importmap')).toBe(false);
  });
});

describe('collectInlineScriptHashes', () => {
  it('ignora scripts com src (externos) e o bloco application/ld+json', () => {
    const html = `<!doctype html><html><head>
      <script>document.documentElement.classList.add('js');</script>
      <script type="application/ld+json">{"a":1}</script>
      <script type="module" src="/_astro/hoisted.ABC.js"></script>
    </head><body></body></html>`;
    expect(collectInlineScriptHashes(html)).toEqual([
      cspHash("document.documentElement.classList.add('js');"),
    ]);
  });

  it('deduplica hashes iguais entre vários scripts inline', () => {
    const html = '<script>const a = 1;</script><script>const a = 1;</script>';
    expect(collectInlineScriptHashes(html)).toHaveLength(1);
  });

  it('sem nenhum script inline executável devolve lista vazia', () => {
    expect(collectInlineScriptHashes('<html><head></head><body></body></html>')).toEqual([]);
  });
});

describe('buildCsp', () => {
  it('inclui self e os hashes em script-src; libera o atributo de estilo sem afastar o style-src', () => {
    const csp = buildCsp([cspHash('x')]);
    expect(csp).toContain(`script-src 'self' ${cspHash('x')}`);
    expect(csp).toContain("style-src 'self';");
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
    expect(csp).not.toContain("style-src 'self' 'unsafe-inline'");
  });

  it('sem hashes ainda assim produz script-src só com self', () => {
    expect(buildCsp([])).toContain("script-src 'self';");
  });
});
