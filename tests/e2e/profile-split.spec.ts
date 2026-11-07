import { test, expect } from "@playwright/test";

test("private management leads to a public profile without personal data", async ({
  page,
}, testInfo) => {
  await page.goto("/my?user=author");
  await expect(
    page.getByRole("link", {
      name: "데스크 편집·보유 상품",
    }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByLabel("내 데스크 편집"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("img", { name: "3D 데스크 캔버스" }),
  ).toHaveCount(0);
  await page.screenshot({
    path: testInfo.outputPath("my-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("my-mobile.png"),
    fullPage: true,
  });
  await expect(
    page.getByRole("heading", {
      name: "프로필 편집",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "데스크 편집·보유 상품" })
    .click();
  await expect(page).toHaveURL(/\/my\/desk\?user=author$/);
  await expect(page.getByLabel("내 잔액")).toBeVisible();
  await page
    .getByRole("button", { name: "Google 로그인 (데모)" })
    .click();
  const profile = page.getByRole("link", {
    name: "내 공개 프로필 보기",
  });
  await expect(profile).toHaveAttribute(
    "href",
    /^\/users\//,
  );
  await profile.click();
  await expect(page).toHaveURL(
    /\/users\/[^/]+\?user=author$/,
  );
  await expect(
    page.getByRole("heading", {
      name: "프로필",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(
    page.getByRole("navigation", { name: "현재 위치" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "데스크 편집",
      exact: true,
    }),
  ).toHaveAttribute("href", "/my/desk?user=author");
  // Next.js retains the previous route hidden during client navigation.
  await expect(page.getByLabel("내 잔액")).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "프로필",
      exact: true,
    }),
  ).toBeVisible();
  for (const name of ["내 잔액", "내 데스크 편집"]) {
    await expect(page.getByLabel(name)).toHaveCount(0);
  }
  for (const name of [
    "보유 상품",
    "프로필 편집",
    "학습 기록",
    "BugCoin 내역",
    "학습 시간대 설정",
  ]) {
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toHaveCount(0);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: testInfo.outputPath("public-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
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
    path: testInfo.outputPath("public-mobile.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "공개 퀴즈 보기" })
    .click();
  await expect(page).toHaveURL(
    /\/developers\/[^/]+\/quizzes\?user=author$/,
  );
});
