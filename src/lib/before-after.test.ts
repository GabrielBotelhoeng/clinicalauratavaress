import { describe, expect, it } from 'vitest';
import {
  clampPercent,
  HINT_KEYFRAMES,
  isHorizontalIntent,
  percentFromPointer,
} from './before-after';

describe('clampPercent', () => {
  it('limita entre 0 e 100', () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(140)).toBe(100);
    expect(clampPercent(42.5)).toBe(42.5);
  });

  it('volta ao meio com valores inválidos', () => {
    expect(clampPercent(Number.NaN)).toBe(50);
    expect(clampPercent(Number.POSITIVE_INFINITY)).toBe(50);
  });
});

describe('percentFromPointer', () => {
  it('converte a posição do ponteiro em % da largura da imagem', () => {
    expect(percentFromPointer(150, { left: 100, width: 200 })).toBe(25);
  });

  it('limita quando o ponteiro sai da imagem', () => {
    expect(percentFromPointer(50, { left: 100, width: 200 })).toBe(0);
    expect(percentFromPointer(400, { left: 100, width: 200 })).toBe(100);
  });

  it('protege contra largura zero', () => {
    expect(percentFromPointer(10, { left: 0, width: 0 })).toBe(50);
  });
});

describe('isHorizontalIntent', () => {
  it('arrasta quando o gesto é horizontal', () => {
    expect(isHorizontalIntent(12, 3)).toBe(true);
  });

  it('deixa a página rolar quando o gesto é vertical ou diagonal para baixo', () => {
    expect(isHorizontalIntent(4, 20)).toBe(false);
    expect(isHorizontalIntent(10, 12)).toBe(false);
  });

  it('ignora movimentos pequenos', () => {
    expect(isHorizontalIntent(5, 0)).toBe(false);
  });
});

describe('HINT_KEYFRAMES', () => {
  it('segue 50 → 30 → 70 → 50 (Movimento.md, padrão 6)', () => {
    expect(HINT_KEYFRAMES).toEqual([50, 30, 70, 50]);
  });
});
