import { expect, test } from "@playwright/test";

for (const width of [1280, 375, 320]) {
  test(`missing URL and route crash recover at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(
      "/does-not-exist?user=author&attempt=old",
    );
    await expect(
      page.getByRole("heading", {
        name: "페이지를 찾지 못했어요",
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
        name: "앗, 잠깐 문제가 생겼어요",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Error boundary preview"),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`error-${width}.png`),
    });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          window.innerWidth,
      ),
    ).toBe(true);
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

for (const width of [1280, 375]) {
  test(`query failure recovers only its own region at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/ui-preview/errors");
    const area = page.getByRole("region", {
      name: "미리보기 영역",
    });
    await expect(area.getByRole("alert")).toContainText(
      "일시적인 오류",
    );
    await expect(page.getByText("다른 영역")).toBeVisible();
    await expect(
      page.getByText("private preview detail"),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`query-${width}.png`),
    });
    await area
      .getByRole("button", { name: "다시 시도" })
      .click();
    await expect(area.getByRole("status")).toHaveText(
      "다시 불러왔습니다",
    );
    await expect(page.getByText("다른 영역")).toBeVisible();
  });
}
