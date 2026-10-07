import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ImageMetadata } from 'astro';

export const PLACEHOLDER_KINDS = ['portrait', 'landscape', 'tall', 'before', 'after'] as const;
export type PlaceholderKind = (typeof PLACEHOLDER_KINDS)[number];

/** Slots do contrato com a frente de mídia → formato do placeholder usado enquanto o arquivo não chega. */
export const MEDIA_SLOTS = {
  'dra/hero': 'portrait',
  'dra/sobre': 'portrait',
  'clinica/recepcao': 'landscape',
  'clinica/sala': 'landscape',
  'clinica/equipe': 'landscape',
  'clinica/detalhes': 'landscape',
  'resultados/olhar-antes': 'before',
  'resultados/olhar-depois': 'after',
  'resultados/mandibula-antes': 'before',
  'resultados/mandibula-depois': 'after',
  'resultados/labios-antes': 'before',
  'resultados/labios-depois': 'after',
  'resultados/bigode-antes': 'before',
  'resultados/bigode-depois': 'after',
  'tratamentos/harmonizacao': 'portrait',
  'tratamentos/rejuvenescimento': 'portrait',
  'tratamentos/kbeauty': 'portrait',
  'tratamentos/corporal': 'portrait',
} as const satisfies Record<string, PlaceholderKind>;

export type MediaSlot = keyof typeof MEDIA_SLOTS;

/** Enquadramento (CSS object-position) por slot nas fotos reais; ajustado na Task 31. */
export const MEDIA_POSITION: Partial<Record<MediaSlot, string>> = {
  'dra/hero': 'center 20%',
  'dra/sobre': 'center 20%',
};

export const MIN_CAROUSEL = 6;

const IMAGE_EXTENSION = /\.(jpg|jpeg|png|webp|avif)$/;
const CAROUSEL_KEY = /^carrossel\/resultado-(\d{2,})$/;
const SUPPORT_KEY = /^apoio\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface ResolvedImage {
  slot: string;
  image: ImageMetadata;
  isPlaceholder: boolean;
  position: string;
}

export interface MediaResolver {
  get(slot: MediaSlot): ResolvedImage;
  carousel(): ResolvedImage[];
  support(name: string): ImageMetadata | undefined;
  reportLines(): string[];
}

export interface MediaResolverInput {
  /** Imagens encontradas, com chave relativa a src/assets/media sem extensão (ex.: "dra/hero"). */
  images: Record<string, ImageMetadata>;
  placeholders: Record<PlaceholderKind, ImageMetadata>;
  /** Todos os arquivos de src/assets/media (relativos, com extensão), só para o relatório. */
  files: string[];
}

/** Converte as chaves do import.meta.glob ("/src/assets/media/dra/hero.jpg") em "dra/hero". */
export function normalizeImageKeys(
  modules: Record<string, ImageMetadata>,
  prefix: string,
): Record<string, ImageMetadata> {
  const out: Record<string, ImageMetadata> = {};
  for (const path of Object.keys(modules).sort()) {
    const key = path.slice(prefix.length).replace(IMAGE_EXTENSION, '');
    if (!(key in out)) out[key] = modules[path] as ImageMetadata;
  }
  return out;
}

export function toPlaceholderMap(
  modules: Record<string, ImageMetadata>,
): Record<PlaceholderKind, ImageMetadata> {
  const byName = normalizeImageKeys(modules, '/src/assets/placeholders/');
  const missing = PLACEHOLDER_KINDS.filter((kind) => !byName[kind]);
  if (missing.length > 0) {
    throw new Error(
      `Placeholders ausentes em src/assets/placeholders/: ${missing.join(', ')} — rode "npm run placeholders".`,
    );
  }
  return Object.fromEntries(PLACEHOLDER_KINDS.map((kind) => [kind, byName[kind]])) as Record<
    PlaceholderKind,
    ImageMetadata
  >;
}

/** Lista os arquivos de src/assets/media (relativos, com barras normais), para o relatório do build. */
export function listMediaFiles(root: string = process.cwd()): string[] {
  const dir = join(root, 'src', 'assets', 'media');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((path) => path.replaceAll('\\', '/'))
    .filter((path) => statSync(join(dir, path)).isFile())
    .sort();
}

/** Alt do copy na foto real; alt vazio enquanto for placeholder (decorativo). */
export function altText(resolved: Pick<ResolvedImage, 'isPlaceholder'>, alt: string): string {
  return resolved.isPlaceholder ? '' : alt;
}

function isKnownKey(key: string): boolean {
  return key in MEDIA_SLOTS || CAROUSEL_KEY.test(key) || SUPPORT_KEY.test(key);
}

export function createMediaResolver({
  images,
  placeholders,
  files,
}: MediaResolverInput): MediaResolver {
  const carouselEntries = Object.keys(images)
    .map((key) => ({ key, match: CAROUSEL_KEY.exec(key) }))
    .filter((entry): entry is { key: string; match: RegExpExecArray } => entry.match !== null)
    .map(({ key, match }) => ({ key, number: Number(match[1]) }))
    .sort((a, b) => a.number - b.number);

  const get = (slot: MediaSlot): ResolvedImage => {
    const real = images[slot];
    if (real)
      return {
        slot,
        image: real,
        isPlaceholder: false,
        position: MEDIA_POSITION[slot] ?? 'center',
      };
    return {
      slot,
      image: placeholders[MEDIA_SLOTS[slot]],
      isPlaceholder: true,
      position: 'center',
    };
  };

  const carousel = (): ResolvedImage[] => {
    if (carouselEntries.length === 0) {
      return Array.from({ length: MIN_CAROUSEL }, (_, index) => ({
        slot: `carrossel/placeholder-${index + 1}`,
        image: placeholders.tall,
        isPlaceholder: true,
        position: 'center',
      }));
    }
    return carouselEntries.map(({ key }) => ({
      slot: key,
      image: images[key] as ImageMetadata,
      isPlaceholder: false,
      position: 'center',
    }));
  };

  const support = (name: string): ImageMetadata | undefined => images[`apoio/${name}`];

  const reportLines = (): string[] => {
    const lines: string[] = [];
    for (const slot of Object.keys(MEDIA_SLOTS) as MediaSlot[]) {
      if (!images[slot])
        lines.push(`placeholder em uso: ${slot} (esperado src/assets/media/${slot}.jpg)`);
    }
    if (carouselEntries.length === 0) {
      lines.push(
        `carrossel sem fotos: usando ${MIN_CAROUSEL} placeholders (esperado src/assets/media/carrossel/resultado-01.jpg em diante)`,
      );
    } else {
      if (carouselEntries.length < MIN_CAROUSEL) {
        lines.push(
          `carrossel com ${carouselEntries.length} fotos (mínimo do contrato: ${MIN_CAROUSEL})`,
        );
      }
      if (carouselEntries.some((entry, index) => entry.number !== index + 1)) {
        const numbers = carouselEntries.map((entry) => entry.key.split('-').pop()).join(', ');
        lines.push(`carrossel com numeração fora de sequência: ${numbers}`);
      }
    }
    const seen = new Map<string, string>();
    for (const file of [...files].sort()) {
      if (file.endsWith('.gitkeep')) continue;
      const key = file.replace(IMAGE_EXTENSION, '');
      if (!IMAGE_EXTENSION.test(file) || !isKnownKey(key)) {
        lines.push(`arquivo ignorado: ${file} (nome ou extensão fora do contrato)`);
        continue;
      }
      const previous = seen.get(key);
      if (previous) lines.push(`arquivo duplicado: ${file} (já usando ${previous})`);
      else seen.set(key, file);
    }
    return lines;
  };

  return { get, carousel, support, reportLines };
}

const mediaModules = import.meta.glob<ImageMetadata>(
  '/src/assets/media/**/*.{jpg,jpeg,png,webp,avif}',
  {
    eager: true,
    import: 'default',
  },
);
const placeholderModules = import.meta.glob<ImageMetadata>('/src/assets/placeholders/*.jpg', {
  eager: true,
  import: 'default',
});

/** Instância usada pelos componentes (fotos reais da frente de mídia + placeholders). */
export const media: MediaResolver = createMediaResolver({
  images: normalizeImageKeys(mediaModules, '/src/assets/media/'),
  placeholders: toPlaceholderMap(placeholderModules),
  files: listMediaFiles(),
});
