import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`profile exposes editing and quiz navigation at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/users/bugri-author?user=author");
    await page
      .getByRole("button", { name: "Google 로그인 (데모)" })
      .click();
    const edit = page.getByRole("button", {
      name: "프로필 편집",
      exact: true,
    });
    const desk = page.getByRole("link", {
      name: "데스크 편집",
      exact: true,
    });
    await expect(edit.locator("svg")).toBeVisible();
    await expect(desk.locator("svg")).toBeVisible();
    await expect(edit).toHaveCSS("padding-right", "0px");
    await expect(desk).toHaveCSS("padding-right", "0px");
    const jump = page.getByRole("link", {
      name: /공개 퀴즈 \d+개 보기/,
    });
    await expect(jump).toBeVisible();
    await jump.click();
    await expect(
      page.getByRole("region", {
        name: "개발자의 공개 퀴즈",
      }),
    ).toBeFocused();
    await page
      .getByRole("region", { name: "개발자의 공개 퀴즈" })
      .getByRole("link")
      .last()
      .focus();
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            innerWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`polish-${width}.png`),
      fullPage: true,
    });
  });
}
