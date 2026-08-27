import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3002';

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
    command: `pnpm exec next dev --hostname 127.0.0.1 --port ${new URL(baseURL).port}`,
    // Blanking POSTGRES_URL drops the app onto the generated preview catalog, so the
    // suite runs on a fixed dataset with no database. Its own port keeps a dev server
    // on 3000 out of the way.
    env: { POSTGRES_URL: '' },
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    url: baseURL,
  },
  workers: 1,
});
