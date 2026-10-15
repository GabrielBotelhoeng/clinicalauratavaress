import { gsap } from 'gsap';
import type { Cleanup } from './types';

/**
 * Padrão 3 (só desktop): fotos se movem até ~10% com scrub; o badge do hero vai no sentido oposto (+6%).
 * data-parallax move o próprio elemento; data-parallax-inner move a imagem dentro da moldura (com folga de escala).
 * clamp() evita salto inicial quando o elemento já está na tela ao carregar.
 */
export function parallax(): Cleanup {
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
    const amount = Number(element.dataset.parallax ?? '-10');
    gsap.fromTo(
      element,
      { yPercent: 0 },
      {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'clamp(top bottom)',
          end: 'clamp(bottom top)',
          scrub: true,
        },
      },
    );
  });
  document.querySelectorAll<HTMLElement>('[data-parallax-inner]').forEach((frame) => {
    const image = frame.querySelector('img');
    if (!image) return;
    const amount = Number(frame.dataset.parallaxInner ?? '-8');
    gsap.set(image, { scale: 1.12 });
    gsap.fromTo(
      image,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: frame,
          start: 'clamp(top bottom)',
          end: 'clamp(bottom top)',
          scrub: true,
        },
      },
    );
  });
  // Tweens e ScrollTriggers criados aqui são revertidos pelo gsap.matchMedia() do orquestrador.
  return () => {};
}
