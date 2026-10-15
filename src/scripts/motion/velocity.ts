/** Padrão 4: multiplicador da velocidade da faixa conforme o scroll (até `max`, padrão 2×). */
export function velocityBoost(
  velocity: number,
  { max = 2, divisor = 2000 }: { max?: number; divisor?: number } = {},
): number {
  if (!Number.isFinite(velocity)) return 1;
  return 1 + Math.min(Math.abs(velocity) / divisor, max - 1);
}
