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

test('a cached return to the catalog does not replay its reveal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /W\.C\. Fields/ }).click();
  await expect(page.getByRole('heading', { name: 'W.C. Fields: A Life on Film' })).toBeVisible();

  await page.evaluate(() => {
    const state = { names: [] as string[], seen: new Set<Animation>() };
    const timer = window.setInterval(() => {
      for (const animation of document.getAnimations({ subtree: true })) {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        if (target?.constructor.name === 'CSSPseudoElement' && !state.seen.has(animation)) {
          state.seen.add(animation);
          state.names.push(animation.animationName);
        }
      }
    }, 2);

    Object.assign(window, { __catalogTransitionState: state, __catalogTransitionTimer: timer });
  });

  await page.getByRole('link', { name: 'Back to books' }).click();
  await page.waitForURL('/');
  await page.waitForTimeout(300);

  const animations = await page.evaluate(() => {
    const testWindow = window as typeof window & {
      __catalogTransitionState: { names: string[] };
      __catalogTransitionTimer: number;
    };
    window.clearInterval(testWindow.__catalogTransitionTimer);
    return testWindow.__catalogTransitionState.names;
  });

  expect(animations).toEqual([]);
});

test('an unknown book id renders the not-found state', async ({ page }) => {
  await page.goto('/99999999');
  await expect(page.getByRole('heading', { name: 'Book not found' })).toBeVisible();
});
