import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  retries: 1,
  use: { headless: false },
  reporter: [['list']],
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: ['**/tests-integration/**', '**/cypress/**', '**/node_modules/**']
});