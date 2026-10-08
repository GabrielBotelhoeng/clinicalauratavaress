import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveVideo } from './public-media';

const roots: string[] = [];

function projectWith(files: string[]): string {
  const root = mkdtempSync(join(tmpdir(), 'lt-media-'));
  roots.push(root);
  mkdirSync(join(root, 'public', 'media'), { recursive: true });
  for (const file of files) writeFileSync(join(root, 'public', 'media', file), '');
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('resolveVideo', () => {
  it('lista WebM antes de MP4 e acha o poster', () => {
    const root = projectWith(['metodo.mp4', 'metodo.webm', 'metodo-poster.jpg']);
    expect(resolveVideo('metodo', root)).toEqual({
      sources: [
        { src: '/media/metodo.webm', type: 'video/webm' },
        { src: '/media/metodo.mp4', type: 'video/mp4' },
      ],
      poster: '/media/metodo-poster.jpg',
    });
  });

  it('funciona só com MP4', () => {
    expect(resolveVideo('metodo', projectWith(['metodo.mp4']))).toEqual({
      sources: [{ src: '/media/metodo.mp4', type: 'video/mp4' }],
      poster: undefined,
    });
  });

  it('só o poster ainda vira fundo estático', () => {
    expect(resolveVideo('cta-final', projectWith(['cta-final-poster.jpg']))).toEqual({
      sources: [],
      poster: '/media/cta-final-poster.jpg',
    });
  });

  it('sem arquivos (ou sem a pasta public/media) devolve vazio', () => {
    expect(resolveVideo('cta-final', projectWith([]))).toEqual({ sources: [], poster: undefined });
    const empty = mkdtempSync(join(tmpdir(), 'lt-media-'));
    roots.push(empty);
    expect(resolveVideo('metodo', empty)).toEqual({ sources: [], poster: undefined });
  });

  it('recusa nomes com caminho', () => {
    expect(() => resolveVideo('../segredo', projectWith([]))).toThrow(/inválido/);
  });
});
