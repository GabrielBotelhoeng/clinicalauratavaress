import { z } from 'zod';
import { site, type Site } from './site';

const pressJsonSchema = z
  .array(
    z.strictObject({
      veiculo: z.string().min(1),
      titulo: z.string().min(1),
      url: z.url({ protocol: /^https?$/ }).nullable(),
    }),
  )
  .min(1);

export interface PressItem {
  outlet: string;
  title: string;
  url: string | null;
  note?: string;
}

/** Usa src/content/imprensa.json (frente de mídia) quando existir; senão, os itens do copy sem link. */
export function mergePress(raw: unknown, fallback: Site['press']['items']): PressItem[] {
  if (raw === undefined) {
    return fallback.map((item) => ({
      outlet: item.outlet,
      title: item.title,
      url: null,
      ...(item.note ? { note: item.note } : {}),
    }));
  }
  const parsed = pressJsonSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`src/content/imprensa.json inválido:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data.map((entry, index) => {
    const base = fallback[index];
    const note = base && base.outlet === entry.veiculo ? base.note : undefined;
    return {
      outlet: entry.veiculo,
      title: entry.titulo,
      url: entry.url,
      ...(note ? { note } : {}),
    };
  });
}

const modules = import.meta.glob('/src/content/imprensa.json', { eager: true, import: 'default' });

export const press: PressItem[] = mergePress(Object.values(modules)[0], site.press.items);
