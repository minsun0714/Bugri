import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`coin history preserves purchases and isolates users at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/shop?user=learner");
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "새싹 키보드",
        exact: true,
      }),
    });
    await card
      .getByRole("button", {
        name: "구매하기",
        exact: true,
      })
      .click();
    await expect(page.getByLabel("내 잔액")).toContainText(
      "70",
    );
    await page.goto("/my?user=learner");
    const region = page.getByRole("region", {
      name: "BugCoin 내역",
    });
    await expect(
      region.getByLabel("내 잔액"),
    ).toContainText("70");
    await expect(
      region.getByRole("listitem").first(),
    ).toContainText("상품 구매");
    await expect(
      region.getByRole("listitem").first(),
    ).toContainText("-30");
    await region.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`coins-${width}.png`),
      fullPage: true,
    });
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      width,
    );
    await page.reload();
    await expect(
      region.getByLabel("내 잔액"),
    ).toContainText("70");
    await expect(region.getByRole("listitem")).toHaveCount(
      2,
    );
    await page.goto("/my?user=friend");
    await expect(
      region.getByLabel("내 잔액"),
    ).toContainText("100");
    await expect(region.getByRole("listitem")).toHaveCount(
      1,
    );
  });
}

for (const width of [1280, 390]) {
  test(`coin history pagination supports keyboard at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/my?user=learner");
    await expect(page.getByLabel("내 잔액")).toBeVisible();
    await page.evaluate(() => {
      const key = "bugri:mock:v1:learner";
      const state = JSON.parse(localStorage.getItem(key)!);
      state.ledger = Array.from(
        { length: 21 },
        (_, index) => ({
          id: `pagination-${index}`,
          amount: index + 1,
          reason: "DAILY_COMPLETION",
          reference: `fixture-${index}`,
          createdAt: "2026-11-07T01:00:00Z",
        }),
      );
      localStorage.setItem(key, JSON.stringify(state));
    });
    await page.reload();
    const region = page.getByRole("region", {
      name: "BugCoin 내역",
    });
    const rows = region.getByRole("listitem");
    await expect(rows).toHaveCount(10);
    await expect(rows.first()).toContainText("+21");
    const next = region.getByRole("button", {
      name: "다음 페이지",
    });
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(rows.first()).toContainText("+11");
    await expect(region.getByRole("status")).toHaveText(
      "2 / 3 페이지",
    );
    await expect(next).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath(`pagination-${width}.png`),
      fullPage: true,
    });
    await next.click();
    await expect(rows).toHaveCount(1);
    await expect(next).toBeDisabled();
    await expect(
      region.getByLabel("내 잔액"),
    ).toContainText("231");
    await region
      .getByRole("button", { name: "이전 페이지" })
      .click();
    await expect(rows).toHaveCount(10);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);
    await page.reload();
    await expect(rows.first()).toContainText("+21");
  });
}
