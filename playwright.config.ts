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
    // A production server, not `next dev`: Next allows only one dev server per
    // directory, so `next dev` here is refused whenever one is already running.
    command: `pnpm exec next build && pnpm exec next start --hostname 127.0.0.1 --port ${port}`,
    // Blanking POSTGRES_URL drops the app onto the generated preview catalog, so the
    // suite runs on a fixed dataset with no database.
    env: { POSTGRES_URL: '' },
    // Never attach this suite to an unrelated local app that happens to own
    // the configured port. Playwright should only test the build it started.
    reuseExistingServer: false,
    stdout: 'pipe',
    timeout: 300_000,
    url: baseURL,
  },
  workers: 1,
});
