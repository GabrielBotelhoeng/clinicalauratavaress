import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';

/** Movimento reduzido: sem marquee, parallax, splits ou contadores — só fades de 200 ms (Movimento.md). */
export function reducedReveal(): Cleanup {
  const triggers = ScrollTrigger.batch('[data-reveal]', {
    start: 'top 95%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, duration: 0.2, ease: 'none', overwrite: true }),
  });
  return () => triggers.forEach((trigger) => trigger.kill());
}
