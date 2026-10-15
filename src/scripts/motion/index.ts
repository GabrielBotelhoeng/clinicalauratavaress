import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { revealCards } from './cards';
import { MOTION_CONDITIONS, readConditions } from './conditions';
import { startLenis } from './lenis';
import { reducedReveal } from './reduced';
import { animateTitles } from './titles';
import type { Cleanup } from './types';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// Se o failsafe de 4 s já tirou a classe "js", o conteúdo está visível: não escondemos nada de novo.
const revealsAllowed = root.classList.contains('js');

gsap.matchMedia().add(MOTION_CONDITIONS, (context) => {
  const { reduceMotion } = readConditions(context.conditions);
  const cleanups: Cleanup[] = [];
  if (reduceMotion) {
    if (revealsAllowed) cleanups.push(reducedReveal());
  } else {
    cleanups.push(startLenis());
    if (revealsAllowed) cleanups.push(animateTitles(), revealCards());
  }
  return () => cleanups.forEach((cleanup) => cleanup());
});

void document.fonts.ready.then(() => ScrollTrigger.refresh());
root.classList.add('motion-ready');
