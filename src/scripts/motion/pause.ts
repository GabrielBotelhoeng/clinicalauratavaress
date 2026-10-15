import type { Cleanup } from './types';

/**
 * Pausa compartilhada da marquee e do carrossel: hover do mouse ou `data-paused` (botão de pausa,
 * WCAG 2.2.2). Chama `apply(paused)` agora e a cada mudança; devolve a limpeza dos listeners.
 */
export function bindPause(root: HTMLElement, apply: (paused: boolean) => void): Cleanup {
  let hovering = false;
  const sync = () => apply(hovering || root.hasAttribute('data-paused'));
  const enter = () => {
    hovering = true;
    sync();
  };
  const leave = () => {
    hovering = false;
    sync();
  };
  root.addEventListener('mouseenter', enter);
  root.addEventListener('mouseleave', leave);
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ['data-paused'] });
  sync();
  return () => {
    root.removeEventListener('mouseenter', enter);
    root.removeEventListener('mouseleave', leave);
    observer.disconnect();
  };
}
