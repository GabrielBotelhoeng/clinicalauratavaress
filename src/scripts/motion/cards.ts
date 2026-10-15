import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';

/**
 * Padrão 8: cards e blocos sobem y 40 → 0 com fade, stagger 0,1 s (hover fica no CSS do bundle).
 * `clearProps: 'transform'` remove o `transform: translate(0px, 0px)` inline que o GSAP deixaria
 * no elemento ao terminar — sem isso, esse inline vence o `:hover { transform: translateY(-6px) }`
 * do `.lt-card` (bundle.css) e o hover dos cards de tratamento (e de qualquer `.lt-card[data-reveal]`
 * futuro) para de funcionar depois do reveal. Só `transform` é limpo — `opacity`/`visibility` ficam,
 * senão o elemento voltaria a ficar escondido via `html.js [data-reveal]{opacity:0}`.
 */
export function revealCards(): Cleanup {
  const triggers = ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'expo.out',
          stagger: 0.1,
          overwrite: true,
          clearProps: 'transform',
        },
      ),
  });
  return () => triggers.forEach((trigger) => trigger.kill());
}
