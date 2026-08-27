import { expect, test, type Page } from '@playwright/test';

async function waitForFilters(page: Page) {
  await expect(page.locator('[data-filters-ready]')).toBeAttached();
}

test('changing a filter resets pagination and clear restores the defaults', async ({ page }) => {
  await page.goto('/?page=2');
  await waitForFilters(page);

  await page.getByRole('slider').nth(1).press('ArrowRight');
  await expect(page).toHaveURL(/rtg=0.5/);
  await expect(page).not.toHaveURL(/page=/);

  const clear = page.getByRole('button', { name: 'Clear all filters' });
  await expect(clear).toBeVisible();
  await clear.click();

  await expect(page).toHaveURL('/');
  await expect(clear).toHaveCount(0);
});

test('the clear button only appears once a filter is active', async ({ page }) => {
  await page.goto('/');
  await waitForFilters(page);
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toHaveCount(0);

  await page.getByRole('slider').nth(1).press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
});

test('the language filter drives the URL', async ({ page }) => {
  await page.goto('/');
  await waitForFilters(page);

  await page.getByLabel('Language').selectOption('fre');
  await expect(page).toHaveURL(/lng=fre/);
});

test('the catalog only dims while a filter is in flight', async ({ page }) => {
  await page.goto('/');
  await waitForFilters(page);
  const grid = page.locator('[data-filtering]');

  // Idle: nothing in the shell claims to be filtering, so the grid is at full opacity.
  await expect(grid).toHaveCount(0);

  await page.getByRole('link', { name: /W\.C\. Fields/ }).click();
  await page.waitForURL(url => url.pathname === '/5333265');
  await page.getByRole('link', { name: 'Back to books' }).click();
  await page.waitForURL('/');

  // A plain navigation must not leave the filtering signal set behind.
  await expect(grid).toHaveCount(0);
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});
