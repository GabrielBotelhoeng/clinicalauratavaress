import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('hero', () => {
  it('tem o h1 do copy com o itálico em "ser você."', () => {
    const { document } = loadPage();
    const h1 = document.querySelector('h1');
    expect(textOf(h1)).toBe('Rejuvenescer sem deixar de ser você.');
    expect(textOf(h1?.querySelector('em'))).toBe('ser você.');
    expect(h1?.closest('section')?.id).toBe('inicio');
  });

  it('tem eyebrow e subtítulo do copy', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#inicio .lt-eyebrow'))).toBe(
      'HARMONIZAÇÃO FACIAL · SUDOESTE, BRASÍLIA',
    );
    expect(textOf(document.querySelector('#inicio .hero__subtitle'))).toBe(
      'Protocolos individuais para a pele 40+, com naturalidade, segurança e planejamento. Do jeito que a Dra. Laura Tavares já fez em mais de 25 mil atendimentos.',
    );
  });

  it('CTA primário abre o WhatsApp (geral) e o secundário leva a #resultados', () => {
    const { document } = loadPage();
    const primary = document.querySelector('#inicio a[data-wa-origin="hero"]');
    expect(textOf(primary)).toBe('Agendar minha avaliação');
    expect(new URL(primary?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(textOf(document.querySelector('#inicio a[href="#resultados"]'))).toBe(
      'Ver resultados reais',
    );
  });

  it('mostra os dois selos e usa o vermelho de destaque uma única vez', () => {
    const { document } = loadPage();
    expect(
      Array.from(document.querySelectorAll('.hero__seals li'), (item) => textOf(item)),
    ).toEqual([
      'Melhor Atendimento — Santa Permuta 2026',
      'Formação internacional — AMWC Coreia 2026',
    ]);
    expect(document.querySelectorAll('[data-highlight]')).toHaveLength(1);
  });

  it('tem o badge "+25 mil atendimentos realizados"', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('.hero__badge'))).toBe('+25 mil atendimentos realizados');
  });

  it('a foto do hero é a única com prioridade e sai em AVIF/WebP', () => {
    const { document } = loadPage();
    const img = document.querySelector('#inicio img[data-slot="dra/hero"]');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
    expect(img?.getAttribute('loading')).not.toBe('lazy');
    expect(document.querySelectorAll('img[fetchpriority="high"]')).toHaveLength(1);
    const types = Array.from(img?.closest('picture')?.querySelectorAll('source') ?? [], (source) =>
      source.getAttribute('type'),
    );
    expect(types).toEqual(['image/avif', 'image/webp']);
  });

  it('alt do copy na foto real e alt vazio enquanto for placeholder', () => {
    const { document } = loadPage();
    const img = document.querySelector('#inicio img[data-slot="dra/hero"]');
    const expected = img?.hasAttribute('data-placeholder')
      ? ''
      : 'Dra. Laura Tavares na recepção da clínica de estética no Sudoeste, Brasília';
    expect(img?.getAttribute('alt')).toBe(expected);
  });
});
