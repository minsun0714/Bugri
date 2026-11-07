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
    summary.getByText("1개", { exact: true }),
  ).toHaveCount(1);
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
  await expect(
    summary.getByText("1개", { exact: true }),
  ).toHaveCount(1);
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
  await expect(
    summary.getByText("1개", { exact: true }),
  ).toHaveCount(1);
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

test("a returning learner restarts without losing earlier completed days", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("heading", {
      name: "타입 선언",
      exact: true,
    })
    .waitFor();
  await page.evaluate(() => {
    const key = "bugri:mock:v1:learner";
    const state = JSON.parse(localStorage.getItem(key)!);
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 3);
    const learningDate = date.toISOString().slice(0, 10);
    state.timeZone = "Asia/Seoul";
    state.days = [
      {
        learningDate,
        timeZone: "Asia/Seoul",
        completedAt: `${learningDate}T00:00:00Z`,
      },
    ];
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Google 로그인 (데모)" })
    .click();
  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await expect(
    summary.getByText("오늘부터 다시", { exact: true }),
  ).toBeVisible();
  await expect(summary.getByLabel(/학습 완료/)).toHaveCount(
    1,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("returning-mobile.png"),
  });
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(summary.getByText("1일 연속")).toBeVisible();
  await expect(
    summary.getByText("1개", { exact: true }),
  ).toHaveCount(1);
  await expect(summary.getByLabel(/학습 완료/)).toHaveCount(
    2,
  );
});

test("period tabs navigate monthly and yearly learning while preserving today's streak", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Google 로그인 (데모)" })
    .click();
  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(summary.getByText("1일 연속")).toBeVisible();
  await summary
    .getByRole("tab", { name: "월", exact: true })
    .click();
  await expect(summary.getByRole("table")).toBeVisible();
  await expect(
    summary.getByText("총 1개", { exact: true }),
  ).toBeVisible();
  await summary
    .getByRole("button", { name: "이전 기간" })
    .click();
  await expect(
    summary.getByText("총 0개", { exact: true }),
  ).toBeVisible();
  await expect(summary.getByText("1일 연속")).toBeVisible();
  await summary
    .getByRole("button", { name: "현재 기간" })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("period-month-mobile.png"),
    fullPage: true,
  });
  await summary
    .getByRole("tab", { name: "년", exact: true })
    .click();
  await expect(
    summary.getByText("총 1개", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("period-year-mobile.png"),
    fullPage: true,
  });
  await summary
    .getByRole("button", { name: /, 1개, 월별 보기$/ })
    .click();
  await expect(
    summary.getByRole("tab", { name: "월", exact: true }),
  ).toBeFocused();
  await expect(summary.getByRole("table")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(
    summary.getByRole("tab", { name: "7일", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByText("프로토타입 안내 · 사용자 전환", {
      exact: true,
    })
    .click();
  await summary
    .getByRole("tab", { name: "월", exact: true })
    .click();
  await page
    .getByLabel("더미 사용자", { exact: true })
    .selectOption("friend");
  await expect(
    summary.getByRole("tab", { name: "7일", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    summary.getByText("총 0개", { exact: true }),
  ).toBeVisible();
});

test("learning cards keep their height across empty data and four, five and six week months", async ({
  page,
}) => {
  await page.clock.install({
    time: new Date("2026-03-01T03:00:00Z"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Google 로그인 (데모)" })
    .click();
  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await expect(
    summary.getByText("총 0개", { exact: true }),
  ).toBeVisible();
  const emptyWeek = (await summary.boundingBox())!.height;
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    summary.getByText("총 1개", { exact: true }),
  ).toBeVisible();
  expect(
    Math.abs(
      (await summary.boundingBox())!.height - emptyWeek,
    ),
  ).toBeLessThanOrEqual(1);
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await summary
      .getByRole("tab", { name: "월", exact: true })
      .click();
    await expect(
      summary.getByRole("table", {
        name: "2026년 3월 학습 달력",
      }),
    ).toBeVisible();
    const fiveWeeks = (await summary.boundingBox())!.height;
    await summary
      .getByRole("button", { name: "이전 기간" })
      .click();
    await expect(
      summary.getByRole("table", {
        name: "2026년 2월 학습 달력",
      }),
    ).toBeVisible();
    expect(
      Math.abs(
        (await summary.boundingBox())!.height - fiveWeeks,
      ),
    ).toBeLessThanOrEqual(1);
    for (let index = 0; index < 3; index++)
      await summary
        .getByRole("button", { name: "이전 기간" })
        .click();
    await expect(
      summary.getByRole("table", {
        name: "2025년 11월 학습 달력",
      }),
    ).toBeVisible();
    expect(
      Math.abs(
        (await summary.boundingBox())!.height - fiveWeeks,
      ),
    ).toBeLessThanOrEqual(1);
    await summary
      .getByRole("tab", { name: "년", exact: true })
      .click();
    const populatedYear = (await summary.boundingBox())!
      .height;
    await summary
      .getByRole("button", { name: "이전 기간" })
      .click();
    await expect(
      summary.getByText("총 0개", { exact: true }),
    ).toBeVisible();
    expect(
      Math.abs(
        (await summary.boundingBox())!.height -
          populatedYear,
      ),
    ).toBeLessThanOrEqual(1);
  }
});
