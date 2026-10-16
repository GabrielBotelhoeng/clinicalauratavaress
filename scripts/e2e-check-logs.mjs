// Lê os artefatos capturados por scripts/e2e.sh em <dir>, monta docs/qa/e2e.md e sai com 1 se algo falhou.
// Uso: node scripts/e2e-check-logs.mjs <dir> <qaDir>   (chamado pelo próprio scripts/e2e.sh)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  blockingAxeViolations,
  consoleErrors,
  describeViolation,
  invalidCtaHrefs,
  readBoolean,
  toE2eMarkdown,
} from './lib/browser-logs.mjs';

const [, , dir, qaDir] = process.argv;
if (!dir || !qaDir) {
  console.error('Uso: node scripts/e2e-check-logs.mjs <dir> <qaDir>');
  process.exit(2);
}

const read = (file) => readFileSync(join(dir, file), 'utf8');
const checks = [];

const errors = consoleErrors(read('console.json'));
checks.push({
  name: 'console sem erros',
  pass: errors.length === 0,
  detail: errors.map((error) => error.text).join('; '),
});

const badCtas = invalidCtaHrefs(JSON.parse(read('cta-hrefs.json')));
checks.push({
  name: 'CTAs do WhatsApp (amostra)',
  pass: badCtas.length === 0,
  detail: badCtas.join(', '),
});

checks.push({ name: 'menu mobile abre', pass: readBoolean(read('menu-open.json')) });
checks.push({ name: 'menu mobile fecha (Esc)', pass: readBoolean(read('menu-closed.json')) });
checks.push({ name: 'FAQ abre pelo clique/teclado', pass: readBoolean(read('faq-open.json')) });

const sliderBefore = read('slider-before.txt').trim();
const sliderAfter = read('slider-after.txt').trim();
checks.push({
  name: 'slider antes/depois responde ao teclado',
  pass: sliderBefore !== sliderAfter,
  detail: `${sliderBefore} → ${sliderAfter}`,
});

for (const width of [320, 375]) {
  checks.push({
    name: `sem rolagem horizontal em ${width}px`,
    pass: readBoolean(read(`no-scroll-${width}.txt`)),
  });
}

checks.push({
  name: 'movimento reduzido: conteúdo visível',
  pass: readBoolean(read('reduced-motion.json')),
});
checks.push({
  name: 'scripts bloqueados: failsafe de 4s revela o conteúdo',
  pass: readBoolean(read('no-js-visible.json')),
});

for (const page of ['home', 'privacidade']) {
  const violations = blockingAxeViolations(read(`axe-${page}.json`));
  checks.push({
    name: `axe-core sem violações serious/critical (${page})`,
    pass: violations.length === 0,
    detail: violations.map(describeViolation).join('; '),
  });
}

const markdown = toE2eMarkdown(checks, { date: new Date().toISOString().slice(0, 10) });
writeFileSync(join(qaDir, 'e2e.md'), markdown);
console.log(markdown);
process.exit(checks.some((check) => !check.pass) ? 1 : 0);
