/** Junta espaços, tabs, quebras de linha e espaços não separáveis num único espaço e apara as pontas. */
export function normalizeText(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

/** Conta palavras separadas por espaço (limite de 30 palavras dos depoimentos). */
export function countWords(value: string): number {
  const text = normalizeText(value);
  return text === '' ? 0 : text.split(' ').length;
}
