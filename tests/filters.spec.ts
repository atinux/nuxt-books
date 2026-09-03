import { expect, test, type Page } from '@playwright/test';

async function nudgeSlider(page: Page, nth: number, expected: RegExp) {
  const slider = page.getByRole('slider').nth(nth);
  await slider.waitFor({ state: 'visible' });
  await expect(async () => {
    await slider.press('ArrowRight');
    await expect(page).toHaveURL(expected, { timeout: 1000 });
  }).toPass({ timeout: 15000 });
}

test('filter query state is applied after mount without hydration warnings', async ({ browser }) => {
  const serverContext = await browser.newContext({ javaScriptEnabled: false });
  const serverPage = await serverContext.newPage();
  await serverPage.goto('/?language=fre&rating=4&year=2000');
  await expect(serverPage.getByLabel('Minimum rating').first()).toHaveValue('0');
  await expect(serverPage.getByText('Any rating').first()).toBeVisible();
  await serverContext.close();

  const context = await browser.newContext();
  const page = await context.newPage();
  const hydrationWarnings: string[] = [];
  page.on('console', message => {
    if (/hydration/i.test(message.text())) hydrationWarnings.push(message.text());
  });

  await page.goto('/?language=fre&rating=4&year=2000');
  await expect(page.getByLabel('Language').first()).toHaveValue('fre');
  await expect(page.getByLabel('Minimum rating').first()).toHaveValue('8');
  await expect(page.getByText('4+ stars').first()).toBeVisible();
  await expect(page.getByText('2000').first()).toBeVisible();
  expect(hydrationWarnings).toEqual([]);
  await context.close();
});

test('changing a filter resets pagination and clear restores the defaults', async ({ page }) => {
  await page.goto('/?page=2');
  await nudgeSlider(page, 1, /rating=0.5/);
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

  await nudgeSlider(page, 1, /rating=0.5/);
  await expect(page.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
});

test('a slider updates optimistically while the catalog request is pending', async ({ page }) => {
  let releaseCatalog = () => {};
  const catalogGate = new Promise<void>(resolve => {
    releaseCatalog = resolve;
  });

  await page.route('**/api/books?**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/books' && url.searchParams.get('rating') === '0.5') await catalogGate;
    await route.continue();
  });

  await page.goto('/');
  await page.getByRole('slider').nth(1).press('ArrowRight');
  await expect(page.getByText('0.5+ stars').first()).toBeVisible();
  await expect(page.locator('[data-filtering]').first()).toBeVisible();

  releaseCatalog();
  await expect(page).toHaveURL(/rating=0.5/);
  await expect(page.locator('[data-filtering]')).toHaveCount(0);
});

test('the language filter drives the URL', async ({ page }) => {
  await page.goto('/');
  const language = page.getByLabel('Language');
  await language.waitFor({ state: 'visible' });
  await language.selectOption('fre');
  await expect(page).toHaveURL(/language=fre/);
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
  await page.getByRole('button', { name: 'Back to books' }).click();
  await page.waitForURL('/');

  await expect(grid).toHaveCount(0);
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});
