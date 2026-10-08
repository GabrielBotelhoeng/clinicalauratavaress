import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('carrossel de resultados', () => {
  it('fica dentro de #resultados com o fecho do copy', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#resultados .carousel__intro'))).toBe(
      'Elas confiaram na Dra. Laura. Deslize e veja mais resultados.',
    );
  });

  it('tem duas fileiras em sentidos opostos, a segunda escondida de leitores de tela', () => {
    const { document } = loadPage();
    const tracks = Array.from(document.querySelectorAll('#resultados [data-reel-track]'));
    expect(tracks.map((track) => track.getAttribute('data-reel-direction'))).toEqual(['-1', '1']);
    expect(tracks[1]?.closest('.carousel__row')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('cada trilho tem duas metades idênticas para o loop sem emenda', () => {
    const { document } = loadPage();
    const slots = Array.from(
      document.querySelector('#resultados [data-reel-track]')?.querySelectorAll('img') ?? [],
      (img) => img.getAttribute('data-slot'),
    );
    const half = slots.length / 2;
    expect(Number.isInteger(half)).toBe(true);
    expect(slots.slice(0, half)).toEqual(slots.slice(half));
  });

  it('expõe só a primeira cópia da primeira fileira (sem leitura duplicada)', () => {
    const { document } = loadPage();
    const exposed = document.querySelectorAll('#resultados .lt-shot:not([aria-hidden])');
    expect(exposed.length).toBeGreaterThanOrEqual(1);
    for (const shot of exposed) expect(shot.closest('[aria-hidden="true"]')).toBeNull();
  });

  it('tem botão de pausa e a legenda de compliance', () => {
    const { document } = loadPage();
    const toggle = document.querySelector('#resultados [data-reel-toggle]');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(textOf(toggle)).toBe('Pausar carrossel de resultados');
    expect(textOf(document.querySelector('#resultados .carousel__legend'))).toBe(
      'Imagens publicadas com autorização. Resultados variam de pessoa para pessoa.',
    );
  });
});
