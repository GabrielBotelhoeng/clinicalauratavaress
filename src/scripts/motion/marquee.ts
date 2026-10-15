import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';
import { bindPause } from './pause';
import { velocityBoost } from './velocity';

/** Padrão 4: faixa contínua (40 s por volta), pausa no hover e no botão, acelera com o scroll e volta com ease-lux. */
export function loopMarquees(): Cleanup {
  const cleanups: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((root) => {
    const track = root.querySelector<HTMLElement>('[data-marquee-track]');
    if (!track) return;
    root.classList.add('is-gsap');
    const loop = gsap.fromTo(
      track,
      { xPercent: 0 },
      { xPercent: -50, duration: 40, ease: 'none', repeat: -1 },
    );
    let paused = false;
    let settle: gsap.core.Tween | undefined;
    const unbind = bindPause(root, (value) => {
      paused = value;
      if (paused) {
        // Pausado volta à velocidade base: ao retomar não "salta" com o resto do boost do scroll.
        settle?.kill();
        loop.timeScale(1).pause();
      } else loop.resume();
    });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (paused) return;
        settle?.kill();
        loop.timeScale(velocityBoost(self.getVelocity()));
        settle = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'expo.out', delay: 0.15 });
      },
    });
    cleanups.push(() => {
      unbind();
      settle?.kill();
      root.classList.remove('is-gsap');
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
