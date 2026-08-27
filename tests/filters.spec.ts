import { expect, test, type Page } from '@playwright/test';

async function nudgeSlider(page: Page, nth: number, expected: RegExp) {
  const slider = page.getByRole('slider').nth(nth);
  await slider.waitFor({ state: 'visible' });
  await expect(async () => {
    await slider.press('ArrowRight');
    await expect(page).toHaveURL(expected, { timeout: 1000 });
  }).toPass({ timeout: 15000 });
}

test('changing a filter resets pagination and clear restores the defaults', async ({ page }) => {
  await page.goto('/?page=2');
  await nudgeSlider(page, 1, /rtg=0.5/);
  await expect(page).not.toHaveURL(/page=/);

  const clear = page.getByRole('button', { name: 'Clear all filters' });
  await expect(clear).toBeVisible();
  await clear.click();

  await expect(page).toHaveURL('/');
  await expect(clear).toHaveCount(0);
});

test('the clear button only appears once a filter is active', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toHaveCount(0);

  await nudgeSlider(page, 1, /rtg=0.5/);
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
});

test('the language filter drives the URL', async ({ page }) => {
  await page.goto('/');
  const language = page.getByLabel('Language');
  await language.waitFor({ state: 'visible' });
  await language.selectOption('fre');
  await expect(page).toHaveURL(/lng=fre/);
});

test('book lists use readable URL state', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Sci-Fi & Fantasy').check();

  await expect(page).toHaveURL(/list=sci-fi-fantasy/);
  await expect(page).not.toHaveURL(/isbn=/);
  await expect(page.getByLabel('Sci-Fi & Fantasy')).toBeChecked();
});

test('the catalog only dims while a filter is in flight', async ({ page }) => {
  await page.goto('/');
  const grid = page.locator('[data-filtering]');

  await expect(grid).toHaveCount(0);

  await page.getByRole('link', { name: /W\.C\. Fields/ }).click();
  await page.waitForURL(url => url.pathname === '/5333265');
  await page.getByRole('link', { name: 'Back to books' }).click();
  await page.waitForURL('/');

  await expect(grid).toHaveCount(0);
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});
