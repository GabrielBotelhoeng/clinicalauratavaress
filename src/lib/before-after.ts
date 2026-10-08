/** Sequência da dica automática do slider (Movimento.md, padrão 6). */
export const HINT_KEYFRAMES: readonly number[] = [50, 30, 70, 50];

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

/** Posição do ponteiro como % da largura da imagem (0 = esquerda, 100 = direita). */
export function percentFromPointer(clientX: number, rect: { left: number; width: number }): number {
  if (rect.width <= 0) return 50;
  return clampPercent(((clientX - rect.left) / rect.width) * 100);
}

/** Toque horizontal o bastante para arrastar o slider em vez de rolar a página. */
export function isHorizontalIntent(dx: number, dy: number, threshold = 6): boolean {
  return Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy);
}
