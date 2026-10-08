import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('marquee', () => {
  it('lista os 7 itens do copy para leitores de tela', () => {
    const { document } = loadPage();
    const marquee = document.querySelector('[data-marquee]');
    expect(marquee?.tagName).toBe('ASIDE');
    expect(marquee?.getAttribute('aria-label')).toBe('Destaques da clínica');
    expect(textOf(marquee?.querySelector('.sr-only'))).toBe(
      '+25 mil atendimentos · Harmonização facial · 9 anos de experiência · AMWC Coreia 2026 · Melhor Atendimento · Santa Permuta 2026 · K-Beauty na clínica · Sudoeste · Brasília',
    );
  });

  it('duplica a faixa visual (aria-hidden) e marca os itálicos do copy', () => {
    const { document } = loadPage();
    const track = document.querySelector('[data-marquee-track]');
    expect(track?.getAttribute('aria-hidden')).toBe('true');
    expect(track?.querySelectorAll('.lt-marquee__item')).toHaveLength(28);
    const italics = Array.from(track?.querySelectorAll('i') ?? [], (node) => textOf(node));
    expect(italics.slice(0, 3)).toEqual([
      'Harmonização facial',
      'AMWC Coreia 2026',
      'K-Beauty na clínica',
    ]);
  });

  it('tem botão de pausa acessível', () => {
    const { document } = loadPage();
    const toggle = document.querySelector('[data-marquee-toggle]');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(textOf(toggle)).toBe('Pausar faixa de destaques');
  });
});

describe('navbar', () => {
  it('tem os 6 links do copy, na ordem', () => {
    const { document } = loadPage();
    const links = Array.from(document.querySelectorAll('nav[aria-label="Principal"] a'), (link) => [
      textOf(link),
      link.getAttribute('href'),
    ]);
    expect(links).toEqual([
      ['Início', '#inicio'],
      ['Tratamentos', '#tratamentos'],
      ['Resultados', '#resultados'],
      ['A Dra. Laura', '#dra-laura'],
      ['A clínica', '#a-clinica'],
      ['Dúvidas', '#duvidas'],
    ]);
  });

  it('tem a marca tipográfica e o CTA "Agendar avaliação" com a mensagem geral', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('.navbar__brand'))).toBe(
      'Laura Tavares Estética Avançada',
    );
    const cta = document.querySelector('a[data-wa-origin="nav"]');
    expect(textOf(cta)).toBe('Agendar avaliação');
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
  });

  it('o botão do menu mobile controla o dialog da gaveta', () => {
    const { document } = loadPage();
    const toggle = document.querySelector('[data-nav-open]');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-controls')).toBe('menu-mobile');
    expect(textOf(toggle)).toBe('Abrir menu');
    const dialog = document.querySelector('dialog#menu-mobile[data-nav-menu]');
    expect(dialog?.querySelectorAll('a[href^="#"]')).toHaveLength(6);
    expect(textOf(dialog?.querySelector('[data-nav-close]'))).toBe('Fechar menu');
    expect(dialog?.querySelector('a[data-wa-origin="nav-menu"]')).not.toBeNull();
  });
});
