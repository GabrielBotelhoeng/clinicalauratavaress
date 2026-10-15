const BLOCKING_IMPACT = new Set(['serious', 'critical']);
const WHATSAPP_NUMBER = '5561981007522';

/** Mensagens de console do JSON de "agent-browser --json console" (formato: { data: { messages: [...] } }). */
export function consoleMessages(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return parsed?.data?.messages ?? [];
}

/** Só as mensagens de erro — warnings não bloqueiam o e2e. */
export function consoleErrors(raw) {
  return consoleMessages(raw).filter((message) => message.type === 'error');
}

/** Origens cujo href não é um link do WhatsApp válido (número certo + mensagem não vazia). */
export function invalidCtaHrefs(hrefsByOrigin) {
  return Object.entries(hrefsByOrigin)
    .filter(([, href]) => {
      if (!href) return true;
      try {
        const url = new URL(href);
        return url.searchParams.get('phone') !== WHATSAPP_NUMBER || !url.searchParams.get('text');
      } catch {
        return true;
      }
    })
    .map(([origin]) => origin);
}

/** Violações bloqueantes (serious/critical) do resultado de axe.run(); moderate/minor não bloqueiam. */
export function blockingAxeViolations(raw) {
  let parsed = raw;
  // O agent-browser serializa o retorno do eval; um JSON.stringify no script viraria string dupla.
  while (typeof parsed === 'string') parsed = JSON.parse(parsed);
  if (!Array.isArray(parsed?.violations)) {
    throw new Error(
      'resultado do axe sem a lista "violations" — o eval do axe falhou ou mudou de formato',
    );
  }
  return parsed.violations.filter((violation) => BLOCKING_IMPACT.has(violation.impact));
}

/** Uma linha por violação, para o relatório e para a mensagem de erro do e2e. */
export function describeViolation(violation) {
  return `${violation.impact}: ${violation.id} — ${violation.description} (${violation.nodes.length} elemento(s))`;
}

/** true/false gravado por "agent-browser eval" (texto "true"/"false", com ou sem aspas/quebra de linha). */
export function readBoolean(raw) {
  return raw.trim().replace(/^"|"$/g, '') === 'true';
}

/** Markdown de docs/qa/e2e.md a partir dos resultados de cada verificação. */
export function toE2eMarkdown(checks, { date }) {
  const lines = [
    '# e2e (agent-browser + axe-core)',
    '',
    `Gerado em ${date} contra o preview (local ou publicado). Capturas em \`docs/qa/\`.`,
    '',
    '| Verificação | Resultado |',
    '|---|---|',
  ];
  for (const check of checks) {
    lines.push(`| ${check.name} | ${check.pass ? 'OK' : `FALHOU — ${check.detail ?? ''}`} |`);
  }
  const failing = checks.filter((check) => !check.pass);
  lines.push('');
  lines.push(
    failing.length === 0
      ? 'Resultado: **aprovado** (todas as verificações passaram).'
      : `Resultado: **reprovado** — ${failing.map((check) => check.name).join(', ')}.`,
  );
  return `${lines.join('\n')}\n`;
}
