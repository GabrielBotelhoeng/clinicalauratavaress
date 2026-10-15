// Gera docs/CHECKLIST-CLINICA.md: as 8 pendências da spec (fixas) + os avisos "[pendente]"/"placeholder
// em uso" do build (dinâmicos) + as 4 seções de docs/media-pendencias.md (frente de mídia, dinâmico).
// Uso: npm run checklist
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildChecklist, extractPendingFields, extractPlaceholderSlots } from './lib/checklist.mjs';

const build = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  encoding: 'utf8',
});
const output = `${build.stdout ?? ''}\n${build.stderr ?? ''}`;
if (build.status !== 0) {
  console.error('npm run build falhou — corrija antes de gerar o checklist.');
  console.error(output);
  process.exit(1);
}

const mediaDoc = existsSync('docs/media-pendencias.md')
  ? readFileSync('docs/media-pendencias.md', 'utf8')
  : '';
if (mediaDoc === '') {
  console.warn('docs/media-pendencias.md não encontrado — a seção 4 do checklist ficará vazia.');
}

const markdown = buildChecklist({
  pendingFields: extractPendingFields(output),
  placeholderSlots: extractPlaceholderSlots(output),
  mediaDoc,
  date: new Date().toISOString().slice(0, 10),
});

writeFileSync('docs/CHECKLIST-CLINICA.md', markdown);
console.log('docs/CHECKLIST-CLINICA.md atualizado.');
