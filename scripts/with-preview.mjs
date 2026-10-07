// Sobe o `astro preview` (dist/ já gerado), roda um comando com BASE_URL e derruba o servidor no fim.
// Uso: node scripts/with-preview.mjs <comando> [args...]   ex.: node scripts/with-preview.mjs bash scripts/e2e.sh
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Uso: node scripts/with-preview.mjs <comando> [args...]');
  process.exit(2);
}
if (!existsSync('dist/index.html')) {
  console.error('dist/ não encontrado: rode "npm run build" antes.');
  process.exit(2);
}

const port = process.env.PREVIEW_PORT ?? '4321';
const baseUrl = `http://127.0.0.1:${port}/`;

try {
  await fetch(baseUrl);
  console.error(`A porta ${port} já está em uso. Pare o outro servidor ou defina PREVIEW_PORT.`);
  process.exit(2);
} catch {
  // porta livre: segue
}

const server = spawn(
  process.execPath,
  ['node_modules/astro/bin/astro.mjs', 'preview', '--host', '127.0.0.1', '--port', port],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);

async function waitForServer(timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`astro preview não respondeu em ${baseUrl} após ${timeoutMs / 1000} s`);
}

let exitCode = 1;
try {
  await waitForServer();
  exitCode = await new Promise((resolve) => {
    const child = spawn(command === 'node' ? process.execPath : command, args, {
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: baseUrl },
    });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', (error) => {
      console.error(error.message);
      resolve(1);
    });
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  server.kill();
}
process.exit(exitCode);
