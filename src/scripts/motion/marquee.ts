import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';
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
    let hovering = false;
    const sync = () => {
      if (hovering || root.hasAttribute('data-paused')) loop.pause();
      else loop.resume();
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
    let settle: gsap.core.Tween | undefined;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        settle?.kill();
        loop.timeScale(velocityBoost(self.getVelocity()));
        settle = gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'expo.out', delay: 0.15 });
      },
    });
    sync();
    cleanups.push(() => {
      root.removeEventListener('mouseenter', enter);
      root.removeEventListener('mouseleave', leave);
      observer.disconnect();
      settle?.kill();
      root.classList.remove('is-gsap');
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
