import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('o método', () => {
  it('é uma seção noite com eyebrow, título e lead do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#metodo');
    expect(section?.getAttribute('data-theme')).toBe('noite');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('COMO FUNCIONA');
    expect(textOf(section?.querySelector('h2'))).toBe('Um método para rejuvenescer sem exageros.');
    expect(textOf(section?.querySelector('h2 em'))).toBe('sem exageros.');
    expect(textOf(section?.querySelector('.heading__lead'))).toContain('Protocolo Identidade LT');
  });

  it('tem os 4 passos na ordem do copy', () => {
    const { document } = loadPage();
    expect(
      Array.from(document.querySelectorAll('#metodo .method__step h3'), (node) => textOf(node)),
    ).toEqual(['Escuta', 'Análise facial', 'Plano individual', 'Acompanhamento']);
  });

  it('tem o CTA "Quero começar pela avaliação" com a mensagem geral', () => {
    const { document } = loadPage();
    const cta = document.querySelector('#metodo a[data-wa-origin="method"]');
    expect(textOf(cta)).toBe('Quero começar pela avaliação');
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
  });

  it('vídeo de fundo (se houver): decorativo, mudo, sem autoplay e sem src até chegar perto da tela', () => {
    const { document } = loadPage();
    const video = document.querySelector('#metodo video[data-lazy-video]');
    const delivered = ['metodo.webm', 'metodo.mp4', 'metodo-poster.jpg'].some((file) =>
      existsSync(`public/media/${file}`),
    );
    expect(video !== null).toBe(delivered);
    if (!video) return;
    expect(video.hasAttribute('muted')).toBe(true);
    expect(video.hasAttribute('playsinline')).toBe(true);
    expect(video.getAttribute('preload')).toBe('none');
    expect(video.hasAttribute('autoplay')).toBe(false);
    expect(video.querySelectorAll('source[src]')).toHaveLength(0);
    expect(video.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('botão de pausa do vídeo (se houver vídeo): aria-pressed inicial, rótulo e fora do aria-hidden', () => {
    const { document } = loadPage();
    const video = document.querySelector('#metodo video[data-lazy-video]');
    const toggle = document.querySelector('#metodo [data-video-toggle]');
    expect(toggle !== null).toBe(video !== null);
    if (!toggle) return;
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(textOf(toggle)).toBe('Pausar vídeo de fundo');
    expect(toggle.closest('[aria-hidden="true"]')).toBeNull();
  });
});
