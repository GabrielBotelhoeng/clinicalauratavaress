import { describe, expect, it } from 'vitest';
import { updateNavbarScroll } from './navbar';

describe('updateNavbarScroll', () => {
  it('sempre mostra perto do topo', () => {
    expect(updateNavbarScroll({ anchorY: 500, hidden: true }, 100)).toEqual({
      anchorY: 100,
      hidden: false,
    });
  });

  it('esconde ao rolar para baixo além da zona do topo', () => {
    expect(updateNavbarScroll({ anchorY: 300, hidden: false }, 400)).toEqual({
      anchorY: 400,
      hidden: true,
    });
  });

  it('mostra ao rolar para cima', () => {
    expect(updateNavbarScroll({ anchorY: 900, hidden: true }, 800)).toEqual({
      anchorY: 800,
      hidden: false,
    });
  });

  it('ignora tremidas menores que a tolerância', () => {
    const state = { anchorY: 500, hidden: true };
    expect(updateNavbarScroll(state, 503)).toBe(state);
  });

  it('acumula rolagem lenta até passar da tolerância', () => {
    let state = { anchorY: 500, hidden: false };
    for (const y of [502, 504, 506]) state = updateNavbarScroll(state, y);
    expect(state).toEqual({ anchorY: 506, hidden: true });
  });
});
