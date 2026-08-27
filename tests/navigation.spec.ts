import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

test("the app shell is instant on first load", async ({ page, baseURL }) => {
  await instant(
    page,
    async () => {
      await page.goto("/");
      await expect(page.getByRole("textbox", { name: "Search" })).toBeVisible();
    },
    { baseURL },
  );

  await expect(page.getByRole("link", { name: /W\.C\. Fields/ })).toBeVisible();
});

test("a book navigation reveals its shell immediately", async ({ page }) => {
  await page.goto("/");
  const book = page.getByRole("link", { name: /W\.C\. Fields/ });

  await instant(page, async () => {
    await book.click();
    await page.waitForURL((url) => url.pathname === "/5333265");
    await expect(page.getByText("Back to Books")).toBeVisible();
    await expect(page.getByRole("heading")).toHaveCount(0);
  });

  await expect(
    page.getByRole("heading", { name: "W.C. Fields: A Life on Film" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Books" })).toBeVisible();
});

test("the next page is resolved by per-link prefetching", async ({ page }) => {
  await page.goto("/");
  const next = page.getByRole("link", { name: "Next page" });

  await expect(next).toBeVisible();
  await instant(page, async () => {
    await next.click();
    await page.waitForURL((url) => url.searchParams.get("page") === "2");
    await expect(page.getByText(/\(2 of [\d,]+\)/)).toBeVisible();
  });
});

test("search streams matching results", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("textbox", {
    name: "Search",
  });

  await page.waitForTimeout(300);
  await search.fill("wizard");
  await expect(page).toHaveURL(/search=wizard/);
  await expect(
    page.getByRole("link", { name: /Unschooled Wizard/ }),
  ).toBeVisible();
});

test("book details preserve search state on the instant back navigation", async ({
  page,
}) => {
  await page.goto("/?search=wizard");
  const book = page.getByRole("link", { name: /Unschooled Wizard/ });

  await book.click();
  await expect(
    page.getByRole("heading", { name: "The Unschooled Wizard" }),
  ).toBeVisible();

  const back = page.getByRole("link", { name: "Back to Books" });
  await expect(back).toHaveAttribute("href", "/?search=wizard");
  await back.click();

  await expect(page).toHaveURL("/?search=wizard");
  await expect(page.getByRole("textbox", { name: "Search" })).toHaveValue(
    "wizard",
  );
  await expect(
    page.getByRole("link", { name: /Unschooled Wizard/ }),
  ).toBeVisible();
});

test("changing a filter resets pagination and clear restores the defaults", async ({
  page,
}) => {
  await page.goto("/?page=2");

  await page.getByRole("slider").nth(1).press("ArrowRight");
  await expect(page).toHaveURL(/rtg=0.5/);
  await expect(page).not.toHaveURL(/page=/);

  const clear = page.getByRole("button", { name: "Clear all filters" });
  await expect(clear).toBeVisible();
  await clear.click();

  await expect(page).toHaveURL("/");
  await expect(clear).toHaveCount(0);
});
