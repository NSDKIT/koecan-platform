import { defineConfig, devices } from '@playwright/test';

const appPort = Number(process.env.APP_PORT ?? process.env.PORT ?? 3000);
const appHost = process.env.APP_HOST ?? 'localhost';
const baseURL = process.env.APP_BASE_URL ?? `http://${appHost}:${appPort}`;
const portCommand = process.platform === 'win32' ? `set PORT=${appPort}&&` : `PORT=${appPort}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  webServer: {
    command: `${portCommand} npm run dev`,
    url: baseURL,
    port: appPort,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe'
  },
  use: {
    baseURL,
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
