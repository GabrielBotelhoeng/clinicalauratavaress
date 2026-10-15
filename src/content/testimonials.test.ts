import { describe, expect, it } from 'vitest';
import { parseTestimonials } from './testimonials';

const valid = {
  texto: 'Fui muito bem recebida e a Dra. explicou cada etapa com calma.',
  textoOriginal: 'Fui muito bem recebida e a Dra. explicou cada etapa com calma. Recomendo!',
  autor: 'Ana P.',
  tratamento: 'Harmonização facial',
  fonte: 'google',
  url: 'https://maps.app.goo.gl/exemplo',
  estrelas: 5,
};

describe('parseTestimonials', () => {
  it('sem depoimentos.json devolve lista vazia (a seção não aparece)', () => {
    expect(parseTestimonials(undefined)).toEqual([]);
  });

  it('aceita depoimentos válidos, inclusive com tratamento, url e estrelas nulos', () => {
    const minimal = { ...valid, tratamento: null, url: null, estrelas: null, fonte: 'instagram' };
    expect(parseTestimonials([valid, minimal])).toEqual([valid, minimal]);
  });

  it('recusa texto com mais de 30 palavras', () => {
    const long = { ...valid, texto: Array(31).fill('palavra').join(' ') };
    expect(() => parseTestimonials([long])).toThrow(/depoimentos\.json inválido[\s\S]*30 palavras/);
  });

  it('recusa estrelas fora de 1–5, fonte desconhecida e URL javascript:', () => {
    expect(() => parseTestimonials([{ ...valid, estrelas: 0 }])).toThrow(
      /depoimentos\.json inválido/,
    );
    expect(() => parseTestimonials([{ ...valid, fonte: 'facebook' }])).toThrow(
      /depoimentos\.json inválido/,
    );
    expect(() => parseTestimonials([{ ...valid, url: 'javascript:alert(1)' }])).toThrow(
      /depoimentos\.json inválido/,
    );
  });

  it('recusa campos extras e campos faltando', () => {
    expect(() => parseTestimonials([{ ...valid, idade: 47 }])).toThrow(
      /depoimentos\.json inválido/,
    );
    const withoutAuthor = Object.fromEntries(
      Object.entries(valid).filter(([key]) => key !== 'autor'),
    );
    expect(() => parseTestimonials([withoutAuthor])).toThrow(/depoimentos\.json inválido/);
  });

  it('recusa formato que não é lista', () => {
    expect(() => parseTestimonials({ depoimentos: [] })).toThrow(/depoimentos\.json inválido/);
  });
});
