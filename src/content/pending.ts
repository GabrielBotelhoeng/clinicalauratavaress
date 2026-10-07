import type { Site } from './site';

/** Caminhos (com ponto, índices numéricos) de todos os valores `null` — dados pendentes da clínica. */
export function findNullPaths(value: unknown, prefix = ''): string[] {
  if (value === null) return prefix ? [prefix] : [];
  if (typeof value !== 'object') return [];
  const entries: Array<[string, unknown]> = Array.isArray(value)
    ? value.map((child, index) => [String(index), child])
    : Object.entries(value);
  return entries.flatMap(([key, child]) => findNullPaths(child, prefix ? `${prefix}.${key}` : key));
}

/** Lê um caminho com ponto; `undefined` quando o campo não existe (diferente de `null`). */
export function getPath(value: unknown, path: string): unknown {
  let current: unknown = value;
  for (const key of path.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** Linhas "id: descrição" impressas no build (`[pendente] …`). */
export function listPending(site: Pick<Site, 'pending'>): string[] {
  return site.pending.map((item) => `${item.id}: ${item.description}`);
}
