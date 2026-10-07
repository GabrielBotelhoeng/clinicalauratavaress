export interface NavbarScroll {
  /** Última posição em que o estado mudou (base para medir a próxima rolagem). */
  anchorY: number;
  hidden: boolean;
}

/**
 * Esconde a navbar ao rolar para baixo e mostra ao rolar para cima.
 * Perto do topo (revealZone) ela sempre aparece; movimentos menores que `tolerance` não mudam nada.
 */
export function updateNavbarScroll(
  state: NavbarScroll,
  currentY: number,
  revealZone = 160,
  tolerance = 6,
): NavbarScroll {
  if (currentY <= revealZone) return { anchorY: currentY, hidden: false };
  const delta = currentY - state.anchorY;
  if (Math.abs(delta) < tolerance) return state;
  return { anchorY: currentY, hidden: delta > 0 };
}
