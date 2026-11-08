import { test, expect } from "@playwright/test";

test("product header and breadcrumbs preserve identity and expose mounted routes", async ({
  page,
}, testInfo) => {
  await page.goto("/quizzes/authoring?user=friend");
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(
    page
      .getByRole("banner")
      .getByRole("link", { name: "홈", exact: true }),
  ).toHaveCount(0);
  const nav = page.getByRole("navigation", {
    name: "주 메뉴",
    exact: true,
  });
  await expect(
    nav.getByRole("link", { name: "퀴즈 만들기" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    page.getByText("Design workspace · 0.1"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "내 메뉴", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "내 메뉴" })
    .getByRole("link", { name: "내 퀴즈" })
    .click();
  await expect(page).toHaveURL(
    /\/quizzes\/authoring\/manage\?user=friend$/,
  );
  await expect(
    page
      .getByRole("navigation", { name: "현재 위치" })
      .getByText("내 퀴즈"),
  ).toHaveAttribute("aria-current", "page");
  await page.reload();
  await expect(
    page
      .getByRole("navigation", { name: "현재 위치" })
      .getByText("내 퀴즈"),
  ).toHaveAttribute("aria-current", "page");
  await page.screenshot({
    path: testInfo.outputPath("navigation-desktop.png"),
  });
  await page
    .getByRole("navigation", { name: "현재 위치" })
    .getByRole("link", { name: "홈", exact: true })
    .click();
  await expect(page).toHaveURL(/\/\?user=friend$/);
  await expect(
    page.getByRole("navigation", { name: "현재 위치" }),
  ).toHaveCount(0);
  await page.goBack();
  await expect(
    page
      .getByRole("navigation", { name: "현재 위치" })
      .getByText("내 퀴즈"),
  ).toHaveAttribute("aria-current", "page");
});

test("mobile menu supports keyboard, dismissals, resize and navigation", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/my/learning?user=author");
  const trigger = page.getByRole("button", {
    name: "메뉴 열기",
  });
  const mobile = page.getByRole("navigation", {
    name: "모바일 주 메뉴",
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(mobile).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    mobile.getByRole("link", { name: "퀴즈 만들기" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(mobile).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole("banner")
    .click({ position: { x: 2, y: 2 } });
  await expect(mobile).toHaveCount(0);
  await trigger.click();
  await page.screenshot({
    path: testInfo.outputPath("navigation-mobile.png"),
  });
  await mobile
    .getByRole("link", { name: "퀴즈 만들기" })
    .click();
  await expect(page).toHaveURL(
    /quizzes\/authoring\?user=author$/,
  );
  await expect(mobile).toHaveCount(0);
  await trigger.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(
    page.getByRole("button", {
      name: "메뉴 닫기",
      includeHidden: true,
    }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 700 });
  await expect(mobile).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("social demo toggles guest and member navigation without OAuth", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", {
    name: "주 메뉴",
    exact: true,
  });
  await expect(
    nav.getByRole("link", { name: "내 퀴즈" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("header-guest.png"),
  });
  await page
    .getByRole("button", { name: "데모 사용자 선택" })
    .click();
  await page
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(
    page.getByRole("button", {
      name: "내 메뉴",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "내 메뉴", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "내 메뉴" })
    .getByRole("link", { name: "내 퀴즈" })
    .click();
  await expect(page).toHaveURL(/manage\?user=learner$/);
  await expect(
    page.getByRole("heading", { name: /내 퀴즈/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "내 메뉴", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "데모 나가기" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "데모 나가기" })
    .click();
  await expect(
    nav.getByRole("link", { name: "내 퀴즈" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "데모 사용자 선택",
    }),
  ).toBeVisible();
});
