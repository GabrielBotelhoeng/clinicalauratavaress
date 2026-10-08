import { describe, expect, it } from 'vitest';
import { loadPage, textOf } from './load';

describe('botão flutuante do WhatsApp', () => {
  it('fica num aside rotulado e abre o WhatsApp com a mensagem geral', () => {
    const { document } = loadPage();
    const link = document.querySelector('aside[data-wa-float] a[data-wa-origin="floating"]');
    expect(link?.getAttribute('aria-label')).toBe('Agende pelo WhatsApp');
    const url = new URL(link?.getAttribute('href') ?? '');
    expect(url.searchParams.get('phone')).toBe('5561981007522');
    expect(url.searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('o ícone é decorativo', () => {
    const { document } = loadPage();
    expect(document.querySelector('[data-wa-float] a svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('o h1 usa RichTitle com o itálico em "ser você."', () => {
    const { document } = loadPage();
    const h1 = document.querySelector('h1');
    expect(h1?.hasAttribute('data-title')).toBe(true);
    expect(textOf(h1?.querySelector('em'))).toBe('ser você.');
  });
});
