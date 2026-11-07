import { expect, test } from "@playwright/test";

for (const width of [1280, 375]) {
  test(`missing URL and route crash recover at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(
      "/does-not-exist?user=author&attempt=old",
    );
    await expect(
      page.getByRole("heading", {
        name: "페이지를 찾을 수 없습니다",
      }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`404-${width}.png`),
    });
    await page
      .getByRole("link", { name: "홈으로 이동" })
      .click();
    await expect(page).toHaveURL(/\/\?user=author$/);
    await page.goto("/ui-preview/errors");
    await page
      .getByRole("button", { name: "렌더링 오류 재현" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "화면을 불러오지 못했습니다",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Error boundary preview"),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`error-${width}.png`),
    });
    await page
      .getByRole("button", { name: "다시 시도" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: "오류 복구 미리보기",
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
}
