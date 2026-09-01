import { expect, test } from '@playwright/test';

test('the app shell and catalog render on first load', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('searchbox', { name: 'Search books' })).toBeVisible();
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});

test('the next page payload is prefetched when its link becomes visible', async ({ page }) => {
  const payloads: string[] = [];
  page.on('response', response => {
    if (response.url().includes('_payload.json')) payloads.push(response.url());
  });

  await page.goto('/');
  const next = page.getByRole('link', { name: 'Next page' });

  await expect(next).toBeVisible();
  await expect
    .poll(() => payloads.some(url => url.includes('_payload.json') && new URL(url).searchParams.get('page') === '2'))
    .toBe(true);

  await next.click();
  await page.waitForURL(url => url.searchParams.get('page') === '2');
  await expect(page.getByText(/Page 2 of [\d,]+/)).toBeVisible();
});

test('the first page is restored without a page query', async ({ page }) => {
  await page.goto('/?page=2');
  const previous = page.getByRole('link', { name: 'Previous page' });

  await expect(previous).toBeVisible();
  await previous.click();
  await page.waitForURL(url => url.searchParams.get('page') === null);
  await expect(page.getByText(/Page 1 of [\d,]+/)).toBeVisible();
});
