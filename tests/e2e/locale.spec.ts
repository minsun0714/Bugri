import { test, expect } from "@playwright/test";

test("browser language, explicit choice, persistence, and untouched quiz content", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    locale: "en-US",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    "en",
  );
  await expect(
    page.getByRole("heading", { name: "Today's quiz" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Submit answer" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Quiz rating" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Like", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Dislike",
      exact: true,
    }),
  ).toBeVisible();
  const question = await page.locator("main").innerText();
  expect(question).toMatch(/[가-힣]/);
  await page
    .getByRole("combobox", { name: "Language / 언어" })
    .click();
  await page
    .getByRole("option", { name: "한국어", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "오늘의 퀴즈" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    "ko",
  );
  await context.close();
});

test("language switching preserves author input, path and editor tab", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring?user=author");
  const input = page.getByRole("textbox").first();
  const content =
    "中文学习内容 — 한국어 English\n```js\nconst x = 1;\n```";
  await input.fill(content);
  const before = page.url();
  await page
    .getByRole("combobox", { name: "Language / 언어" })
    .click();
  await page
    .getByRole("option", { name: "English", exact: true })
    .click();
  await expect(input).toHaveValue(content);
  expect(page.url()).toBe(before);
  await expect(
    page.getByRole("button", {
      name: "Create quiz",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Language / 언어" })
    .click();
  await page
    .getByRole("option", { name: "한국어", exact: true })
    .click();
  await expect(input).toHaveValue(content);
});

test("mobile menu offers keyboard-operable language selection without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "메뉴 열기", exact: true })
    .click();
  const picker = page.getByRole("combobox", {
    name: "Language / 언어",
  });
  await picker.focus();
  await picker.press("Enter");
  await picker.press("ArrowDown");
  await picker.press("Enter");
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    "en",
  );
  await expect(picker).toBeFocused();
  await expect(
    page.getByRole("navigation", {
      name: "Mobile main navigation",
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        window.innerWidth,
    ),
  ).toBe(true);
});

test("blocked storage still allows switching language", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Language / 언어" })
    .click();
  await page
    .getByRole("option", { name: "English", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "lang",
    "en",
  );
  await expect(
    page.getByRole("heading", { name: "Today's quiz" }),
  ).toBeVisible();
});
