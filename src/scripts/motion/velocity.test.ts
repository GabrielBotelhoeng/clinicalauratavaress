import { describe, expect, it } from 'vitest';
import { velocityBoost } from './velocity';

describe('velocityBoost', () => {
  it('fica em 1× parado', () => {
    expect(velocityBoost(0)).toBe(1);
  });

  it('acelera proporcionalmente nos dois sentidos', () => {
    expect(velocityBoost(1000)).toBe(1.5);
    expect(velocityBoost(-1000)).toBe(1.5);
  });

  it('nunca passa de 2×', () => {
    expect(velocityBoost(1_000_000)).toBe(2);
  });

  it('volta a 1× com velocidade inválida', () => {
    expect(velocityBoost(Number.NaN)).toBe(1);
  });

  it('aceita teto e divisor customizados', () => {
    expect(velocityBoost(500, { max: 3, divisor: 250 })).toBe(3);
  });
});
