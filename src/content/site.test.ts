import { describe, expect, it } from 'vitest';
import { findNullPaths, getPath } from './pending';
import { site, siteSchema } from './site';

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value !== null && typeof value === 'object')
    return Object.values(value).flatMap(collectStrings);
  return [];
}

describe('site — schema e SEO', () => {
  it('o conteúdo passa no schema', () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
  });

  it('usa o title do copy, com até 60 caracteres', () => {
    expect(site.seo.title).toBe('Harmonização Facial no Sudoeste | Dra. Laura Tavares');
    expect(site.seo.title.length).toBeLessThanOrEqual(60);
  });

  it('rejeita title com 61 caracteres', () => {
    const tooLong = { ...site, seo: { ...site.seo, title: 'x'.repeat(61) } };
    expect(siteSchema.safeParse(tooLong).success).toBe(false);
  });

  it('usa a meta description do copy, com até 155 caracteres', () => {
    expect(site.seo.description.length).toBeLessThanOrEqual(155);
    const tooLong = { ...site, seo: { ...site.seo, description: 'x'.repeat(156) } };
    expect(siteSchema.safeParse(tooLong).success).toBe(false);
  });
});

describe('site — estrutura do copy', () => {
  it('tem 4 tratamentos, 4 blocos de resultado e 9 dúvidas', () => {
    expect(site.treatments.items).toHaveLength(4);
    expect(site.results.blocks).toHaveLength(4);
    expect(site.faq.items).toHaveLength(9);
  });

  it('rejeita 3 tratamentos', () => {
    const missing = {
      ...site,
      treatments: { ...site.treatments, items: site.treatments.items.slice(0, 3) },
    };
    expect(siteSchema.safeParse(missing).success).toBe(false);
  });

  it('todo título tem trecho em itálico (em) não vazio', () => {
    const titles = [
      site.hero.title,
      site.treatments.title,
      site.results.title,
      ...site.results.blocks.map((block) => block.title),
      site.method.title,
      site.about.title,
      site.testimonials.title,
      site.clinic.title,
      site.faq.title,
      site.finalCta.title,
    ];
    for (const title of titles) expect(title.em.trim().length).toBeGreaterThan(0);
  });

  it('âncoras da navbar são únicas e começam com #', () => {
    const hrefs = site.nav.links.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const href of hrefs) expect(href.startsWith('#')).toBe(true);
  });

  it('contadores batem com o número exibido', () => {
    for (const stat of site.about.stats) {
      if (stat.countTo !== undefined) {
        expect(`${stat.prefix ?? ''}${stat.countTo}${stat.suffix ?? ''}`).toBe(stat.value);
      }
    }
  });

  it('o número exibido do WhatsApp é o mesmo do link', () => {
    expect(`55${site.whatsapp.display.replace(/\D/g, '')}`).toBe(site.whatsapp.number);
  });

  it('o lead do método cita o nome do método', () => {
    expect(site.method.lead).toContain(site.method.name);
  });
});

describe('site — pendências e compliance', () => {
  it('todo campo null está marcado em pending[].fields', () => {
    const declared = new Set(site.pending.flatMap((item) => item.fields));
    for (const path of findNullPaths(site)) expect(declared).toContain(path);
  });

  it('pending[].fields apontam para campos que existem', () => {
    for (const item of site.pending) {
      for (const field of item.fields) expect(getPath(site, field)).not.toBeUndefined();
    }
  });

  it('registro profissional e formação estão pendentes; só o registro bloqueia domínio próprio', () => {
    expect(site.responsibleTechnician.profession).toBeNull();
    expect(site.responsibleTechnician.registration).toBeNull();
    expect(site.about.education).toBeNull();
    const blocking = site.pending.filter((item) => item.blocksCustomDomain).map((item) => item.id);
    expect(blocking).toEqual(['registro-profissional']);
  });

  it('lista as 7 pendências da spec', () => {
    expect(site.pending.map((item) => item.id)).toEqual([
      'registro-profissional',
      'autorizacao-imagens',
      'logo-vetor',
      'horario-estacionamento',
      'nome-metodo-tratamentos',
      'segundo-numero',
      'formacao-academica',
    ]);
  });

  it('nenhum texto visível traz [colchetes] do copy', () => {
    const visible = Object.entries(site).filter(([key]) => key !== 'pending');
    for (const value of collectStrings(visible)) expect(value).not.toMatch(/[[\]]/);
  });

  it('não usa linguagem proibida (promoção, garantia, "sem dor", preço)', () => {
    const banned = /promo[cç][aã]o|garantid|sem dor|R\$\s?\d/i;
    for (const value of collectStrings(site)) expect(value).not.toMatch(banned);
  });

  it('resultados e tratamentos têm {detail}; geral e FAQ não', () => {
    const { messages } = site.whatsapp;
    expect(messages.result).toContain('{detail}');
    expect(messages.treatment).toContain('{detail}');
    expect(messages.general).not.toContain('{detail}');
    expect(messages.faq).not.toContain('{detail}');
  });
});
