/** Texto de um contador ("+25 mil", "9 anos") durante a animação do padrão 7. */
export function formatCount(value: number, prefix = '', suffix = ''): string {
  return `${prefix}${Math.round(value)}${suffix}`;
}
