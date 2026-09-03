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

  await expect(search).toHaveValue('wizard');
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toBeVisible();
});

test('a stale search request cannot remove the latest character', async ({ page }) => {
  let releaseStaleRequest!: () => void;
  let staleRequestStarted!: () => void;
  const staleRequestGate = new Promise<void>(resolve => (releaseStaleRequest = resolve));
  const staleRequestSeen = new Promise<void>(resolve => (staleRequestStarted = resolve));

  await page.route('**/_payload.json?**', async route => {
    const url = new URL(route.request().url());

    if (url.searchParams.get('search') === 'wizar') {
      staleRequestStarted();
      await staleRequestGate;
    }

    await route.continue().catch(() => {});
  });

  await page.goto('/');
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Search books' });

  await search.pressSequentially('wizar', { delay: 150 });
  await staleRequestSeen;
  await search.evaluate(element => {
    const input = element as HTMLInputElement;
    input.value += 'd';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'd', inputType: 'insertText' }));
  });
  await page.waitForTimeout(100);

  releaseStaleRequest();

  await expect(page).toHaveURL(/search=wizard/);
  await expect(search).toHaveValue('wizard');
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
