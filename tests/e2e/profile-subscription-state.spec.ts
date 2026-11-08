import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`profile subscription state and explicit removal at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/users/bugri-author");
    await expect(
      page.getByRole("button", {
        name: "구독하기",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /데모.*구독/ }),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`guest-${width}.png`),
    });
    await page.goto("/users/bugri-author?user=friend");
    await page
      .getByRole("button", {
        name: "타입 개발자 구독하기",
        exact: true,
      })
      .click();
    const control = page.getByRole("button", {
      name: "타입 개발자 구독 중 · 관리",
      exact: true,
    });
    await expect(control).toBeVisible();
    await expect(control).toContainText("구독 중");
    await page.screenshot({
      path: testInfo.outputPath(`subscribed-${width}.png`),
    });
    await control.focus();
    await page.keyboard.press("Enter");
    const remove = page.getByRole("button", {
      name: "타입 개발자 구독 해제",
      exact: true,
    });
    await expect(remove).toBeVisible();
    await expect(control).toContainText("구독 중");
    await page.screenshot({
      path: testInfo.outputPath(`menu-${width}.png`),
    });
    await page.keyboard.press("Escape");
    await expect(remove).not.toBeVisible();
    await control.click();
    await remove.click();
    await expect(
      page.getByRole("button", {
        name: "타입 개발자 구독하기",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("status").filter({
        hasText: "타입 개발자님 구독을 취소했습니다.",
      }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", {
        name: "타입 개발자 구독하기",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(
        `unsubscribed-${width}.png`,
      ),
    });
  });
}
