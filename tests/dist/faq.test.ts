import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';
import { loadPage, textOf } from './load';

describe('dúvidas frequentes', () => {
  it('tem eyebrow e título com itálico do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#duvidas');
    expect(section?.classList.contains('section--blush')).toBe(true);
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('DÚVIDAS');
    expect(textOf(section?.querySelector('h2'))).toBe(
      'Tudo o que você quer saber antes de agendar.',
    );
    expect(textOf(section?.querySelector('h2 em'))).toBe('antes de agendar.');
  });

  it('tem as 9 perguntas e respostas literais, fechadas por padrão', () => {
    const { document } = loadPage();
    const details = Array.from(document.querySelectorAll('#duvidas details'));
    expect(details).toHaveLength(9);
    expect(details.map((item) => textOf(item.querySelector('summary')))).toEqual(
      site.faq.items.map((item) => item.question),
    );
    expect(details.map((item) => textOf(item.querySelector('p')))).toEqual(
      site.faq.items.map((item) => item.answer),
    );
    for (const item of details) expect(item.hasAttribute('open')).toBe(false);
  });

  it('tem o CTA logo abaixo, com a mensagem do FAQ', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('#duvidas .faq__cta p'))).toBe('Ainda com dúvida?');
    const cta = document.querySelector('#duvidas a[data-wa-origin="faq"]');
    expect(textOf(cta)).toBe('Fale com a nossa equipe no WhatsApp');
    expect(cta?.classList.contains('lt-btn--whatsapp')).toBe(true);
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Tenho uma dúvida antes de agendar.',
    );
  });

  it('publica JSON-LD FAQPage com as 9 perguntas', () => {
    const { document } = loadPage();
    const blocks = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
      (script) => JSON.parse(script.textContent ?? '{}'),
    );
    const faq = blocks.find((block) => block['@type'] === 'FAQPage');
    expect(faq?.mainEntity).toHaveLength(9);
    expect(faq?.mainEntity[0]?.name).toBe('Vou ficar com o rosto artificial?');
  });
});
