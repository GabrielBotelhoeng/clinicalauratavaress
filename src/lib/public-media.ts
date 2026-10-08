import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface VideoSource {
  src: string;
  type: 'video/webm' | 'video/mp4';
}

export interface ResolvedVideo {
  sources: VideoSource[];
  poster: string | undefined;
}

/** Procura public/media/<nome>.webm|.mp4 e <nome>-poster.jpg (entregues pela frente de mídia). */
export function resolveVideo(name: string, root: string = process.cwd()): ResolvedVideo {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Nome de vídeo inválido: "${name}".`);
  const dir = join(root, 'public', 'media');
  const has = (file: string) => existsSync(join(dir, file));
  const sources: VideoSource[] = [];
  if (has(`${name}.webm`)) sources.push({ src: `/media/${name}.webm`, type: 'video/webm' });
  if (has(`${name}.mp4`)) sources.push({ src: `/media/${name}.mp4`, type: 'video/mp4' });
  return { sources, poster: has(`${name}-poster.jpg`) ? `/media/${name}-poster.jpg` : undefined };
}
