import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100';
const port = new URL(baseURL).port;

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: process.env.CI ? [['github'], ['html']] : 'list',
  retries: process.env.CI ? 2 : 0,
  testDir: './tests',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm exec next dev --hostname 127.0.0.1 --port ${port}`,
    // Blanking POSTGRES_URL drops the app onto the generated preview catalog, so the
    // suite runs on a fixed dataset with no database.
    env: { POSTGRES_URL: '' },
    // Next allows one dev server per directory. If you already have one running,
    // point the suite at it with PLAYWRIGHT_BASE_URL instead of starting a second.
    reuseExistingServer: true,
    stdout: 'pipe',
    url: baseURL,
  },
  workers: 1,
});
