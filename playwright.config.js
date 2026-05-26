import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'on',
    video: 'off',
    viewport: { width: 1280, height: 800 },
  },
  outputDir: './test-results/playwright-output',
});
