import { describe, expect, it } from 'vitest';
import { mergePress } from './press';
import { site } from './site';

const fallback = site.press.items;

describe('mergePress', () => {
  it('sem imprensa.json usa os 4 itens do copy, sem link', () => {
    const items = mergePress(undefined, fallback);
    expect(items).toHaveLength(4);
    expect(items.every((item) => item.url === null)).toBe(true);
    expect(items[0]).toEqual({
      outlet: 'Revista Orla BSB',
      title: '"Laura Tavares celebra 8 anos e consolida clínica de estética no Sudoeste"',
      url: null,
      note: 'capa, edição nº 4',
    });
  });

  it('usa os links do imprensa.json e mantém a nota quando o veículo bate com o copy', () => {
    const raw = [
      {
        veiculo: 'Revista Orla BSB',
        titulo: 'Laura Tavares celebra 8 anos',
        url: 'https://exemplo.com/orla',
      },
    ];
    expect(mergePress(raw, fallback)).toEqual([
      {
        outlet: 'Revista Orla BSB',
        title: 'Laura Tavares celebra 8 anos',
        url: 'https://exemplo.com/orla',
        note: 'capa, edição nº 4',
      },
    ]);
  });

  it('aceita url nula e menos de 4 itens', () => {
    const raw = [{ veiculo: 'W3 Notícias', titulo: 'Korean Beauty Day', url: null }];
    expect(mergePress(raw, fallback)).toEqual([
      { outlet: 'W3 Notícias', title: 'Korean Beauty Day', url: null },
    ]);
  });

  it('recusa url vazia, url javascript: e campos extras', () => {
    expect(() => mergePress([{ veiculo: 'X', titulo: 'Y', url: '' }], fallback)).toThrow(
      /imprensa\.json inválido/,
    );
    expect(() =>
      mergePress([{ veiculo: 'X', titulo: 'Y', url: 'javascript:alert(1)' }], fallback),
    ).toThrow(/imprensa\.json inválido/);
    expect(() =>
      mergePress([{ veiculo: 'X', titulo: 'Y', url: null, extra: 1 }], fallback),
    ).toThrow(/imprensa\.json inválido/);
  });

  it('recusa lista vazia', () => {
    expect(() => mergePress([], fallback)).toThrow(/imprensa\.json inválido/);
  });
});
