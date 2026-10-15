import { gsap } from 'gsap';
import type { Cleanup } from './types';

/** Padrão 5 (desktop): 60 s por volta, fileiras em sentidos opostos, pausa no hover e no botão. */
export function loopCarousels(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('[data-reel]').forEach((root) => {
    const tracks = Array.from(root.querySelectorAll<HTMLElement>('[data-reel-track]'));
    if (tracks.length === 0) return;
    root.classList.add('is-gsap');
    const loops = tracks.map((track) => {
      const forward = Number(track.dataset.reelDirection ?? '-1') < 0;
      return gsap.fromTo(
        track,
        { xPercent: forward ? 0 : -50 },
        { xPercent: forward ? -50 : 0, duration: 60, ease: 'none', repeat: -1 },
      );
    });
    let hovering = false;
    const sync = () => {
      const paused = hovering || root.hasAttribute('data-paused');
      for (const loop of loops) {
        if (paused) loop.pause();
        else loop.resume();
      }
    };
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
    cleanups.push(() => {
      root.removeEventListener('mouseenter', enter);
      root.removeEventListener('mouseleave', leave);
      observer.disconnect();
      root.classList.remove('is-gsap');
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
