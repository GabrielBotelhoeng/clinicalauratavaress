// vitest.dist.config.ts — testes do HTML gerado em dist/ (rode `npm run build` antes)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/dist/**/*.test.ts'],
    environment: 'node',
  },
});
