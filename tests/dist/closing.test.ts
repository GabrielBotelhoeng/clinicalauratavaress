import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';
import { loadPage, textOf } from './load';

const ORIGINS = new Set([
  'hero',
  'nav',
  'nav-menu',
  'floating',
  'treatment',
  'result',
  'method',
  'about',
  'testimonials',
  'faq',
  'final',
  'footer',
]);

describe('CTA final', () => {
  it('é uma seção noite com eyebrow, título com itálico, texto e botão do copy', () => {
    const { document } = loadPage();
    const section = document.querySelector('section#agendar');
    expect(section?.getAttribute('data-theme')).toBe('noite');
    expect(textOf(section?.querySelector('.lt-eyebrow'))).toBe('O PRIMEIRO PASSO');
    expect(textOf(section?.querySelector('h2'))).toBe(
      'O seu rosto tem uma história. Vamos cuidar dela juntas?',
    );
    expect(textOf(section?.querySelector('h2 em'))).toBe('Vamos cuidar dela juntas?');
    const cta = section?.querySelector('a[data-wa-origin="final"]');
    expect(textOf(cta)).toBe('Agendar pelo WhatsApp');
    expect(new URL(cta?.getAttribute('href') ?? '').searchParams.get('text')).toBe(
      'Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Laura.',
    );
    expect(textOf(section?.querySelector('.final__support'))).toBe(
      'Segunda a sábado · CLSW 303, Sudoeste · Brasília',
    );
  });

  it('tem o cartão de endereço com Google Maps e Waze, sem iframe nem imagem de mapa', () => {
    const { document } = loadPage();
    const card = document.querySelector('#agendar address');
    expect(textOf(card)).toContain(site.business.address.full);
    const links = Array.from(card?.querySelectorAll('a') ?? []);
    expect(links.map((link) => textOf(link))).toEqual(['Abrir no Google Maps', 'Abrir no Waze']);
    expect(links[0]?.getAttribute('href')).toMatch(
      /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/,
    );
    expect(links[1]?.getAttribute('href')).toMatch(/^https:\/\/waze\.com\/ul\?q=/);
    expect(document.querySelector('iframe')).toBeNull();
  });
});

describe('rodapé', () => {
  it('tem as linhas do copy', () => {
    const { document } = loadPage();
    const footer = document.querySelector('footer.footer');
    expect(footer?.getAttribute('data-theme')).toBe('noite');
    expect(textOf(footer?.querySelector('.footer__legal'))).toBe(
      'Clínica Laura Tavares — Estética Avançada',
    );
    expect(textOf(footer)).toContain(
      'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste, Brasília – DF, 70673-623',
    );
    expect(textOf(footer?.querySelector('a[data-wa-origin="footer"]'))).toBe('(61) 98100-7522');
    const instagram = Array.from(
      footer?.querySelectorAll('a[href^="https://www.instagram.com/"]') ?? [],
      (link) => textOf(link),
    );
    expect(instagram).toEqual(['@clinicalauratavaress', '@dra.lauratavares']);
  });

  it('mostra a responsável técnica sem registro enquanto ele estiver pendente', () => {
    const { document } = loadPage();
    const { profession, registration } = site.responsibleTechnician;
    const expected =
      profession && registration
        ? `Responsável técnica: Dra. Laura Tavares · ${profession} · ${registration}`
        : 'Responsável técnica: Dra. Laura Tavares';
    expect(textOf(document.querySelector('footer .footer__technician'))).toBe(expected);
  });

  it('tem © e o link da política de privacidade', () => {
    const { document } = loadPage();
    expect(textOf(document.querySelector('footer .footer__bottom'))).toBe(
      '© 2026 Clínica Laura Tavares · Política de privacidade',
    );
    expect(document.querySelector('footer a[href="/politica-de-privacidade"]')).not.toBeNull();
  });
});

describe('política de privacidade', () => {
  it('é uma página própria com h1, seções, SEO e caminho de volta', () => {
    const { document } = loadPage('politica-de-privacidade.html');
    expect(document.documentElement.getAttribute('lang')).toBe('pt-BR');
    expect(textOf(document.querySelector('h1'))).toBe('Política de privacidade');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.title).toBe('Política de privacidade | Clínica Laura Tavares');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(
      /^https:\/\/[^/]+\/politica-de-privacidade$/,
    );
    expect(document.querySelectorAll('main section h2')).toHaveLength(site.privacy.sections.length);
    expect(document.querySelector('a[href="/"]')).not.toBeNull();
    expect(document.querySelector('footer.footer')).not.toBeNull();
  });
});

describe('página inicial inteira', () => {
  it('toda âncora interna aponta para um id existente', () => {
    const { document } = loadPage();
    for (const link of document.querySelectorAll('a[href^="#"]')) {
      const id = link.getAttribute('href')?.slice(1) ?? '';
      expect(document.getElementById(id), `#${id}`).not.toBeNull();
    }
  });

  it('todo link de WhatsApp tem origem conhecida e o número certo', () => {
    const { document } = loadPage();
    for (const link of document.querySelectorAll('a[href*="api.whatsapp.com"]')) {
      expect(
        ORIGINS.has(link.getAttribute('data-wa-origin') ?? ''),
        link.outerHTML.slice(0, 100),
      ).toBe(true);
      expect(new URL(link.getAttribute('href') ?? '').searchParams.get('phone')).toBe(
        '5561981007522',
      );
    }
  });

  it('toda imagem tem alt, nenhum [colchete] do copy vazou e há um único h1', () => {
    const { document } = loadPage();
    for (const img of document.querySelectorAll('img')) expect(img.hasAttribute('alt')).toBe(true);
    expect(document.body.textContent ?? '').not.toMatch(/\[[^\]]*\]/);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('segue a ordem de seções da spec', () => {
    const { document } = loadPage();
    const order = Array.from(
      document.querySelectorAll('main > section'),
      (section) => section.id,
    ).filter((id) => id !== 'depoimentos');
    expect(order).toEqual([
      'inicio',
      'na-midia',
      'tratamentos',
      'resultados',
      'metodo',
      'dra-laura',
      'a-clinica',
      'duvidas',
      'agendar',
    ]);
  });
});
