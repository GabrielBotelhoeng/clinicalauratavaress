import { describe, expect, it } from 'vitest';
import { loopCopies } from './carousel';

describe('loopCopies', () => {
  it('repete o conjunto até cada metade passar de 2000px (cards de 220px + 24px)', () => {
    expect(loopCopies(6)).toBe(2);
    expect(loopCopies(8)).toBe(2);
    expect(loopCopies(9)).toBe(1);
    expect(loopCopies(12)).toBe(1);
  });

  it('cobre a tela mesmo com uma foto só', () => {
    expect(loopCopies(1)).toBe(9);
  });

  it('aceita medidas customizadas', () => {
    expect(loopCopies(4, { cardWidth: 300, gap: 20, minHalfWidth: 1280 })).toBe(1);
  });

  it('recusa quantidade inválida', () => {
    expect(() => loopCopies(0)).toThrow(/quantidade inválida/);
    expect(() => loopCopies(2.5)).toThrow(/quantidade inválida/);
  });
});
