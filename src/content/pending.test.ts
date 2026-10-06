import { describe, expect, it } from 'vitest';
import { findNullPaths, getPath, listPending } from './pending';

describe('findNullPaths', () => {
  it('lista caminhos de valores null em objetos e arrays', () => {
    expect(findNullPaths({ a: null, b: { c: null, d: 'x' }, e: [{ f: null }, { f: 1 }] })).toEqual([
      'a',
      'b.c',
      'e.0.f',
    ]);
  });

  it('ignora undefined, strings vazias e zeros', () => {
    expect(findNullPaths({ a: undefined, b: '', c: 0 })).toEqual([]);
  });
});

describe('getPath', () => {
  it('lê caminhos com índices de array', () => {
    expect(getPath({ e: [{ f: 2 }] }, 'e.0.f')).toBe(2);
  });

  it('distingue null (campo existe) de undefined (campo não existe)', () => {
    expect(getPath({ a: null }, 'a')).toBeNull();
    expect(getPath({ a: null }, 'a.b')).toBeUndefined();
    expect(getPath({}, 'x')).toBeUndefined();
  });
});

describe('listPending', () => {
  it('formata "id: descrição" para o log do build', () => {
    expect(
      listPending({
        pending: [
          {
            id: 'segundo-numero',
            description: 'Função do segundo número, (61) 98105-1565.',
            fields: ['whatsapp.number'],
            blocksCustomDomain: false,
          },
        ],
      }),
    ).toEqual(['segundo-numero: Função do segundo número, (61) 98105-1565.']);
  });
});
