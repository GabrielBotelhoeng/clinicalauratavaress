import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { Cleanup } from './types';

/**
 * Scroll suave (lerp 0.08, Movimento.md) sincronizado com o ScrollTrigger pelo ticker do GSAP.
 * anchors: rola até âncoras respeitando o scroll-margin-top das seções; autoToggle: para enquanto a
 * gaveta do menu (dialog) deixa o <html> com overflow hidden.
 */
export function startLenis(): Cleanup {
  const lenis = new Lenis({
    lerp: 0.08,
    anchors: true,
    autoToggle: true,
    stopInertiaOnNavigate: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}
