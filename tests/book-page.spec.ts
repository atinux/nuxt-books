import { expect, test } from '@playwright/test';

test('a book navigation keeps the app shell mounted', async ({ page }) => {
  await page.goto('/');
  const book = page.getByRole('link', { name: /W\.C\. Fields/ });

  await book.click();
  await page.waitForURL(url => url.pathname === '/5333265');
  await expect(page.getByRole('searchbox', { name: 'Search books' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'W.C. Fields: A Life on Film' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to books' })).toBeVisible();
});

test('a book detail cover has a responsive image source', async ({ page }) => {
  await page.goto('/900044?page=2');
  const cover = page.getByRole('img', { name: 'The Second Harbor' });

  await expect(cover).toHaveAttribute('src', /\S/);
  await expect(cover).toHaveAttribute('srcset', /\S/);
});

test('visible first-page books prefetch their extracted payloads', async ({ page }) => {
  const payloads: string[] = [];
  page.on('response', response => {
    if (response.url().includes('_payload.json')) payloads.push(response.url());
  });

  await page.goto('/');
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();

  await expect.poll(() => payloads.some(url => new URL(url).pathname === '/5333265/_payload.json')).toBe(true);
});

test('later-page books prefetch their payload on interaction', async ({ page }) => {
  const payloads: string[] = [];
  page.on('response', response => {
    if (response.url().includes('_payload.json')) payloads.push(response.url());
  });

  await page.goto('/?page=2');
  const book = page
    .locator('main a')
    .filter({ has: page.locator('img') })
    .first();
  const href = await book.getAttribute('href');
  const pathname = new URL(href!, 'http://localhost').pathname;

  await book.hover();
  await expect.poll(() => payloads.some(url => new URL(url).pathname === `${pathname}/_payload.json`)).toBe(true);
});

test('a book page keeps the catalog filters for the back navigation', async ({ page }) => {
  await page.goto('/?search=wizard');
  const book = page.getByRole('link', { name: /Unschooled Wizard/ });

  await book.click();
  await expect(page.getByRole('heading', { name: 'The Unschooled Wizard' })).toBeVisible();

  const back = page.getByRole('button', { name: 'Back to books' });

  await back.click();
  await page.waitForURL('/?search=wizard');
  await expect(page.getByRole('link', { name: /Unschooled Wizard/ })).toBeVisible();

  await expect(page.getByRole('searchbox', { name: 'Search books' })).toHaveValue('wizard');
});

test('a later catalog page is restored from the visited router cache', async ({ page }) => {
  await page.goto('/?page=2');
  const book = page
    .locator('main a')
    .filter({ has: page.locator('img') })
    .first();
  const bookName = await book.locator('img').getAttribute('alt');

  await book.click();
  const back = page.getByRole('button', { name: 'Back to books' });
  await expect(back).toBeVisible();

  await back.click();
  await page.waitForURL('/?page=2');
  await expect(page.getByRole('link', { name: bookName! }).first()).toBeVisible();
});

test('an unknown book id renders the not-found state', async ({ page }) => {
  await page.goto('/99999999');
  await expect(page.getByText('Book not found', { exact: true }).filter({ visible: true })).toBeVisible();
});
