/** Prepara um SVG bruto (Phosphor) para uso inline: tamanho, classe e escondido de leitores de tela. */
export function decorateSvg(
  raw: string,
  { size, className }: { size: number; className?: string | undefined },
): string {
  const svg = raw.trim();
  if (!svg.startsWith('<svg')) throw new Error('decorateSvg: o conteúdo não é um <svg>.');
  const attributes = [
    `width="${size}"`,
    `height="${size}"`,
    'aria-hidden="true"',
    'focusable="false"',
  ];
  if (className) attributes.push(`class="${className.replace(/"/g, '')}"`);
  return svg.replace(/^<svg\b/, `<svg ${attributes.join(' ')}`);
}
