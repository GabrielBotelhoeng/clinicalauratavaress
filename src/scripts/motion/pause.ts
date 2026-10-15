import type { Cleanup } from './types';

/**
 * Pausa compartilhada da marquee e do carrossel: hover do mouse ou `data-paused` (botão de pausa,
 * WCAG 2.2.2). Chama `apply(paused)` agora e a cada mudança; devolve a limpeza dos listeners.
 */
export function bindPause(root: HTMLElement, apply: (paused: boolean) => void): Cleanup {
  let hovering = false;
  const sync = () => apply(hovering || root.hasAttribute('data-paused'));
  // No toque, o navegador dispara pointerenter de compatibilidade e só o pointerleave quando se
  // toca em outro elemento: sem o filtro de pointerType, o botão "pausar" nunca retomaria sozinho.
  const enter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    hovering = true;
    sync();
  };
  const leave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    hovering = false;
    sync();
  };
  // O clique no botão zera o hover antes do sync (síncrono, antes do MutationObserver rodar),
  // para "retomar" valer na hora mesmo com o mouse/dedo ainda sobre a faixa.
  const resetHover = () => {
    hovering = false;
  };
  root.addEventListener('pointerenter', enter);
  root.addEventListener('pointerleave', leave);
  const toggle = root.querySelector<HTMLButtonElement>('[data-marquee-toggle],[data-reel-toggle]');
  toggle?.addEventListener('click', resetHover);
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ['data-paused'] });
  sync();
  return () => {
    root.removeEventListener('pointerenter', enter);
    root.removeEventListener('pointerleave', leave);
    toggle?.removeEventListener('click', resetHover);
    observer.disconnect();
  };
}
