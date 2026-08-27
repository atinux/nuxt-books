import { instant } from '@next/playwright';
import { expect, test } from '@playwright/test';

test('a book navigation reveals its shell immediately', async ({ page }) => {
  await page.goto('/');
  const book = page.getByRole('link', { name: /W\.C\. Fields/ });

  await instant(page, async () => {
    await book.click();
    await page.waitForURL(url => url.pathname === '/5333265');
    await expect(page.getByText('Back to books')).toBeVisible();
  });

  await expect(page.getByRole('heading', { name: 'W.C. Fields: A Life on Film' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to books' })).toBeVisible();
});

test('hover intent warms the book page before the click', async ({ page }) => {
  await page.goto('/');
  const book = page.getByRole('link', { name: /Unschooled Wizard/ });

  await book.hover();
  await instant(page, async () => {
    await book.click();
    await page.waitForURL(url => url.pathname === '/7327624');
    await expect(page.getByRole('heading', { name: 'The Unschooled Wizard' })).toBeVisible();
  });
});

test('a book page keeps the catalog filters for the back navigation', async ({ page }) => {
  await page.goto('/?search=wizard');
  const book = page.getByRole('link', { name: /Unschooled Wizard/ });

  await book.click();
  await expect(page.getByRole('heading', { name: 'The Unschooled Wizard' })).toBeVisible();

  const back = page.getByRole('link', { name: 'Back to books' });
  await expect(back).toHaveAttribute('href', '/?search=wizard');

  await instant(page, async () => {
    await back.click();
    await page.waitForURL('/?search=wizard');
  });

  await expect(page.getByRole('searchbox', { name: 'Search books' })).toHaveValue('wizard');
  await expect(page.getByRole('link', { name: /Unschooled Wizard/ })).toBeVisible();
});

test('an unknown book id renders the not-found state', async ({ page }) => {
  await page.goto('/99999999');
  await expect(page.getByRole('heading', { name: 'Book not found' })).toBeVisible();
});
