import { describe, expect, it } from 'vitest';
import { summarize, toMarkdown } from './lighthouse-summary.mjs';

const lhr = (performance, accessibility, bestPractices, seo) => ({
  finalDisplayedUrl: 'http://127.0.0.1:4321/',
  categories: {
    performance: { score: performance },
    accessibility: { score: accessibility },
    'best-practices': { score: bestPractices },
    seo: { score: seo },
  },
  audits: {
    'largest-contentful-paint': { numericValue: 2100 },
    'cumulative-layout-shift': { numericValue: 0.012 },
    'total-blocking-time': { numericValue: 80 },
  },
});

describe('summarize', () => {
  it('converte as notas para 0–100', () => {
    expect(summarize(lhr(0.93, 1, 0.96, 1)).scores).toEqual({
      performance: 93,
      accessibility: 100,
      'best-practices': 96,
      seo: 100,
    });
  });

  it('aponta as categorias abaixo de 90', () => {
    expect(summarize(lhr(0.89, 1, 0.9, 1)).failing).toEqual(['performance']);
  });

  it('trata categoria ausente como 0', () => {
    expect(summarize({ categories: {} }).failing).toHaveLength(4);
  });

  it('lê LCP, CLS e TBT', () => {
    expect(summarize(lhr(1, 1, 1, 1))).toMatchObject({ lcpMs: 2100, cls: 0.012, tbtMs: 80 });
  });
});

describe('toMarkdown', () => {
  it('marca aprovado quando todas as categorias ≥ 90', () => {
    const markdown = toMarkdown([{ name: 'home', summary: summarize(lhr(0.95, 1, 1, 1)) }], {
      date: '2026-10-05',
    });
    expect(markdown).toContain('| home | 95 | 100 | 100 | 100 | 2,10 s | 0,012 | 80 ms |');
    expect(markdown).toContain('Resultado: **aprovado**');
  });

  it('lista o que reprovou', () => {
    const markdown = toMarkdown([{ name: 'home', summary: summarize(lhr(0.8, 1, 1, 0.85)) }], {
      date: '2026-10-05',
    });
    expect(markdown).toContain('Resultado: **reprovado** — home: Performance, SEO.');
  });
});
