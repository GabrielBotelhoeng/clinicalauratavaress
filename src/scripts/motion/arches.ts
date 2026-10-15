import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './types';

/**
 * Padrão 2: clip-path inset(100% 0 0 0) → inset(0) com ease-silk em dur-slow (1,2 s),
 * enquanto as imagens internas vão de scale 1.12 a 1. Hero, Sobre e antes/depois (desktop).
 */
export function revealArches(): Cleanup {
  document.querySelectorAll<HTMLElement>('[data-arch-reveal]').forEach((arch) => {
    const images = arch.querySelectorAll('img');
    const timeline = gsap.timeline({ paused: true });
    timeline.fromTo(
      arch,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' },
    );
    if (images.length > 0) {
      timeline.fromTo(
        images,
        { scale: 1.12 },
        { scale: 1, duration: 1.2, ease: 'power3.inOut' },
        0,
      );
    }
    ScrollTrigger.create({
      trigger: arch,
      start: 'top 85%',
      once: true,
      onEnter: () => timeline.play(),
    });
  });
  // O contexto do matchMedia mata os ScrollTriggers criados aqui; nenhuma limpeza adicional é necessária.
  return () => undefined;
}
