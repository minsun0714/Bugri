import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`reward result and restored wallet at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?user=learner");
    await page
      .getByLabel("number", { exact: true })
      .check();
    await page
      .getByRole("button", { name: "답 제출", exact: true })
      .click();
    await expect(
      page.getByText("+2.00 BugCoin", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText("+2.00 BugCoin", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "내역 보기", exact: true })
      .click();
    await expect(page.getByLabel("내 잔액")).toContainText(
      "102",
    );
    await expect(
      page.getByText("최초 정답 보상", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("일일 첫 정답 보너스", {
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/coin-history?user=author");
    await expect(page.getByLabel("내 잔액")).toContainText(
      "100.4",
    );
    await expect(
      page.getByText("출제 보상", { exact: true }),
    ).toBeVisible();
  });
}
