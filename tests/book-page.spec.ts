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

test('a book navigation starts on primary-button mousedown', async ({ page }) => {
  await page.goto('/');
  const book = page.getByRole('link', { name: /W\.C\. Fields/ });

  await expect(book).toBeVisible();
  await book.dispatchEvent('mousedown', { button: 0 });

  await page.waitForURL(url => url.pathname === '/5333265');
});

test('fast book links preserve modified clicks and keyboard navigation', async ({ page }) => {
  await page.goto('/');
  const book = page.getByRole('link', { name: /W\.C\. Fields/ });

  await expect(book).toBeVisible();
  await book.dispatchEvent('mousedown', { button: 0, metaKey: true });
  await page.waitForTimeout(100);
  await expect(page).toHaveURL('/');

  await book.focus();
  await book.press('Enter');
  await page.waitForURL(url => url.pathname === '/5333265');
});

test('a book detail cover has a responsive image source', async ({ page }) => {
  await page.goto('/900044?page=2');
  const cover = page.getByRole('img', { name: 'The Second Harbor' });

  await expect(cover).toHaveAttribute('src', /\S/);
  await expect(cover).toHaveAttribute('srcset', /\S/);
});

test('route prefetch warms a reusable image response', async ({ page }) => {
  const imageRequests: { resourceType: string; url: string }[] = [];
  const imageResponses: string[] = [];
  let payloadPrefetched = false;
  page.on('request', request => {
    if (request.url().includes('/5333265.jpg')) {
      imageRequests.push({ resourceType: request.resourceType(), url: request.url() });
    }
  });
  page.on('response', response => {
    if (new URL(response.url()).pathname === '/5333265/_payload.json') payloadPrefetched = true;
    if (response.url().includes('/5333265.jpg')) imageResponses.push(response.url());
  });

  await page.goto('/');
  const book = page.getByRole('link', { name: /W\.C\. Fields/ });
  await expect(book).toBeVisible();
  await expect.poll(() => payloadPrefetched).toBe(true);

  const forwardedCover = page.locator('link[rel="preload"][as="image"][href*="5333265.jpg"]');
  await expect(forwardedCover).toHaveCount(1);
  await expect.poll(() => imageResponses.length).toBeGreaterThanOrEqual(2);
  expect(imageRequests.filter(request => request.resourceType === 'other')).toHaveLength(0);

  await book.click();
  await page.waitForURL(url => url.pathname === '/5333265');
  const detailCover = page.getByRole('img', { name: 'W.C. Fields: A Life on Film' });
  await expect(detailCover).toBeVisible();
  await expect.poll(() => detailCover.evaluate(image => (image as HTMLImageElement).currentSrc)).not.toBe('');
  const detailCoverUrl = await detailCover.evaluate(image => (image as HTMLImageElement).currentSrc);
  expect(imageRequests.filter(request => request.url === detailCoverUrl)).toHaveLength(1);
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

test('returning to the kept-alive catalog does not refetch its books', async ({ page }) => {
  let currentPageRequests = 0;
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname === '/api/books' && url.searchParams.get('page') === '2') {
      currentPageRequests++;
    }
  });

  await page.goto('/?page=2');
  const book = page
    .locator('main a')
    .filter({ has: page.locator('img') })
    .first();
  await expect(book).toBeVisible();
  currentPageRequests = 0;
  await page.evaluate(() => {
    const catalog = document.querySelector('main > div');
    Object.assign(window, { __catalogElement: catalog, __catalogWasFiltering: false });
    new MutationObserver(() => {
      if (document.querySelector('[data-filtering]')) {
        Object.assign(window, { __catalogWasFiltering: true });
      }
    }).observe(document.querySelector('main')!, { attributes: true, childList: true, subtree: true });
  });

  await book.click();
  await expect(page.getByRole('button', { name: 'Back to books' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to books' }).click();
  await page.waitForURL('/?page=2');
  await expect(book).toBeVisible();
  await page.waitForTimeout(100);

  const catalogState = await page.evaluate(() => ({
    sameElement:
      Object.hasOwn(window, '__catalogElement') && window.__catalogElement === document.querySelector('main > div'),
    wasFiltering: Boolean(window.__catalogWasFiltering),
  }));
  expect(catalogState).toEqual({ sameElement: true, wasFiltering: false });
  expect(currentPageRequests).toBe(0);
});

test('an unknown book id renders the not-found state', async ({ page }) => {
  await page.goto('/99999999');
  await expect(page.getByText('Book not found', { exact: true }).filter({ visible: true })).toBeVisible();
});
