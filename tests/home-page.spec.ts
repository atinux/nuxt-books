import { expect, test } from '@playwright/test';

test('the app shell and catalog render on first load', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('searchbox', { name: 'Search books' })).toBeVisible();
  await expect(page.getByRole('link', { name: /W\.C\. Fields/ })).toBeVisible();
});

test('pagination is available while the exact count loads', async ({ page }) => {
  let countRequests = 0;
  let releaseCount = () => {};
  const countGate = new Promise<void>(resolve => {
    releaseCount = resolve;
  });

  await page.route('**/api/books/count**', async route => {
    countRequests++;
    await countGate;
    await route.continue();
  });

  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Next page' })).toBeVisible();
  await expect(page.getByText('Page 1', { exact: true })).toBeVisible();

  releaseCount();
  await expect(page.getByText(/Page 1 of [\d,]+/)).toBeVisible();

  await page.getByRole('link', { name: 'Next page' }).click();
  await page.waitForURL(url => url.searchParams.get('page') === '2');
  await page.waitForTimeout(500);
  expect(countRequests).toBe(1);
});

test('visible pagination warms the adjacent books API cache', async ({ page }) => {
  let nextPageRequests = 0;

  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname === '/api/books' && url.searchParams.get('page') === '2') nextPageRequests++;
  });

  await page.goto('/');
  const next = page.getByRole('link', { name: 'Next page' });
  await expect(next).toBeVisible();
  await next.scrollIntoViewIfNeeded();

  await expect.poll(() => nextPageRequests).toBe(1);
  await expect(page).toHaveURL('/');
});

test('pagination fetches an extracted payload and reuses the browser cache', async ({ page }) => {
  const client = await page.context().newCDPSession(page);
  const cacheHits: boolean[] = [];
  const payloads: { cacheControl: string | null; url: string }[] = [];
  await client.send('Network.enable');
  client.on('Network.responseReceived', ({ response }) => {
    const url = new URL(response.url);
    if (url.pathname === '/_payload.json' && url.searchParams.get('page') === '2') {
      cacheHits.push(response.fromDiskCache);
    }
  });
  page.on('response', async response => {
    const url = new URL(response.url());
    if (url.pathname !== '/_payload.json' || url.searchParams.get('page') !== '2') return;

    payloads.push({
      cacheControl: await response.headerValue('cache-control'),
      url: response.url(),
    });
  });

  await page.goto('/');
  const next = page.getByRole('link', { name: 'Next page' });

  await expect(next).toBeVisible();
  await page.waitForTimeout(750);
  expect(payloads).toEqual([]);

  await next.click();
  await page.waitForURL(url => url.searchParams.get('page') === '2');
  await expect(page.getByText(/Page 2 of [\d,]+/)).toBeVisible();
  await expect.poll(() => payloads.length).toBeGreaterThan(0);
  expect(payloads.every(payload => payload.url.includes('_b='))).toBe(true);
  expect(payloads.every(payload => payload.cacheControl === 'public, max-age=300, s-maxage=300')).toBe(true);
  const initialRequestCount = cacheHits.length;

  await page.getByRole('link', { name: 'Previous page' }).click();
  await page.waitForURL(url => url.searchParams.get('page') === null);
  await page.getByRole('link', { name: 'Next page' }).click();
  await page.waitForURL(url => url.searchParams.get('page') === '2');

  await expect.poll(() => cacheHits.length).toBeGreaterThan(initialRequestCount);
  expect(cacheHits.slice(initialRequestCount).every(Boolean)).toBe(true);
});

test('the first page is restored without a page query', async ({ page }) => {
  await page.goto('/?page=2');
  const previous = page.getByRole('link', { name: 'Previous page' });

  await expect(previous).toBeVisible();
  await previous.click();
  await page.waitForURL(url => url.searchParams.get('page') === null);
  await expect(page.getByText(/Page 1 of [\d,]+/)).toBeVisible();
});
