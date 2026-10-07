import { describe, expect, it } from 'vitest';
import { existsInDist, loadPage, readDist } from './load';

describe('SEO da página inicial', () => {
  it('usa title e meta description do copy', () => {
    const { document } = loadPage();
    expect(document.title).toBe('Harmonização Facial no Sudoeste | Dra. Laura Tavares');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Rejuvenescimento natural para 40+ no Sudoeste, Brasília. +25 mil atendimentos com a Dra. Laura Tavares. Agende sua avaliação pelo WhatsApp.',
    );
  });

  it('tem canonical absoluto igual ao og:url', () => {
    const { document } = loadPage();
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
    expect(canonical).toMatch(/^https:\/\/[^/]+\/$/);
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(
      canonical,
    );
  });

  it('tem Open Graph completo (pt_BR, 1200×630)', () => {
    const { document } = loadPage();
    const og = (property: string) =>
      document.querySelector(`meta[property="${property}"]`)?.getAttribute('content');
    expect(og('og:title')).toBe('Clínica Laura Tavares · Rejuvenescer sem deixar de ser você');
    expect(og('og:locale')).toBe('pt_BR');
    expect(og('og:image')).toMatch(/^https:\/\/.+\/og\.jpg$/);
    expect(og('og:image:width')).toBe('1200');
    expect(og('og:image:height')).toBe('630');
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  it('publica JSON-LD HealthAndBeautyBusiness válido', () => {
    const { document } = loadPage();
    const blocks = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
      (script) => JSON.parse(script.textContent ?? '{}'),
    );
    const business = blocks.find((block) => block['@type'] === 'HealthAndBeautyBusiness');
    expect(business?.telephone).toBe('+5561981007522');
    expect(business?.address?.postalCode).toBe('70673-623');
  });

  it('tem skip link para o main', () => {
    const { document } = loadPage();
    const skip = document.querySelector('a.skip-link');
    expect(skip?.getAttribute('href')).toBe('#conteudo');
    expect(skip?.textContent?.trim()).toBe('Pular para o conteúdo');
    expect(document.querySelector('main#conteudo')?.getAttribute('tabindex')).toBe('-1');
  });

  it('gera robots.txt apontando para o sitemap', () => {
    const robots = readDist('robots.txt');
    expect(robots).toContain('User-agent: *');
    expect(robots).toMatch(/Sitemap: https:\/\/.+\/sitemap-index\.xml/);
  });

  it('gera sitemap e publica favicon, apple-touch-icon e og.jpg', () => {
    expect(readDist('sitemap-0.xml')).toContain('<loc>');
    for (const file of ['favicon.svg', 'apple-touch-icon.png', 'og.jpg']) {
      expect(existsInDist(file)).toBe(true);
    }
  });
});
