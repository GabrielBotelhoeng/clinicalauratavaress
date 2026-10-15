import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';
import { loadPage, textOf } from './load';

describe('sobre a Dra. Laura', () => {
  it('tem eyebrow, título com itálico e os parágrafos do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#dra-laura');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('QUEM CUIDA DE VOCÊ');
    expect(textOf(section?.querySelector('h2'))).toBe('Prazer, Laura Tavares.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('Laura Tavares.');
    const paragraphs = Array.from(section?.querySelectorAll('.about__text p') ?? [], (node) =>
      textOf(node),
    );
    expect(paragraphs.slice(0, 2)).toEqual(site.about.paragraphs);
  });

  it('tem a citação da Revista Orla BSB', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#dra-laura blockquote'))).toBe(
      '“Meu compromisso é entregar segurança, planejamento e resultados que respeitem a individualidade.”',
    );
    expect(textOf(document.querySelector('#dra-laura .about__quote figcaption'))).toBe(
      'Revista Orla BSB',
    );
  });

  it('tem os 4 números com texto completo para leitor de tela e contadores marcados', () => {
    const { document } = loadPage();
    expect(
      Array.from(document.querySelectorAll('#dra-laura .stats__item .sr-only'), (node) =>
        textOf(node),
      ),
    ).toEqual([
      '+25 mil atendimentos',
      '9 anos de experiência',
      '8 anos de clínica no Sudoeste',
      'AMWC Coreia 2026',
    ]);
    const counters = Array.from(document.querySelectorAll('#dra-laura [data-count-to]'), (node) => [
      node.getAttribute('data-count-to'),
      node.getAttribute('data-count-prefix'),
      node.getAttribute('data-count-suffix'),
      textOf(node),
    ]);
    expect(counters).toEqual([
      ['25', '+', ' mil', '+25 mil'],
      ['9', null, ' anos', '9 anos'],
      ['8', null, ' anos', '8 anos'],
    ]);
  });

  it('assina "Laura Tavares" em Pinyon Script, uma única vez na página', () => {
    const { document } = loadPage();
    const signatures = document.querySelectorAll('.lt-signature');
    expect(signatures).toHaveLength(1);
    expect(textOf(signatures[0])).toBe('Laura Tavares');
    expect(signatures[0]?.hasAttribute('data-signature')).toBe(true);
  });

  it('mostra credenciais só quando profissão e registro existem', () => {
    const { document } = loadPage();
    const { profession, registration } = site.responsibleTechnician;
    const credentials = document.querySelector('#dra-laura .about__credentials');
    if (profession && registration)
      expect(textOf(credentials)).toBe(`${profession} · ${registration}`);
    else expect(credentials).toBeNull();
  });

  it('tem o CTA "Agendar avaliação com a Dra. Laura" e a foto dra/sobre em arco', () => {
    const { document } = loadPage();
    const cta = document.querySelector('#dra-laura a[data-wa-origin="about"]');
    expect(textOf(cta)).toBe('Agendar avaliação com a Dra. Laura');
    expect(document.querySelector('#dra-laura .lt-arch img[data-slot="dra/sobre"]')).not.toBeNull();
  });
});
