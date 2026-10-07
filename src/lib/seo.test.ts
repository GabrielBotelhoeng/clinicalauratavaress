import { describe, expect, it } from 'vitest';
import { site } from '../content/site';
import { buildBusinessJsonLd, buildFaqJsonLd, serializeJsonLd } from './seo';

describe('buildBusinessJsonLd', () => {
  const data = buildBusinessJsonLd(site, {
    url: 'https://exemplo.vercel.app/',
    image: 'https://exemplo.vercel.app/og.jpg',
  });

  it('descreve um HealthAndBeautyBusiness', () => {
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('HealthAndBeautyBusiness');
    expect(data.name).toBe('Clínica Laura Tavares');
    expect(data.alternateName).toBe('Clínica Laura Tavares — Estética Avançada');
  });

  it('traz telefone, endereço, fundação e redes do conteúdo', () => {
    expect(data.telephone).toBe('+5561981007522');
    expect(data.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'CLSW 303, Bloco C, sala 70, Edifício Le Parc, Sudoeste',
      addressLocality: 'Brasília',
      addressRegion: 'DF',
      postalCode: '70673-623',
      addressCountry: 'BR',
    });
    expect(data.foundingDate).toBe('2018');
    expect(data.sameAs).toEqual([
      'https://www.instagram.com/clinicalauratavaress/',
      'https://www.instagram.com/dra.lauratavares/',
    ]);
  });

  it('usa a url e a imagem informadas', () => {
    expect(data.url).toBe('https://exemplo.vercel.app/');
    expect(data.image).toBe('https://exemplo.vercel.app/og.jpg');
  });
});

describe('buildFaqJsonLd', () => {
  it('gera FAQPage com as 9 perguntas na ordem do copy', () => {
    const data = buildFaqJsonLd(site.faq.items);
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(9);
    expect(data.mainEntity[2]).toEqual({
      '@type': 'Question',
      name: 'Dói?',
      acceptedAnswer: { '@type': 'Answer', text: site.faq.items[2]?.answer },
    });
  });
});

describe('serializeJsonLd', () => {
  it('escapa < > & para não fechar o <script>', () => {
    const out = serializeJsonLd({ text: '</script><b>&' });
    expect(out).not.toContain('</script>');
    expect(out).toBe('{"text":"\\u003c/script\\u003e\\u003cb\\u003e\\u0026"}');
    expect(JSON.parse(out)).toEqual({ text: '</script><b>&' });
  });
});
