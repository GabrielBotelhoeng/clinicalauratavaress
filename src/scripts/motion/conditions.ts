/** Condições do gsap.matchMedia: sempre desktop E mobile, para o handler rodar em qualquer largura. */
export const MOTION_CONDITIONS = {
  isDesktop: '(min-width: 1024px)',
  isMobile: '(max-width: 1023.98px)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
} as const;

export type MotionConditions = Record<keyof typeof MOTION_CONDITIONS, boolean>;

export function readConditions(conditions: Record<string, boolean> | undefined): MotionConditions {
  return {
    isDesktop: Boolean(conditions?.isDesktop),
    isMobile: Boolean(conditions?.isMobile),
    reduceMotion: Boolean(conditions?.reduceMotion),
  };
}
