import type { ImageMetadata } from 'astro';
import { describe, expect, it } from 'vitest';
import {
  altText,
  createMediaResolver,
  MEDIA_SLOTS,
  MIN_CAROUSEL,
  normalizeImageKeys,
  PLACEHOLDER_KINDS,
  toPlaceholderMap,
  type PlaceholderKind,
} from './media';

const image = (src: string): ImageMetadata => ({ src, width: 1280, height: 1600, format: 'jpg' });
const placeholders = Object.fromEntries(
  PLACEHOLDER_KINDS.map((kind) => [kind, image(`/ph/${kind}.jpg`)]),
) as Record<PlaceholderKind, ImageMetadata>;

describe('normalizeImageKeys', () => {
  it('remove o prefixo e a extensão', () => {
    const keys = normalizeImageKeys(
      { '/src/assets/media/dra/hero.jpg': image('a') },
      '/src/assets/media/',
    );
    expect(Object.keys(keys)).toEqual(['dra/hero']);
  });

  it('mantém o primeiro arquivo em ordem alfabética quando há duplicata', () => {
    const keys = normalizeImageKeys(
      { '/m/dra/hero.png': image('png'), '/m/dra/hero.jpg': image('jpg') },
      '/m/',
    );
    expect(keys['dra/hero']?.src).toBe('jpg');
  });
});

describe('toPlaceholderMap', () => {
  it('monta o mapa dos 5 formatos', () => {
    const modules = Object.fromEntries(
      PLACEHOLDER_KINDS.map((kind) => [`/src/assets/placeholders/${kind}.jpg`, image(kind)]),
    );
    expect(Object.keys(toPlaceholderMap(modules)).sort()).toEqual([...PLACEHOLDER_KINDS].sort());
  });

  it('falha listando os formatos que faltam', () => {
    expect(() => toPlaceholderMap({ '/src/assets/placeholders/portrait.jpg': image('p') })).toThrow(
      /landscape, tall, before, after/,
    );
  });
});

describe('createMediaResolver', () => {
  it('cobre os 18 slots do contrato', () => {
    expect(Object.keys(MEDIA_SLOTS)).toHaveLength(18);
  });

  it('usa a foto real quando o arquivo do contrato existe', () => {
    const hero = image('/real/hero.jpg');
    const media = createMediaResolver({
      images: { 'dra/hero': hero },
      placeholders,
      files: ['dra/hero.jpg'],
    });
    expect(media.get('dra/hero')).toEqual({
      slot: 'dra/hero',
      image: hero,
      isPlaceholder: false,
      position: 'center 20%',
    });
  });

  it('cai para o placeholder do formato do slot', () => {
    const media = createMediaResolver({ images: {}, placeholders, files: [] });
    expect(media.get('resultados/olhar-antes').image).toBe(placeholders.before);
    expect(media.get('resultados/olhar-depois').image).toBe(placeholders.after);
    expect(media.get('clinica/sala').image).toBe(placeholders.landscape);
    expect(media.get('tratamentos/kbeauty').image).toBe(placeholders.portrait);
    expect(media.get('dra/hero')).toMatchObject({ isPlaceholder: true, position: 'center' });
  });

  it('ordena o carrossel pelo número e ignora nomes fora do padrão', () => {
    const media = createMediaResolver({
      images: {
        'carrossel/resultado-10': image('10'),
        'carrossel/resultado-02': image('02'),
        'carrossel/resultado-01': image('01'),
        'carrossel/foto': image('x'),
      },
      placeholders,
      files: [],
    });
    expect(media.carousel().map((shot) => shot.image.src)).toEqual(['01', '02', '10']);
  });

  it('usa placeholders altos quando o carrossel está vazio', () => {
    const shots = createMediaResolver({ images: {}, placeholders, files: [] }).carousel();
    expect(shots).toHaveLength(MIN_CAROUSEL);
    expect(shots.every((shot) => shot.isPlaceholder && shot.image === placeholders.tall)).toBe(
      true,
    );
  });

  it('expõe imagens de apoio por nome', () => {
    const texture = image('textura');
    const media = createMediaResolver({
      images: { 'apoio/textura-rose': texture },
      placeholders,
      files: [],
    });
    expect(media.support('textura-rose')).toBe(texture);
    expect(media.support('nao-existe')).toBeUndefined();
  });
});

describe('reportLines', () => {
  it('relata cada slot em placeholder e o carrossel vazio', () => {
    const lines = createMediaResolver({ images: {}, placeholders, files: [] }).reportLines();
    expect(lines).toContain(
      'placeholder em uso: dra/hero (esperado src/assets/media/dra/hero.jpg)',
    );
    expect(lines.filter((line) => line.startsWith('placeholder em uso'))).toHaveLength(18);
    expect(lines).toContain(
      'carrossel sem fotos: usando 6 placeholders (esperado src/assets/media/carrossel/resultado-01.jpg em diante)',
    );
  });

  it('relata arquivos fora do contrato (maiúsculas, extensão, numeração de 1 dígito) e ignora .gitkeep', () => {
    const media = createMediaResolver({
      images: { 'clinica/recepcao': image('recepcao') },
      placeholders,
      files: [
        '.gitkeep',
        'carrossel/resultado-1.jpg',
        'clinica/recepcao.jpg',
        'dra/Hero.jpg',
        'dra/sobre.JPG',
      ],
    });
    const lines = media.reportLines();
    expect(lines).toContain('arquivo ignorado: dra/Hero.jpg (nome ou extensão fora do contrato)');
    expect(lines).toContain('arquivo ignorado: dra/sobre.JPG (nome ou extensão fora do contrato)');
    expect(lines).toContain(
      'arquivo ignorado: carrossel/resultado-1.jpg (nome ou extensão fora do contrato)',
    );
    expect(lines.some((line) => line.includes('clinica/recepcao.jpg'))).toBe(false);
    expect(lines.some((line) => line.includes('.gitkeep'))).toBe(false);
  });

  it('relata duplicatas, carrossel curto e numeração fora de sequência', () => {
    const media = createMediaResolver({
      images: { 'carrossel/resultado-01': image('1'), 'carrossel/resultado-03': image('3') },
      placeholders,
      files: [
        'dra/hero.png',
        'carrossel/resultado-03.jpg',
        'dra/hero.jpg',
        'carrossel/resultado-01.jpg',
      ],
    });
    const lines = media.reportLines();
    expect(lines).toContain('arquivo duplicado: dra/hero.png (já usando dra/hero.jpg)');
    expect(lines).toContain('carrossel com 2 fotos (mínimo do contrato: 6)');
    expect(lines).toContain('carrossel com numeração fora de sequência: 01, 03');
  });
});

describe('altText', () => {
  it('usa o alt do copy na foto real e alt vazio no placeholder', () => {
    const media = createMediaResolver({
      images: { 'dra/hero': image('h') },
      placeholders,
      files: [],
    });
    expect(altText(media.get('dra/hero'), 'Dra. Laura')).toBe('Dra. Laura');
    expect(altText(media.get('dra/sobre'), 'Retrato')).toBe('');
  });
});
