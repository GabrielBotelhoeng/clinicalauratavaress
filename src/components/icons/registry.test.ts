import { describe, expect, it } from 'vitest';
import { contentIcons } from '../../content/site';
import { icons } from './registry';

describe('registro de ícones', () => {
  it('todos são SVG do Phosphor (viewBox 256)', () => {
    for (const [name, svg] of Object.entries(icons)) {
      expect(svg.trim().startsWith('<svg'), name).toBe(true);
      expect(svg, name).toContain('viewBox="0 0 256 256"');
    }
  });

  it('cobre todos os ícones usados no conteúdo', () => {
    for (const name of contentIcons) expect(Object.keys(icons)).toContain(name);
  });
});
