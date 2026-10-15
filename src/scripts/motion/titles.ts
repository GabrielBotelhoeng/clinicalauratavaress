import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Cleanup } from './types';

const LINE_STAGGER = 0.08;
const ACCENT_DELAY = 0.15;

/**
 * Padrão 1: cada linha sobe de yPercent 110 dentro de uma máscara (stagger 0,08 s, dur-base, ease-lux);
 * a palavra em itálico (<em>) entra por último, com 0,15 s extra.
 */
export function animateTitles(): Cleanup {
  const splits = Array.from(document.querySelectorAll<HTMLElement>('[data-title]'), (title) =>
    SplitText.create(title, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(title, { visibility: 'visible' });
        const words = self.words as HTMLElement[];
        const accent = words.filter((word) => word.closest('em') !== null);
        const timeline = gsap.timeline({ paused: true });
        self.lines.forEach((line, index) => {
          const plain = words.filter((word) => line.contains(word) && !accent.includes(word));
          if (plain.length > 0) {
            timeline.from(
              plain,
              { yPercent: 110, duration: 0.6, ease: 'expo.out' },
              index * LINE_STAGGER,
            );
          }
        });
        if (accent.length > 0) {
          timeline.from(
            accent,
            { yPercent: 110, duration: 0.6, ease: 'expo.out' },
            self.lines.length * LINE_STAGGER + ACCENT_DELAY,
          );
        }
        ScrollTrigger.create({
          trigger: title,
          start: 'top 88%',
          once: true,
          onEnter: () => timeline.play(),
        });
        return timeline;
      },
    }),
  );
  return () => splits.forEach((split) => split.revert());
}
