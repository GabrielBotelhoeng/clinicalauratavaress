import { describe, expect, it } from 'vitest';
import {
  buildChecklist,
  extractPendingFields,
  extractPlaceholderSlots,
  extractSection,
} from './checklist.mjs';

const BUILD_OUTPUT = `
[pendente] responsibleTechnician.registration: ...
[mídia] placeholder em uso: dra/hero (esperado src/assets/media/dra/hero.jpg)
[pendente] responsibleTechnician.registration: ...
algo irrelevante
[mídia] placeholder em uso: clinica/sala (esperado src/assets/media/clinica/sala.jpg)
`;

describe('extractPendingFields', () => {
  it('extrai e deduplica as linhas [pendente]', () => {
    expect(extractPendingFields(BUILD_OUTPUT)).toEqual(['responsibleTechnician.registration: ...']);
  });

  it('sem nenhuma linha devolve lista vazia', () => {
    expect(extractPendingFields('build ok\n')).toEqual([]);
  });
});

describe('extractPlaceholderSlots', () => {
  it('extrai os slots em placeholder, na ordem em que aparecem', () => {
    expect(extractPlaceholderSlots(BUILD_OUTPUT)).toEqual([
      'dra/hero (esperado src/assets/media/dra/hero.jpg)',
      'clinica/sala (esperado src/assets/media/clinica/sala.jpg)',
    ]);
  });
});

const MEDIA_DOC = `# Pendências

## Arquivos dispensados

- \`src/assets/media/clinica/equipe.jpg\` — a foto do time ainda não tem autorização.

## Avisos

- Vídeo do Método em 480p (rascunho); finalizar em 1080p antes do deploy.

## Dados encontrados para o checklist da clínica

- Horário: "segunda a sábado, 9h às 19h".

## Pedidos à clínica

- Confirmar o número de registro profissional da Dra.
`;

describe('extractSection', () => {
  it('extrai os bullets de uma seção exata', () => {
    expect(extractSection(MEDIA_DOC, 'Avisos')).toEqual([
      'Vídeo do Método em 480p (rascunho); finalizar em 1080p antes do deploy.',
    ]);
  });

  it('para na próxima ## e ignora linhas que não são bullet', () => {
    expect(extractSection(MEDIA_DOC, 'Arquivos dispensados')).toEqual([
      '`src/assets/media/clinica/equipe.jpg` — a foto do time ainda não tem autorização.',
    ]);
  });

  it('heading inexistente devolve lista vazia', () => {
    expect(extractSection(MEDIA_DOC, 'Não existe')).toEqual([]);
  });
});

describe('buildChecklist', () => {
  it('inclui as 7 pendências da spec, os dados dinâmicos e as 4 seções da mídia', () => {
    const markdown = buildChecklist({
      pendingFields: ['responsibleTechnician.registration: ...'],
      placeholderSlots: ['clinica/sala (esperado src/assets/media/clinica/sala.jpg)'],
      mediaDoc: MEDIA_DOC,
      date: '2026-10-07',
    });
    expect(markdown).toContain('Gerado por `npm run checklist` em 2026-10-07.');
    expect(markdown).toContain('Formação acadêmica da Dra. (uma linha no Sobre).');
    expect(markdown).toContain('- responsibleTechnician.registration: ...');
    expect(markdown).toContain('- clinica/sala (esperado src/assets/media/clinica/sala.jpg)');
    expect(markdown).toContain('### Avisos\n\n- Vídeo do Método em 480p');
    expect(markdown).toContain(
      '### Pedidos à clínica\n\n- Confirmar o número de registro profissional da Dra.',
    );
  });

  it('sem pendências dinâmicas mostra as mensagens de "nenhum"', () => {
    const markdown = buildChecklist({
      pendingFields: [],
      placeholderSlots: [],
      mediaDoc: '',
      date: '2026-10-07',
    });
    expect(markdown).toContain('Nenhum — todos os campos de `site.ts` foram preenchidos.');
    expect(markdown).toContain('Nenhum — todos os slots do contrato de mídia têm arquivo real.');
    expect(markdown).toContain('### Avisos\n\nNenhum.');
  });
});
