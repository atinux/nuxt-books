import { expect, test, type Page } from '@playwright/test';

async function waitForSearch(page: Page) {
  await expect(page.locator('[data-search-ready]')).toBeAttached();
}

test('search streams matching results', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await waitForSearch(page);
  await search.fill('wizard');
  await expect(page).toHaveURL(/search=wizard/);
  await expect(page.getByRole('link', { name: /Unschooled Wizard/ })).toBeVisible();
});

test('search keeps the field and the shell mounted while results resolve', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await waitForSearch(page);
  await search.fill('wizard');

  // The header lives in the layout, so it never unmounts across a query change.
  await expect(search).toHaveValue('wizard');
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
});

test('a query with no matches renders the empty state', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await waitForSearch(page);
  await search.fill('zzzznotarealtitle');
  await expect(page.getByText('No books found')).toBeVisible();
});

test('clearing the query restores the full catalog', async ({ page }) => {
  await page.goto('/?search=wizard');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await waitForSearch(page);
  await expect(search).toHaveValue('wizard');
  await search.fill('');

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});
