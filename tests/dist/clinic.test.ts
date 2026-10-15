import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

const CLINIC_CAPTIONS: Record<string, string> = {
  recepcao: 'Recepção',
  sala: 'Sala de procedimentos',
  equipe: 'Nossa equipe',
  detalhes: 'Detalhes que cuidam de você',
};

function hasMediaFile(slot: string): boolean {
  return existsSync(join(process.cwd(), 'src', 'assets', 'media', 'clinica', `${slot}.jpg`));
}

describe('a clínica', () => {
  it('tem eyebrow, título com itálico e texto do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#a-clinica');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('A CLÍNICA');
    expect(textOf(section?.querySelector('h2'))).toBe('Um espaço pensado para você desacelerar.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('você desacelerar.');
    expect(textOf(section?.querySelector('.clinic__text'))).toContain('No coração do Sudoeste');
  });

  it('tem os 4 destaques com ícone', () => {
    const { document } = loadPage();
    const items = Array.from(document.querySelectorAll('#a-clinica .clinic__highlights li'));
    expect(items.map((item) => textOf(item))).toEqual([
      'Equipe premiada em atendimento',
      'Tecnologia e produtos coreanos',
      'Ambiente reservado e acolhedor',
      'Segunda a sábado, com hora marcada',
    ]);
    for (const item of items) expect(item.querySelector('.lt-icon svg')).not.toBeNull();
  });

  it('mostra só as fotos reais da galeria, cada uma com a legenda literal do copy', () => {
    const { document } = loadPage();
    for (const [slot, caption] of Object.entries(CLINIC_CAPTIONS)) {
      const img = document.querySelector(`#a-clinica img[data-slot="clinica/${slot}"]`);
      if (hasMediaFile(slot)) {
        expect(img).not.toBeNull();
        expect(img?.hasAttribute('data-placeholder')).toBe(false);
        const figcaption = img?.closest('figure')?.querySelector('figcaption');
        expect(textOf(figcaption)).toBe(caption);
      } else {
        expect(img).toBeNull();
        const captions = Array.from(document.querySelectorAll('#a-clinica figcaption'), (node) =>
          textOf(node),
        );
        expect(captions).not.toContain(caption);
      }
    }
  });

  it('nunca renderiza um placeholder na galeria', () => {
    const { document } = loadPage();
    expect(document.querySelector('#a-clinica [data-placeholder]')).toBeNull();
  });

  it('a equipe ocupa um bloco largo', () => {
    const { document } = loadPage();
    const img = document.querySelector('#a-clinica img[data-slot="clinica/equipe"]');
    expect(img?.closest('.clinic__item')?.classList.contains('clinic__item--wide')).toBe(true);
  });

  it('usa os alts do copy na recepção e na equipe quando as fotos são reais', () => {
    const { document } = loadPage();
    const expected: Record<string, string> = {
      recepcao: 'Recepção da Clínica Laura Tavares, Estética Avançada, no CLSW 303',
      equipe: 'Equipe da Clínica Laura Tavares em frente ao letreiro da clínica',
    };
    for (const [slot, alt] of Object.entries(expected)) {
      if (!hasMediaFile(slot)) continue;
      const img = document.querySelector(`#a-clinica img[data-slot="clinica/${slot}"]`);
      expect(img?.getAttribute('alt')).toBe(img?.hasAttribute('data-placeholder') ? '' : alt);
    }
  });
});
