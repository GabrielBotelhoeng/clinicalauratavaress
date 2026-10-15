import { describe, expect, it } from 'vitest';
import { cssOf, loadPage } from './load';

describe('movimento — estrutura no HTML e no CSS', () => {
  it('marca <html> com a classe js no <head>, com failsafe de 4 s', () => {
    const { document } = loadPage();
    const inline = Array.from(
      document.querySelectorAll('head script:not([src]):not([type])'),
      (script) => script.textContent ?? '',
    ).join('\n');
    expect(inline).toMatch(/classList\.add\(['"]js['"]\)/);
    expect(inline).toContain('motion-ready');
    expect(inline).toContain('4000');
  });

  it('carrega o movimento como módulo externo; o único script inline executável é o da classe js', () => {
    const { document } = loadPage();
    expect(document.querySelectorAll('script[type="module"][src]').length).toBeGreaterThan(0);
    const inlineExecutable = Array.from(document.querySelectorAll('script:not([src])')).filter(
      (script) => script.getAttribute('type') !== 'application/ld+json',
    );
    expect(inlineExecutable).toHaveLength(1);
  });

  it('só esconde conteúdo sob html.js (sem JS tudo fica visível)', () => {
    const css = cssOf(loadPage().document);
    expect(css).toMatch(/html\.js \[data-reveal\]\s*\{\s*opacity:\s*0/);
    expect(css).not.toMatch(/(^|[},])\s*\[data-reveal\]\s*\{[^}]*opacity:\s*0/);
  });

  it('inclui o CSS do Lenis', () => {
    expect(cssOf(loadPage().document)).toContain('.lenis');
  });
});
