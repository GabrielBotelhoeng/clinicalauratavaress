// Roda o Lighthouse 12.8.2 (mobile) contra BASE_URL e grava docs/qa/lighthouse.md.
// Uso: npm run build && npm run lighthouse   (o npm script sobe o preview via with-preview.mjs)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CATEGORIES, summarize, toMarkdown } from './lib/lighthouse-summary.mjs';

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:4321/';
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'politica-de-privacidade', path: '/politica-de-privacidade' },
];

/** Chrome for Testing do agent-browser (versão mais nova), ou CHROME_PATH, ou o Chrome instalado. */
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const dir = join(homedir(), '.agent-browser', 'browsers');
  if (!existsSync(dir)) return undefined;
  const builds = readdirSync(dir)
    .filter((name) => name.startsWith('chrome-'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .reverse();
  for (const build of builds) {
    const exe = join(dir, build, process.platform === 'win32' ? 'chrome.exe' : 'chrome');
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

const outDir = join('docs', 'qa', 'lighthouse');
mkdirSync(outDir, { recursive: true });
const chrome = findChrome();
const env = chrome ? { ...process.env, CHROME_PATH: chrome } : process.env;
const pages = PAGES.filter(
  (page) => page.path === '/' || existsSync(join('dist', `${page.path.slice(1)}.html`)),
);

const results = [];
for (const page of pages) {
  const url = new URL(page.path, BASE_URL).href;
  const output = join(outDir, `${page.name}.json`);
  rmSync(output, { force: true });
  const command = [
    'npx --yes lighthouse@12.8.2',
    `"${url}"`,
    '--quiet',
    '--output=json',
    `--output-path="${output}"`,
    `--only-categories=${CATEGORIES.join(',')}`,
    '--chrome-flags="--headless=new --no-first-run --no-default-browser-check"',
  ].join(' ');
  console.log(`▶ Lighthouse ${url}`);
  const run = spawnSync(command, { shell: true, stdio: 'inherit', env });
  if (!existsSync(output)) {
    console.error(`Lighthouse não gerou ${output} (código ${run.status}).`);
    process.exit(1);
  }
  results.push({ name: page.name, summary: summarize(JSON.parse(readFileSync(output, 'utf8'))) });
}

const markdown = toMarkdown(results, { date: new Date().toISOString().slice(0, 10) });
writeFileSync(join('docs', 'qa', 'lighthouse.md'), markdown);
console.log(markdown);
process.exit(results.some((result) => result.summary.failing.length > 0) ? 1 : 0);
