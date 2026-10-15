import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { media, MEDIA_SLOTS } from '../../src/content/media';
import { loadPage } from './load';

describe('integração das mídias reais', () => {
  it('nenhum arquivo fora do contrato em src/assets/media (o glob eager copia pro dist mesmo sem uso)', () => {
    const bad = media
      .reportLines()
      .filter((line) => line.includes('arquivo ignorado') || line.includes('arquivo duplicado'));
    expect(bad).toEqual([]);
  });

  it('toda foto do contrato com arquivo real não tem data-placeholder e tem alt não vazio', () => {
    const { document } = loadPage();
    for (const slot of Object.keys(MEDIA_SLOTS)) {
      const img = document.querySelector(`img[data-slot="${slot}"]`);
      if (!img) continue; // slot sem <img> direto nesta página (não é o caso de nenhum dos 18 hoje)
      const real = existsSync(`src/assets/media/${slot}.jpg`);
      expect(img.hasAttribute('data-placeholder'), slot).toBe(!real);
      if (real) expect((img.getAttribute('alt') ?? '').length > 0, slot).toBe(true);
    }
  });

  it('o carrossel de resultados nunca tem menos de 6 fotos (reais ou placeholder)', () => {
    const { document } = loadPage();
    expect(document.querySelectorAll('#resultados .carousel img').length).toBeGreaterThanOrEqual(6);
  });

  it('o vídeo do Método aparece quando public/media/metodo.* existe', () => {
    const { document } = loadPage();
    const delivered = ['metodo.webm', 'metodo.mp4'].some((file) =>
      existsSync(`public/media/${file}`),
    );
    expect(document.querySelector('#metodo video[data-lazy-video] source') !== null).toBe(
      delivered,
    );
  });

  it('o vídeo do CTA final aparece quando public/media/cta-final.* existe', () => {
    const { document } = loadPage();
    const delivered = ['cta-final.webm', 'cta-final.mp4'].some((file) =>
      existsSync(`public/media/${file}`),
    );
    expect(document.querySelector('#agendar video[data-lazy-video] source') !== null).toBe(
      delivered,
    );
  });

  it('texturas de apoio (quando existirem) são decorativas: sem alt e com aria-hidden', () => {
    const { document } = loadPage();
    for (const img of document.querySelectorAll('.section-texture img')) {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  });
});
