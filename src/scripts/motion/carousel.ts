import { gsap } from 'gsap';
import { bindPause } from './pause';
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
    const unbind = bindPause(root, (paused) => {
      for (const loop of loops) {
        if (paused) loop.pause();
        else loop.resume();
      }
    });
    cleanups.push(() => {
      unbind();
      root.classList.remove('is-gsap');
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
