import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('tratamentos', () => {
  it('tem eyebrow, título com itálico e lead do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#tratamentos');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('TRATAMENTOS');
    expect(textOf(section?.querySelector('h2'))).toBe('Cuidado avançado, do seu jeito.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('do seu jeito.');
    expect(textOf(section?.querySelector('.heading__lead'))).toBe(
      'Cada tratamento começa com uma avaliação do seu rosto. Nada de fórmula pronta: o plano é desenhado para os seus traços e para o que você quer sentir ao se olhar no espelho.',
    );
  });

  it('tem os 4 cards na ordem do copy', () => {
    const { document } = loadPage();
    expect(
      Array.from(document.querySelectorAll('#tratamentos h3'), (node) => textOf(node)),
    ).toEqual([
      'Harmonização facial',
      'Rejuvenescimento 40+',
      'K-Beauty na clínica',
      'Harmonização corporal',
    ]);
  });

  it('cada "Saiba mais" abre o WhatsApp com o tratamento do card', () => {
    const { document } = loadPage();
    const messages = Array.from(
      document.querySelectorAll('#tratamentos a[data-wa-origin="treatment"]'),
      (link) => new URL(link.getAttribute('href') ?? '').searchParams.get('text'),
    );
    expect(messages).toEqual([
      'Olá! Tenho interesse em harmonização facial. Podem me ajudar?',
      'Olá! Tenho interesse em rejuvenescimento 40+. Podem me ajudar?',
      'Olá! Tenho interesse em K-Beauty na clínica. Podem me ajudar?',
      'Olá! Tenho interesse em harmonização corporal. Podem me ajudar?',
    ]);
  });

  it('o link tem texto descritivo para leitor de tela e Lighthouse', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#tratamentos a[data-wa-origin="treatment"]'))).toBe(
      'Saiba mais sobre Harmonização facial',
    );
  });

  it('cada card mostra a foto real ou, enquanto ela não chega, o ícone', () => {
    const { document } = loadPage();
    for (const card of document.querySelectorAll('#tratamentos article')) {
      const hasPhoto = card.querySelector('img[data-slot^="tratamentos/"]') !== null;
      const hasIcon = card.querySelector('.lt-icon svg') !== null;
      expect(hasPhoto !== hasIcon).toBe(true);
    }
  });
});
