export const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

export const LABELS = {
  performance: 'Performance',
  accessibility: 'Acessibilidade',
  'best-practices': 'Boas práticas',
  seo: 'SEO',
};

/** Notas 0–100 das 4 categorias e métricas-chave de um relatório (LHR) do Lighthouse. */
export function summarize(lhr, threshold = 90) {
  const scores = {};
  for (const id of CATEGORIES) {
    const score = lhr?.categories?.[id]?.score;
    scores[id] = typeof score === 'number' ? Math.round(score * 100) : 0;
  }
  const metric = (id) => {
    const value = lhr?.audits?.[id]?.numericValue;
    return typeof value === 'number' ? value : null;
  };
  return {
    url: lhr?.finalDisplayedUrl ?? lhr?.finalUrl ?? '',
    scores,
    failing: CATEGORIES.filter((id) => scores[id] < threshold),
    lcpMs: metric('largest-contentful-paint'),
    cls: metric('cumulative-layout-shift'),
    tbtMs: metric('total-blocking-time'),
  };
}

const seconds = (ms) => (ms === null ? '—' : `${(ms / 1000).toFixed(2).replace('.', ',')} s`);
const millis = (ms) => (ms === null ? '—' : `${Math.round(ms)} ms`);
const decimal = (value) => (value === null ? '—' : value.toFixed(3).replace('.', ','));

/** Resumo em Markdown para docs/qa/lighthouse.md. */
export function toMarkdown(results, { date, threshold = 90 }) {
  const lines = [
    '# Lighthouse (mobile)',
    '',
    `Gerado em ${date} contra o \`astro preview\`, com o Lighthouse 12.8.2 (emulação mobile padrão). Meta: ≥ ${threshold} nas 4 categorias.`,
    '',
    '| Página | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |',
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const { name, summary } of results) {
    const s = summary.scores;
    lines.push(
      `| ${name} | ${s.performance} | ${s.accessibility} | ${s['best-practices']} | ${s.seo} | ${seconds(summary.lcpMs)} | ${decimal(summary.cls)} | ${millis(summary.tbtMs)} |`,
    );
  }
  const failing = results.filter((result) => result.summary.failing.length > 0);
  lines.push('');
  lines.push(
    failing.length === 0
      ? `Resultado: **aprovado** (todas as categorias ≥ ${threshold}).`
      : `Resultado: **reprovado** — ${failing
          .map(
            (result) =>
              `${result.name}: ${result.summary.failing.map((id) => LABELS[id]).join(', ')}`,
          )
          .join('; ')}.`,
  );
  return `${lines.join('\n')}\n`;
}
