import { describe, expect, it } from 'vitest';
import { loadPage } from './load';

describe('página inicial — base', () => {
  it('declara o idioma pt-BR', () => {
    const { document } = loadPage();
    expect(document.documentElement.getAttribute('lang')).toBe('pt-BR');
  });

  it('tem viewport responsivo', () => {
    const { document } = loadPage();
    expect(document.querySelector('meta[name="viewport"]')?.getAttribute('content')).toContain(
      'width=device-width',
    );
  });

  it('tem exatamente um h1', () => {
    const { document } = loadPage();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });
});
