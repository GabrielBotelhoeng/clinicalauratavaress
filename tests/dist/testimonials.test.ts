import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

const file = 'src/content/depoimentos.json';
const items: Array<{ texto: string; autor: string; estrelas: number | null }> = existsSync(file)
  ? JSON.parse(readFileSync(file, 'utf8'))
  : [];

describe('depoimentos', () => {
  it('a seção só existe quando há depoimentos reais', () => {
    const { document } = loadPage();
    expect(document.querySelector('section#depoimentos') !== null).toBe(items.length > 0);
  });

  it.runIf(items.length > 0)(
    'mostra cada depoimento com autor, estrelas acessíveis e o CTA do copy',
    () => {
      const { document } = loadPage();
      const cards = Array.from(document.querySelectorAll('#depoimentos figure.testimonial'));
      expect(cards).toHaveLength(items.length);
      cards.forEach((card, index) => {
        const item = items[index];
        expect(textOf(card.querySelector('blockquote'))).toBe(`“${item?.texto}”`);
        expect(textOf(card.querySelector('.testimonial__author'))).toBe(item?.autor);
        if (item?.estrelas) {
          expect(textOf(card.querySelector('.testimonial__stars .sr-only'))).toBe(
            `${item.estrelas} de 5 estrelas`,
          );
        }
      });
      const cta = document.querySelector('#depoimentos a[data-wa-origin="testimonials"]');
      expect(textOf(cta)).toBe('Quero ser a próxima história');
    },
  );
});
