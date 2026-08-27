import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

test('the app shell is instant on first load', async ({ page, baseURL }) => {
  await instant(
    page,
    async () => {
      await page.goto('/');
      await expect(page.getByRole('searchbox', { name: 'Search books' })).toBeVisible();
    },
    { baseURL },
  );

  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});

test('the next page is resolved by per-link prefetching', async ({ page }) => {
  await page.goto('/');
  const next = page.getByRole('link', { name: 'Next page' });

  await expect(next).toBeVisible();
  await instant(page, async () => {
    await next.click();
    await page.waitForURL(url => url.searchParams.get('page') === '2');
    await expect(page.getByText(/page 2 of [\d,]+/)).toBeVisible();
  });
});

test('paging back to the first page removes the page query', async ({ page }) => {
  await page.goto('/?page=2');
  const previous = page.getByRole('link', { name: 'Previous page' });

  await expect(previous).toBeVisible();
  await previous.click();
  await page.waitForURL(url => url.searchParams.get('page') === null);
  await expect(page.getByText(/page 1 of [\d,]+/)).toBeVisible();
});
