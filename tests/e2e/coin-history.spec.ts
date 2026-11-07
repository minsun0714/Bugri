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
