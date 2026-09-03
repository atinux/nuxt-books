import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('color-mode-test-ready')) return;

    localStorage.removeItem('nuxt-color-mode');
    sessionStorage.setItem('color-mode-test-ready', 'true');
  });
});

test('system mode follows the OS color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  const html = page.locator('html');
  await expect(html).toHaveClass(/\bdark\b/);
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'System theme' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#121212');
  expect(await html.evaluate(element => getComputedStyle(element).colorScheme)).toBe('dark');

  await page.emulateMedia({ colorScheme: 'light' });

  await expect(html).toHaveClass(/\blight\b/);
  await expect(html).not.toHaveClass(/\bdark\b/);
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#fafafa');
  expect(await html.evaluate(element => getComputedStyle(element).colorScheme)).toBe('light');
});

test('an explicit color mode persists across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');

  await page.getByRole('button', { name: 'Light mode' }).click();
  await expect(page.locator('html')).toHaveClass(/\blight\b/);
  await expect(page.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('nuxt-color-mode'))).toBe('light');

  await page.reload();

  await expect(page.locator('html')).toHaveClass(/\blight\b/);
  await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
  await expect(page.getByRole('button', { name: 'Light mode' })).toHaveAttribute('aria-pressed', 'true');
});
