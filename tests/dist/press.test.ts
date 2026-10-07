import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('na mídia', () => {
  it('tem o eyebrow como título da seção e a linha de apoio do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#na-midia');
    expect(textOf(section?.querySelector('h2'))).toBe('NA MÍDIA');
    expect(textOf(section?.querySelector('.press__support'))).toBe(
      'Uma trajetória reconhecida pela imprensa de Brasília.',
    );
  });

  it('lista os veículos na ordem do copy', () => {
    const { document } = loadPage();
    expect(
      Array.from(document.querySelectorAll('#na-midia .press__outlet'), (node) => textOf(node)),
    ).toEqual(['Revista Orla BSB', 'Diário de Brasília', 'W3 Notícias', 'Diário de Brasília']);
  });

  it('links de matéria (quando houver) abrem em nova aba com rel seguro', () => {
    const { document } = loadPage();
    for (const link of document.querySelectorAll('#na-midia a')) {
      expect(link.getAttribute('href')).toMatch(/^https?:\/\//);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });
});
