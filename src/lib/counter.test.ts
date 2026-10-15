import { describe, expect, it } from 'vitest';
import { formatCount } from './counter';

describe('formatCount', () => {
  it('arredonda e aplica prefixo e sufixo', () => {
    expect(formatCount(0, '+', ' mil')).toBe('+0 mil');
    expect(formatCount(24.6, '+', ' mil')).toBe('+25 mil');
    expect(formatCount(9, '', ' anos')).toBe('9 anos');
  });

  it('funciona sem prefixo nem sufixo', () => {
    expect(formatCount(7.4)).toBe('7');
  });
});
