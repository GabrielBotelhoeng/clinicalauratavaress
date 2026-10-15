import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Cleanup } from './types';

const LINE_STAGGER = 0.08;
const ACCENT_DELAY = 0.15;

/**
 * Padrão 1: cada linha sobe de yPercent 110 dentro de uma máscara (stagger 0,08 s, dur-base, ease-lux);
 * a palavra em itálico (<em>) entra por último, com 0,15 s extra.
 *
 * O SplitText só é criado quando o título se aproxima da tela (folga de 200px: `top bottom+=200`),
 * não os 13 no boot — evita o custo de layout inicial que derrubava o Lighthouse mobile. O título
 * fica escondido (CSS `visibility: hidden`) até lá; assim que divide, o `.from()` já deixa as linhas
 * fora da máscara (yPercent 110), então destravar a visibilidade não causa "piscada". A reprodução
 * em si continua presa a um segundo trigger, em `top 88%`, como antes (C1): a timeline nasce pausada
 * e só toca quando o título realmente entra na tela.
 */
export function animateTitles(): Cleanup {
  let splits: SplitText[] = [];
  const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-title]'), (title) =>
    ScrollTrigger.create({
      trigger: title,
      start: 'top bottom+=200',
      once: true,
      onEnter: () => {
        const split = SplitText.create(title, {
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
        });
        splits.push(split);
      },
    }),
  );
  return () => {
    triggers.forEach((trigger) => trigger.kill());
    splits.forEach((split) => split.revert());
    splits = [];
  };
}
