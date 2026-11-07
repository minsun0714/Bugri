import { test, expect } from "@playwright/test";

test("home streak updates after submission, survives reload and isolates users", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await expect(summary).toHaveCount(0);
  await page
    .getByRole("button", { name: "Google 로그인 (데모)" })
    .click();
  await expect(
    summary.getByText("오늘부터 시작"),
  ).toBeVisible();
  await expect(summary.getByRole("listitem")).toHaveCount(
    7,
  );
  await page.screenshot({
    path: testInfo.outputPath("streak-empty-desktop.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("streak-empty-mobile.png"),
  });
  const help = summary.getByRole("button", {
    name: "학습일 기준 안내",
  });
  await help.focus();
  await expect(page.getByRole("tooltip")).toContainText(
    "기준",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(summary.getByText("1일 연속")).toBeVisible();
  await expect(
    summary.getByText("✓ 오늘 학습 완료"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(summary.getByText("1일 연속")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("streak-desktop.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("streak-mobile.png"),
  });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        window.innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(summary).toHaveCount(0);
  await page
    .getByRole("button", { name: "Google 로그인 (데모)" })
    .click();
  await expect(summary.getByText("1일 연속")).toBeVisible();
  await page
    .getByText("프로토타입 안내 · 사용자 전환", {
      exact: true,
    })
    .click();
  await page
    .getByLabel("더미 사용자", { exact: true })
    .selectOption("friend");
  await expect(
    summary.getByText("오늘부터 시작"),
  ).toBeVisible();
  await expect(
    summary.getByText("한 문제 풀고 첫 기록"),
  ).toBeVisible();
});
