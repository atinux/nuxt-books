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

test("a book opens instantly after hover intent", async ({ page }) => {
  await page.goto("/");
  const book = page.getByRole("link", { name: /W\.C\. Fields/ });

  await book.hover();
  await instant(page, async () => {
    await book.click();
    await page.waitForURL((url) => url.pathname === "/5333265");
    await expect(
      page.getByRole("heading", { name: "W.C. Fields: A Life on Film" }),
    ).toBeVisible();
  });
  await expect(
    page.getByRole("link", { name: "Back to Books" }),
  ).toBeVisible();
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
