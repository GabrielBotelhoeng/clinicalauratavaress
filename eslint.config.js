import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/',
    '.astro/',
    'docs/',
    'public/',
    'media-src/',
    '.worktrees/',
    '.vercel/',
    '.claude/',
    '.e2e-tmp/',
    // workspace local do orquestrador (ledgers, briefs) — fora das ferramentas
    '.superpowers/**',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
]);
