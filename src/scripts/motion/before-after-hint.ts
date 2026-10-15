import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HINT_KEYFRAMES } from '../../lib/before-after';
import type { Cleanup } from './types';

const TOTAL_SECONDS = 1.6;

/**
 * Padrão 6: na primeira vez que o slider entra na tela, a alça faz 50 → 30 → 70 → 50 em 1,6 s (ease-silk).
 * A posição vai pelo evento `ba:set` (o componente atualiza --pos e o range); se a pessoa tocar ou usar
 * o teclado (`ba:interact`), a dica é cancelada.
 */
export function hintBeforeAfter(): Cleanup {
  const cleanups: Cleanup[] = [];
  const [start = 50, ...stops] = HINT_KEYFRAMES;
  let previous = start;
  const distances = stops.map((stop) => {
    const distance = Math.abs(stop - previous);
    previous = stop;
    return distance;
  });
  const totalDistance = distances.reduce((sum, distance) => sum + distance, 0) || 1;

  document.querySelectorAll<HTMLElement>('[data-ba]').forEach((root) => {
    const state = { position: start };
    const emit = () => root.dispatchEvent(new CustomEvent('ba:set', { detail: state.position }));
    const timeline = gsap.timeline({ paused: true });
    stops.forEach((stop, index) => {
      timeline.to(state, {
        position: stop,
        duration: (TOTAL_SECONDS * (distances[index] ?? 0)) / totalDistance,
        ease: 'power3.inOut',
        onUpdate: emit,
      });
    });
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        timeline.play();
      },
    });
    const cancel = () => {
      timeline.kill();
      trigger.kill();
    };
    root.addEventListener('ba:interact', cancel, { once: true });
    cleanups.push(() => root.removeEventListener('ba:interact', cancel));
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
