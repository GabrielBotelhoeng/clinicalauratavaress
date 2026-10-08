import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

const LEGEND = 'Imagens publicadas com autorização. Resultados variam de pessoa para pessoa.';

describe('resultados por queixa', () => {
  it('tem eyebrow, título com itálico "se vê" e lead do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#resultados');
    expect(section?.classList.contains('section--blush')).toBe(true);
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('RESULTADOS REAIS');
    expect(textOf(section?.querySelector('h2'))).toBe('Naturalidade que se vê, não que se nota.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('se vê');
  });

  it('tem os 4 blocos na ordem, com número e título com itálico', () => {
    const { document } = loadPage();
    const blocks = Array.from(document.querySelectorAll('#resultados article.benefit'));
    expect(blocks.map((block) => textOf(block.querySelector('.benefit__number')))).toEqual([
      '01',
      '02',
      '03',
      '04',
    ]);
    expect(blocks.map((block) => textOf(block.querySelector('h3')))).toEqual([
      'Adeus ao olhar de cansaço',
      'Contornos de precisão',
      'Lábios com hidratação e volume',
      'Suavize o bigode chinês',
    ]);
    expect(blocks.map((block) => textOf(block.querySelector('h3 em')))).toEqual([
      'olhar de cansaço',
      'de precisão',
      'hidratação e volume',
      'bigode chinês',
    ]);
  });

  it('cada bloco tem o CTA "Agendar minha avaliação" com a área na mensagem', () => {
    const { document } = loadPage();
    const links = Array.from(document.querySelectorAll('#resultados a[data-wa-origin="result"]'));
    expect(links.map((link) => textOf(link))).toEqual(Array(4).fill('Agendar minha avaliação'));
    expect(
      links.map((link) => new URL(link.getAttribute('href') ?? '').searchParams.get('text')),
    ).toEqual([
      'Olá! Vi os resultados no site e quero saber mais sobre olheiras.',
      'Olá! Vi os resultados no site e quero saber mais sobre mandíbula.',
      'Olá! Vi os resultados no site e quero saber mais sobre lábios.',
      'Olá! Vi os resultados no site e quero saber mais sobre bigode chinês.',
    ]);
  });

  it('cada antes/depois tem a legenda de compliance logo abaixo', () => {
    const { document } = loadPage();
    const figures = document.querySelectorAll('#resultados figure.benefit__media');
    expect(figures).toHaveLength(4);
    for (const figure of figures) {
      expect(figure.querySelector('[data-ba]')).not.toBeNull();
      expect(textOf(figure.querySelector('figcaption'))).toBe(LEGEND);
    }
  });

  it('o grupo usa o alt do copy e o controle é um range acessível', () => {
    const { document } = loadPage();
    const groups = Array.from(document.querySelectorAll('#resultados [data-ba]'));
    expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual([
      'Antes e depois de tratamento para olheiras, paciente com autorização de imagem',
      'Antes e depois de tratamento para mandíbula, paciente com autorização de imagem',
      'Antes e depois de tratamento para lábios, paciente com autorização de imagem',
      'Antes e depois de tratamento para bigode chinês, paciente com autorização de imagem',
    ]);
    const range = groups[0]?.querySelector('input[type="range"][data-ba-range]');
    expect(range?.getAttribute('aria-label')).toBe('Comparar antes e depois: olheiras');
    expect([
      range?.getAttribute('min'),
      range?.getAttribute('max'),
      range?.getAttribute('value'),
    ]).toEqual(['0', '100', '50']);
  });

  it('usa as 8 fotos do contrato (reais ou placeholders marcados)', () => {
    const { document } = loadPage();
    for (const slug of ['olhar', 'mandibula', 'labios', 'bigode']) {
      for (const side of ['antes', 'depois']) {
        expect(
          document.querySelector(`img[data-slot="resultados/${slug}-${side}"]`),
        ).not.toBeNull();
      }
    }
  });
});
