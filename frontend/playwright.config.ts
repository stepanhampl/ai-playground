import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  use: {
    baseURL: 'http://0.0.0.0:8000',
    headless: true,
    channel: 'chrome',
  },
});
