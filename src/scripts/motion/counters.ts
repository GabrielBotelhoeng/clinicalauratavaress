import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatCount } from '../../lib/counter';
import type { Cleanup } from './types';

/** Padrão 7: "+25 mil", "9 anos" e "8 anos" contam de 0 em 1,4 s (power2.out) ao entrar na tela, uma vez. */
export function countUp(): Cleanup {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]'));
  const finalText = (element: HTMLElement) =>
    formatCount(
      Number(element.dataset.countTo),
      element.dataset.countPrefix ?? '',
      element.dataset.countSuffix ?? '',
    );

  elements.forEach((element) => {
    const target = Number(element.dataset.countTo);
    if (!Number.isFinite(target)) return;
    const prefix = element.dataset.countPrefix ?? '';
    const suffix = element.dataset.countSuffix ?? '';
    const state = { value: 0 };
    element.textContent = formatCount(0, prefix, suffix);
    const tween = gsap.to(state, {
      value: target,
      duration: 1.4,
      ease: 'power2.out',
      paused: true,
      onUpdate: () => {
        element.textContent = formatCount(state.value, prefix, suffix);
      },
    });
    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      once: true,
      onEnter: () => tween.play(),
    });
  });

  return () => {
    for (const element of elements) {
      if (Number.isFinite(Number(element.dataset.countTo)))
        element.textContent = finalText(element);
    }
  };
}
