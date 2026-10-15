import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';

/**
 * Padrão 9: a assinatura "se escreve" da esquerda para a direita (sem o SVG real, a revelação é por clip-path).
 * As margens negativas do inset deixam os floreios do Pinyon Script aparecerem inteiros no fim.
 */
export function revealSignatures(): Cleanup {
  document.querySelectorAll<HTMLElement>('[data-signature]').forEach((signature) => {
    const tween = gsap.fromTo(
      signature,
      { clipPath: 'inset(-20% 100% -20% -10%)' },
      {
        clipPath: 'inset(-20% -10% -20% -10%)',
        duration: 1.6,
        ease: 'power2.inOut',
        paused: true,
      },
    );
    ScrollTrigger.create({
      trigger: signature,
      start: 'top 85%',
      once: true,
      onEnter: () => tween.play(),
    });
  });
  return () => undefined;
}
