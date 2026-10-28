import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
    },
  ],
  webServer: process.env.PLAYWRIGHT_EXTERNAL_SERVER
    ? undefined
    : [
        {
          command: 'go run ./api',
          cwd: '../backend',
          url: 'http://127.0.0.1:8080/health',
          timeout: 60_000,
          reuseExistingServer: false,
          env: { HTTP_ADDR: '127.0.0.1:8080' },
        },
        {
          command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
          url: 'http://127.0.0.1:5173',
          timeout: 30_000,
          reuseExistingServer: false,
        },
      ],
});
