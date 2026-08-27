import { expect, test } from '@playwright/test';

test('search streams matching results', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await search.waitFor({ state: 'visible' });
  await search.click();
  await page.keyboard.type('wizard', { delay: 150 });
  await expect(page).toHaveURL(/search=wizard/);
  await expect(page.getByRole('link', { name: /Unschooled Wizard/ })).toBeVisible();
});

test('search keeps the field and the shell mounted while results resolve', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await search.waitFor({ state: 'visible' });
  await search.click();
  await page.keyboard.type('wizard', { delay: 150 });

  // The header lives in the layout, so it never unmounts across a query change.
  await expect(search).toHaveValue('wizard');
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
});

test('a query with no matches renders the empty state', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await search.waitFor({ state: 'visible' });
  await search.click();
  await page.keyboard.type('zzzznotarealtitle', { delay: 150 });
  await expect(page.getByText('No books found')).toBeVisible();
});

test('clearing the query restores the full catalog', async ({ page }) => {
  await page.goto('/?search=wizard');
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await search.waitFor({ state: 'visible' });
  await expect(search).toHaveValue('wizard');
  await search.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});
