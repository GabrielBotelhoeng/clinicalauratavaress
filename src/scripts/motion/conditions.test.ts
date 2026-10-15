import { describe, expect, it } from 'vitest';
import { MOTION_CONDITIONS, readConditions } from './conditions';

describe('MOTION_CONDITIONS', () => {
  it('cobre desktop e mobile sem lacuna em 1024px (o handler do matchMedia sempre roda)', () => {
    expect(MOTION_CONDITIONS.isDesktop).toBe('(min-width: 1024px)');
    expect(MOTION_CONDITIONS.isMobile).toBe('(max-width: 1023.98px)');
  });

  it('inclui o movimento reduzido', () => {
    expect(MOTION_CONDITIONS.reduceMotion).toBe('(prefers-reduced-motion: reduce)');
  });
});

describe('readConditions', () => {
  it('normaliza condições ausentes para false', () => {
    expect(readConditions(undefined)).toEqual({
      isDesktop: false,
      isMobile: false,
      reduceMotion: false,
    });
    expect(readConditions({ isDesktop: true })).toEqual({
      isDesktop: true,
      isMobile: false,
      reduceMotion: false,
    });
  });
});
