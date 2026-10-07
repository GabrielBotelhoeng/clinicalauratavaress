import { describe, expect, it } from 'vitest';
import { cssOf, listDist, loadPage } from './load';

describe('estilos e fontes', () => {
  it('nenhuma página tem <style> inline (astro.config.mjs: build.inlineStylesheets = "never")', () => {
    const pages = listDist().filter((file) => file.endsWith('.html'));
    expect(pages.length).toBeGreaterThan(0);
    for (const file of pages) {
      const { document } = loadPage(file);
      expect(document.querySelectorAll('style'), file).toHaveLength(0);
    }
  });

  it('serve as três famílias pelo próprio site (@fontsource)', () => {
    const { document } = loadPage();
    const css = cssOf(document);
    for (const family of ['Cormorant Garamond', 'Jost', 'Pinyon Script']) {
      expect(css).toMatch(new RegExp(`font-family:\\s*["']?${family}`));
    }
    expect(listDist('_astro').some((file) => file.endsWith('.woff2'))).toBe(true);
  });

  it('não chama o Google Fonts nem outro CDN de fontes', () => {
    const { document, html } = loadPage();
    const everything = html + cssOf(document);
    expect(everything).not.toContain('fonts.googleapis.com');
    expect(everything).not.toContain('fonts.gstatic.com');
  });

  it('inclui os tokens do design system e o foco visível', () => {
    const { document } = loadPage();
    const css = cssOf(document);
    expect(css).toMatch(/--accent:\s*#8c4a55/i);
    expect(css).toMatch(/--surface-blush:\s*#f3e3de/i);
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion');
  });
});
