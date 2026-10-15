import { gsap } from 'gsap';
import type { Cleanup } from './types';

/**
 * Padrão 3 (só desktop): fotos se movem até ~10% com scrub; o badge do hero vai no sentido oposto (+6%).
 * data-parallax move o próprio elemento; data-parallax-inner move a imagem dentro da moldura (com folga de escala).
 * clamp() evita salto inicial quando o elemento já está na tela ao carregar.
 */
export function parallax(): Cleanup {
  const pointerCleanups: Cleanup[] = [];
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
    // .lt-card tem :hover { transform: translateY(-6px) } (bundle.css). O transform inline que o
    // scrub do parallax escreve continuamente venceria sempre essa regra (inline > stylesheet,
    // independente de especificidade), travando o hover do badge do hero. Enquanto o ponteiro está
    // sobre o card, limpamos o transform inline para a regra de :hover valer; ao sair, o próximo
    // tick de scroll do ScrollTrigger reaplica a posição do parallax normalmente.
    if (element.classList.contains('lt-card')) {
      const clear = () => gsap.set(element, { clearProps: 'transform' });
      element.addEventListener('pointerenter', clear);
      pointerCleanups.push(() => element.removeEventListener('pointerenter', clear));
    }
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
  return () => pointerCleanups.forEach((cleanup) => cleanup());
}
