import { test, expect } from "@playwright/test";

test("product header and breadcrumbs preserve identity and expose mounted routes", async ({
  page,
}, testInfo) => {
  await page.goto("/notes?user=friend");
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
    nav.getByRole("link", { name: "내 노트" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    nav.getByRole("link", { name: "퀴즈 만들기" }),
  ).toHaveCount(0);
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

test("mobile header keeps the same items without a hamburger and the profile menu is keyboard-operable", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/my/learning?user=author");
  const banner = page.getByRole("banner");
  await expect(
    banner.getByRole("button", { name: "메뉴 열기" }),
  ).toHaveCount(0);
  await expect(
    banner.getByRole("link", { name: "내 노트" }),
  ).toBeVisible();
  await expect(
    banner.getByRole("combobox", {
      name: "Language / 언어",
    }),
  ).toBeVisible();
  await expect(
    banner.getByRole("button", {
      name: "다크 모드로 전환",
    }),
  ).toBeVisible();
  const trigger = banner.getByRole("button", {
    name: "내 메뉴",
    exact: true,
  });
  const menu = page.getByRole("navigation", {
    name: "내 메뉴",
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("navigation-mobile.png"),
  });
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(2, 600);
  await expect(menu).toHaveCount(0);
  await banner
    .getByRole("link", { name: "내 노트" })
    .click();
  await expect(page).toHaveURL(/\/notes\?user=author$/);
  for (const width of [390, 360, 320]) {
    await page.setViewportSize({ width, height: 700 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);
  }
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
    .getByRole("main")
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
