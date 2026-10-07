import { describe, expect, it } from 'vitest';
import { countWords, normalizeText } from './text';

describe('normalizeText', () => {
  it('colapsa espaços, tabs e quebras de linha e apara as pontas', () => {
    expect(normalizeText('  Rejuvenescer\n  sem\tdeixar  ')).toBe('Rejuvenescer sem deixar');
  });

  it('trata espaço não separável como espaço comum', () => {
    expect(normalizeText('ser você')).toBe('ser você');
  });
});

describe('countWords', () => {
  it('conta palavras com acentos e pontuação', () => {
    expect(countWords('Fiquei mais descansada e ninguém percebeu.')).toBe(6);
  });

  it('retorna 0 para texto vazio ou só com espaços', () => {
    expect(countWords('   ')).toBe(0);
  });
});
