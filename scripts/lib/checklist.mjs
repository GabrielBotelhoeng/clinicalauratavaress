const PENDING_PREFIX = '[pendente] ';
const PLACEHOLDER_PREFIX = '[mídia] placeholder em uso: ';

function linesWithPrefix(output, prefix) {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length).trim());
}

function dedupe(values) {
  return [...new Set(values)];
}

/** Extrai e deduplica as linhas "[pendente] <campo>" da saída (stdout+stderr) de "npm run build". */
export function extractPendingFields(buildOutput) {
  return dedupe(linesWithPrefix(buildOutput, PENDING_PREFIX));
}

/** Extrai e deduplica os slots ainda em placeholder ("[mídia] placeholder em uso: <slot> ..."). */
export function extractPlaceholderSlots(buildOutput) {
  return dedupe(linesWithPrefix(buildOutput, PLACEHOLDER_PREFIX));
}

/** Bullets ("- ...") sob um "## <heading>" exato, até o próximo "##" ou o fim do arquivo. */
export function extractSection(markdown, heading) {
  const marker = `## ${heading}`;
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === marker);
  if (start === -1) return [];
  const bullets = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith('## ')) break;
    if (line.startsWith('- ')) bullets.push(line.slice(2).trim());
  }
  return bullets;
}

// As 2 primeiras pendências marcam explicitamente o que é bloqueante para publicar no domínio
// final (compliance — Global Constraint da linha 22 do plano); as demais seguem a spec e o
// HANDOFF da Etapa 4 (política de privacidade escrita fora do copy, linha 42 de docs/HANDOFF.md).
const CLINIC_PENDENCIES = [
  'Profissão, conselho e número de registro da Dra. (rodapé e seção Sobre) — obrigatório antes de publicar em domínio próprio.',
  'Termos de autorização de imagem dos antes/depois e dos depoimentos usados — bloqueante para publicar no domínio final.',
  'Logo em vetor (SVG/PDF) e assinatura real em SVG.',
  'Horário exato de funcionamento e se há estacionamento.',
  'Nome final do método (Protocolo Identidade LT × Método LT) e lista final de tratamentos.',
  'Função do segundo número, (61) 98105-1565.',
  'Formação acadêmica da Dra. (uma linha no Sobre).',
  'Texto da política de privacidade (escrito para o site, fora do copy original) — precisa de revisão da clínica.',
];

const MEDIA_SECTIONS = [
  'Arquivos dispensados',
  'Avisos',
  'Dados encontrados para o checklist da clínica',
  'Pedidos à clínica',
];

function bulletList(items, empty) {
  return items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : empty;
}

/** Monta docs/CHECKLIST-CLINICA.md: spec (fixo) + build + docs/media-pendencias.md (dinâmicos). */
export function buildChecklist({ pendingFields, placeholderSlots, mediaDoc, date }) {
  const sections = MEDIA_SECTIONS.map(
    (heading) => `### ${heading}\n\n${bulletList(extractSection(mediaDoc, heading), 'Nenhum.')}`,
  ).join('\n\n');

  return `# Checklist da clínica — Landing page

> Gerado por \`npm run checklist\` em ${date}. Pendências que a equipe da Clínica Laura Tavares precisa resolver — nenhuma delas bloqueia a entrega das Etapas 6/7.

## 1. Pendências da spec

${bulletList(CLINIC_PENDENCIES, 'Nenhuma.')}

## 2. Campos pendentes no conteúdo do site (\`[pendente]\` no build)

${bulletList(pendingFields, 'Nenhum — todos os campos de `site.ts` foram preenchidos.')}

## 3. Fotos/vídeos ainda em placeholder

${bulletList(placeholderSlots, 'Nenhum — todos os slots do contrato de mídia têm arquivo real.')}

## 4. Da frente de mídia (\`docs/media-pendencias.md\`)

${sections}
`;
}
