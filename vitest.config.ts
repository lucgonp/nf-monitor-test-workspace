import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    include: ['tests-integration/**/*.spec.ts'],
    exclude: ['tests/e2e/**/*', 'cypress/**/*', 'node_modules/**/*'],
  },
});