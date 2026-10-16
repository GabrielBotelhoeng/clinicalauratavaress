import { describe, expect, it } from 'vitest';
import {
  blockingAxeViolations,
  consoleErrors,
  describeViolation,
  invalidCtaHrefs,
  readBoolean,
  toE2eMarkdown,
} from './browser-logs.mjs';

const CONSOLE_JSON = JSON.stringify({
  data: {
    messages: [
      { type: 'log', text: 'oi' },
      { type: 'error', text: 'TypeError: x' },
      { type: 'warning', text: 'cuidado' },
    ],
  },
});

describe('consoleErrors', () => {
  it('filtra só as mensagens de erro (warning não bloqueia)', () => {
    expect(consoleErrors(CONSOLE_JSON)).toEqual([{ type: 'error', text: 'TypeError: x' }]);
  });

  it('sem mensagens devolve lista vazia', () => {
    expect(consoleErrors(JSON.stringify({ data: { messages: [] } }))).toEqual([]);
  });
});

describe('invalidCtaHrefs', () => {
  it('aceita hrefs do WhatsApp com o número certo e mensagem não vazia', () => {
    expect(
      invalidCtaHrefs({ hero: 'https://api.whatsapp.com/send?phone=5561981007522&text=Ola' }),
    ).toEqual([]);
  });

  it('rejeita href ausente, número errado ou mensagem vazia', () => {
    expect(
      invalidCtaHrefs({
        hero: null,
        floating: 'https://api.whatsapp.com/send?phone=5561981007522&text=',
        treatment: 'https://api.whatsapp.com/send?phone=0000000000000&text=Ola',
        final: 'https://api.whatsapp.com/send?phone=5561981007522&text=Ola',
      }),
    ).toEqual(['hero', 'floating', 'treatment']);
  });
});

const AXE_JSON = JSON.stringify({
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Contraste insuficiente',
      nodes: [1, 2],
    },
    { id: 'region', impact: 'moderate', description: 'Conteúdo fora de landmark', nodes: [1] },
    { id: 'image-alt', impact: 'critical', description: 'Imagem sem alt', nodes: [1] },
  ],
});

describe('blockingAxeViolations', () => {
  it('mantém só serious e critical', () => {
    expect(blockingAxeViolations(AXE_JSON).map((violation) => violation.id)).toEqual([
      'color-contrast',
      'image-alt',
    ]);
  });

  it('sem violações devolve lista vazia', () => {
    expect(blockingAxeViolations(JSON.stringify({ violations: [] }))).toEqual([]);
  });

  it('aceita o resultado serializado duas vezes (eval do agent-browser)', () => {
    expect(
      blockingAxeViolations(JSON.stringify(AXE_JSON)).map((violation) => violation.id),
    ).toEqual(['color-contrast', 'image-alt']);
  });

  it('recusa resultado sem a lista de violações (não aprova por engano)', () => {
    expect(() => blockingAxeViolations(JSON.stringify({ testEngine: {} }))).toThrow(/violations/);
  });
});

describe('describeViolation', () => {
  it('formata impacto, id, descrição e quantidade de elementos', () => {
    expect(
      describeViolation({
        impact: 'serious',
        id: 'color-contrast',
        description: 'Contraste insuficiente',
        nodes: [1, 2],
      }),
    ).toBe('serious: color-contrast — Contraste insuficiente (2 elemento(s))');
  });
});

describe('readBoolean', () => {
  it('lê true/false de "agent-browser eval", com ou sem aspas/quebra de linha', () => {
    expect(readBoolean('true\n')).toBe(true);
    expect(readBoolean('"false"\n')).toBe(false);
    expect(readBoolean('false')).toBe(false);
  });
});

describe('toE2eMarkdown', () => {
  it('marca aprovado quando tudo passa', () => {
    const markdown = toE2eMarkdown([{ name: 'console sem erros', pass: true }], {
      date: '2026-10-07',
    });
    expect(markdown).toContain('| console sem erros | OK |');
    expect(markdown).toContain('Resultado: **aprovado**');
  });

  it('lista o que falhou, com o detalhe', () => {
    const markdown = toE2eMarkdown(
      [
        { name: 'console sem erros', pass: true },
        { name: 'axe-core', pass: false, detail: 'serious: color-contrast — ... (2 elemento(s))' },
      ],
      { date: '2026-10-07' },
    );
    expect(markdown).toContain('FALHOU — serious: color-contrast');
    expect(markdown).toContain('Resultado: **reprovado** — axe-core.');
  });
});
