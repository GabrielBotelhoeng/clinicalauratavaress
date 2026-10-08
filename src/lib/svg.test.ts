import { describe, expect, it } from 'vitest';
import { decorateSvg } from './svg';

const raw =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M0 0"/></svg>';

describe('decorateSvg', () => {
  it('adiciona tamanho e esconde do leitor de tela', () => {
    const out = decorateSvg(raw, { size: 24 });
    expect(
      out.startsWith('<svg width="24" height="24" aria-hidden="true" focusable="false" xmlns='),
    ).toBe(true);
    expect(out).toContain('viewBox="0 0 256 256"');
    expect(out).toContain('<path d="M0 0"/>');
  });

  it('aplica a classe sem deixar passar aspas', () => {
    expect(decorateSvg(raw, { size: 16, className: 'a "b"' })).toContain('class="a b"');
  });

  it('rejeita conteúdo que não é SVG', () => {
    expect(() => decorateSvg('<div></div>', { size: 16 })).toThrow(/não é um <svg>/);
  });
});
