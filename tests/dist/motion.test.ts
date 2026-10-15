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

describe('movimento — padrões 2, 3 e 9 marcados no HTML', () => {
  it('marca as fotos em arco, o parallax e a assinatura', () => {
    const { document } = loadPage();
    expect(document.querySelector('#inicio [data-arch-reveal]')).not.toBeNull();
    expect(document.querySelector('#dra-laura [data-arch-reveal]')).not.toBeNull();
    expect(document.querySelector('#inicio [data-parallax="-10"]')).not.toBeNull();
    expect(document.querySelector('#inicio [data-parallax="6"]')).not.toBeNull();
    // Uma camada de parallax por foto da galeria (a sala dispensada fica fora até a clínica mandar a foto).
    const galleryItems = document.querySelectorAll('#a-clinica .clinic__item').length;
    expect(galleryItems).toBeGreaterThanOrEqual(3);
    expect(document.querySelectorAll('#a-clinica [data-parallax-inner]')).toHaveLength(
      galleryItems,
    );
    expect(document.querySelectorAll('[data-signature]')).toHaveLength(1);
  });

  it('o arco só começa escondido no desktop com JS e sem movimento reduzido', () => {
    const css = cssOf(loadPage().document);
    expect(css).toMatch(/html\.js \[data-arch-reveal\]\s*\{\s*clip-path:\s*inset\(100%/);
    expect(css).toMatch(/html\.js \[data-signature\]\s*\{\s*clip-path:/);
  });
});
