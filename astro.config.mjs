// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// URL pública usada em canonical, Open Graph, sitemap e robots. Confirmada na Task 38 (deploy).
const site = process.env.SITE_URL ?? 'https://clinicalauratavaress.vercel.app';

export default defineConfig({
  site,
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  vite: {
    build: {
      // Scripts processados nunca viram <script> inline: o CSP (Task 36) libera só 'self' + hashes conhecidos.
      assetsInlineLimit: (filePath) => (filePath.endsWith('.js') ? false : undefined),
    },
  },
});
