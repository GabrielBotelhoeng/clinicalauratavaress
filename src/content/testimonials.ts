import { z } from 'zod';
import { countWords } from '../lib/text';

export const MAX_WORDS = 30;

export const testimonialSchema = z.strictObject({
  texto: z
    .string()
    .min(1)
    .refine((value) => countWords(value) <= MAX_WORDS, {
      message: `texto com mais de ${MAX_WORDS} palavras`,
    }),
  textoOriginal: z.string().min(1),
  autor: z.string().min(2),
  tratamento: z.string().min(1).nullable(),
  fonte: z.enum(['google', 'instagram']),
  url: z.url({ protocol: /^https?$/ }).nullable(),
  estrelas: z.number().int().min(1).max(5).nullable(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

/** Valida src/content/depoimentos.json (frente de mídia). Ausente = lista vazia; inválido = erro de build. */
export function parseTestimonials(raw: unknown): Testimonial[] {
  if (raw === undefined) return [];
  const parsed = z.array(testimonialSchema).safeParse(raw);
  if (!parsed.success) {
    throw new Error(`src/content/depoimentos.json inválido:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

const modules = import.meta.glob('/src/content/depoimentos.json', {
  eager: true,
  import: 'default',
});

export const testimonials: Testimonial[] = parseTestimonials(Object.values(modules)[0]);
