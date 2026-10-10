import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    viewport: { width: 1280, height: 900 },
    locale: 'zh-Hant-HK',
    timezoneId: 'Asia/Hong_Kong',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
})