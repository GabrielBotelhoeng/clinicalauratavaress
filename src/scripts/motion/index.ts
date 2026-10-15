import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { revealArches } from './arches';
import { hintBeforeAfter } from './before-after-hint';
import { revealCards } from './cards';
import { loopCarousels } from './carousel';
import { MOTION_CONDITIONS, readConditions } from './conditions';
import { countUp } from './counters';
import { startLenis } from './lenis';
import { loopMarquees } from './marquee';
import { parallax } from './parallax';
import { reducedReveal } from './reduced';
import { revealSignatures } from './signature';
import { animateTitles } from './titles';
import type { Cleanup } from './types';

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
// Se o failsafe de 4 s já tirou a classe "js", o conteúdo está visível: não escondemos nada de novo.
const revealsAllowed = root.classList.contains('js');

gsap.matchMedia().add(MOTION_CONDITIONS, (context) => {
  const { isDesktop, reduceMotion } = readConditions(context.conditions);
  const cleanups: Cleanup[] = [];
  // Cada padrão roda isolado: um erro num deles não impede os outros nem o motion-ready.
  const run = (pattern: () => Cleanup) => {
    try {
      cleanups.push(pattern());
    } catch (error) {
      console.error('[motion]', error);
    }
  };
  if (reduceMotion) {
    // Movimento reduzido: sem Lenis, marquee, carrossel, parallax, splits, dica ou contadores.
    if (revealsAllowed) run(reducedReveal);
  } else {
    run(startLenis);
    run(loopMarquees);
    run(hintBeforeAfter);
    if (isDesktop) {
      run(loopCarousels);
      run(parallax);
    }
    if (revealsAllowed) {
      run(animateTitles);
      run(revealCards);
      run(revealSignatures);
      run(countUp);
      if (isDesktop) run(revealArches);
    }
  }
  return () => cleanups.forEach((cleanup) => cleanup());
});

void document.fonts.ready.then(() => ScrollTrigger.refresh());
root.classList.add('motion-ready');
