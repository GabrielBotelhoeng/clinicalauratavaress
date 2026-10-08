/**
 * Quantas cópias do conjunto de fotos cada metade do trilho precisa: o loop anima de 0 a −50%,
 * então cada metade tem de ser mais larga que a maior tela esperada (minHalfWidth).
 */
export function loopCopies(
  count: number,
  {
    cardWidth = 220,
    gap = 24,
    minHalfWidth = 2000,
  }: { cardWidth?: number; gap?: number; minHalfWidth?: number } = {},
): number {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(`loopCopies: quantidade inválida (${count}).`);
  }
  return Math.max(1, Math.ceil(minHalfWidth / (count * (cardWidth + gap))));
}
