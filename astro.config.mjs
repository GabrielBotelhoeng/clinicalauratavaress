// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// URL pública usada em canonical, Open Graph, sitemap e robots. Confirmada na Task 38 (deploy).
const site = process.env.SITE_URL ?? 'https://clinicalauratavaress.vercel.app';

export default defineConfig({
  site,
  trailingSlash: 'never',
  // Nada vira inline: scripts (abaixo) nunca, e CSS também nunca (Astro inlina blocos < 4 KB por
  // padrão) — colide com o CSP style-src 'self' que a Task 36 vai gerar.
  build: { format: 'file', inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  vite: {
    build: {
      // Scripts processados nunca viram <script> inline: o CSP (Task 36) libera só 'self' + hashes conhecidos.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.js') ? false : undefined),
    },
  },
});
