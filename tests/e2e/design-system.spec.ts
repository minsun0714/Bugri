import { test, expect } from "@playwright/test";

test("showcase interactions, modal keyboard behavior and mobile layout", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "컴포넌트",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await page
    .getByRole("navigation", { name: "컴포넌트 섹션" })
    .getByRole("link", { name: "03 입력과 폼" })
    .click();
  await expect(page).toHaveURL(/#inputs$/);
  await page
    .getByRole("link", { name: "Bugri 홈", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("desktop.png"),
    fullPage: true,
  });
  await page
    .getByLabel("학습 내용")
    .fill("오늘 배운 React");
  await expect(page.getByText("11 / 10,000")).toBeVisible();
  const trigger = page.getByRole("button", {
    name: "모달 열기",
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page
    .getByRole("button", { name: "토스트 보기" })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "변경 사항을 저장했어요" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("navigation", { name: "컴포넌트 섹션" }),
  ).toBeHidden();
  await page
    .getByRole("button", { name: "메뉴 열기" })
    .click();
  await expect(
    page.getByRole("navigation", {
      name: "모바일 컴포넌트 섹션",
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "메뉴 열기" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "메뉴 열기" })
    .click();
  await page
    .getByRole("navigation", {
      name: "모바일 컴포넌트 섹션",
    })
    .getByRole("link", { name: /피드백과 상태/ })
    .click();
  await expect(
    page.getByRole("navigation", {
      name: "모바일 컴포넌트 섹션",
    }),
  ).toHaveCount(0);
  await expect(page).toHaveURL(/#feedback$/);
  await expect(page.locator("#feedback")).toBeInViewport();
  await page.screenshot({
    path: testInfo.outputPath("mobile.png"),
    fullPage: true,
  });
  const footer = page.getByRole("contentinfo", {
    name: "사이트 정보",
  });
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await footer
    .getByRole("link", { name: "입력과 폼", exact: true })
    .click();
  await expect(page).toHaveURL(/#inputs$/);
  await footer
    .getByRole("link", {
      name: "페이지 맨 위로",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/#top$/);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        window.innerWidth,
    ),
  ).toBe(true);
});
