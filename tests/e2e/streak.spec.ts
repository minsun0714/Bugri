import {
  test,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";

async function openCalendar(summary: Locator) {
  const toggle = summary.getByRole("button", {
    name: "달력",
    exact: true,
  });
  await expect(toggle).toBeVisible();
  if (
    (await toggle.getAttribute("aria-expanded")) === "false"
  )
    await toggle.click();
}

async function showYear(summary: Locator) {
  await openCalendar(summary);
  const heading = summary.getByRole("button", {
    name: /월별 학습량 보기$/,
  });
  await expect(
    heading.or(
      summary.getByRole("combobox", { name: /연도 선택$/ }),
    ),
  ).toBeVisible();
  if (await heading.count()) await heading.click();
}

async function showCurrentMonth(summary: Locator) {
  await openCalendar(summary);
  const current = summary.getByRole("button", {
    name: "현재 기간",
  });
  if (await current.isEnabled()) await current.click();
}

async function seedHistory(
  page: Page,
  learningDate: string,
) {
  await page
    .getByRole("heading", {
      name: "타입 선언",
      exact: true,
    })
    .waitFor();
  await page.evaluate((date) => {
    const key = "bugri:mock:v1:learner";
    const state = JSON.parse(localStorage.getItem(key)!);
    state.timeZone = "Asia/Seoul";
    state.days.push({
      learningDate: date,
      timeZone: "Asia/Seoul",
      completedAt: `${date}T00:00:00Z`,
    });
    localStorage.setItem(key, JSON.stringify(state));
  }, learningDate);
  await page.reload();
}

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
    .getByRole("button", { name: "데모 사용자 선택" })
    .click();
  await page
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();

  await expect(
    summary.getByText("첫 학습을 시작해요"),
  ).toBeVisible();
  await openCalendar(summary);
  await expect(summary.getByRole("table")).toBeVisible();
  await expect(summary.getByRole("tab")).toHaveCount(0);
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
  await expect(
    summary.getByText("1일 연속 학습"),
  ).toBeVisible();
  await openCalendar(summary);
  await expect(
    summary.getByText("1개", { exact: true }),
  ).toHaveCount(1);
  await expect(
    summary.getByText("오늘 완료 ✓"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    summary.getByText("1일 연속 학습"),
  ).toBeVisible();
  await openCalendar(summary);
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
  await expect(page).toHaveURL(/user=learner/);
  await expect(summary).toBeVisible();

  await expect(
    summary.getByText("1일 연속 학습"),
  ).toBeVisible();
  await openCalendar(summary);
  await expect(
    summary.getByText("1개", { exact: true }),
  ).toHaveCount(1);

  await page
    .getByRole("button", {
      name: "데모 사용자 선택",
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "데모 사용자 선택",
  });
  await dialog
    .getByRole("combobox", { name: "더미 사용자" })
    .click();
  await dialog
    .getByRole("option", { name: "친구", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(
    summary.getByText("첫 학습을 시작해요"),
  ).toBeVisible();
  await expect(
    summary.getByText("첫 학습을 시작해요"),
  ).toBeVisible();
});

test("a returning learner restarts without losing earlier completed days", async ({
  page,
}, testInfo) => {
  await page.clock.install({
    time: new Date("2026-03-15T03:00:00Z"),
  });
  await page.goto("/?user=learner");
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

  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await expect(
    summary.getByText("다시 시작해요", { exact: true }),
  ).toBeVisible();
  await openCalendar(summary);
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
  await expect(
    summary.getByText("1일 연속 학습"),
  ).toBeVisible();
  await openCalendar(summary);
  await expect(
    summary.getByText("1개", { exact: true }),
  ).toHaveCount(1);
  await openCalendar(summary);
  await expect(summary.getByLabel(/학습 완료/)).toHaveCount(
    2,
  );
});

test("date heading navigates monthly and yearly learning while preserving today's streak", async ({
  page,
}, testInfo) => {
  await page.goto("/?user=learner");
  await seedHistory(page, "2024-02-29");

  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    summary.getByText("1일 연속 학습"),
  ).toBeVisible();
  await showCurrentMonth(summary);
  await openCalendar(summary);
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
  await expect(
    summary.getByText("1일 연속 학습"),
  ).toBeVisible();
  await summary
    .getByRole("button", { name: "현재 기간" })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("period-month-mobile.png"),
    fullPage: true,
  });
  await showYear(summary);
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
    summary.getByRole("button", {
      name: /월별 학습량 보기$/,
    }),
  ).toBeFocused();
  await openCalendar(summary);
  await expect(summary.getByRole("table")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(
    summary.getByRole("combobox", { name: /연도 선택$/ }),
  ).toBeVisible();
  await summary
    .getByRole("combobox", { name: /연도 선택$/ })
    .click();
  await summary
    .getByRole("option", { name: "2024년" })
    .click();
  await expect(
    summary.getByRole("combobox", {
      name: "2024년, 연도 선택",
    }),
  ).toBeFocused();
  await summary
    .getByRole("button", {
      name: "2024년 2월, 0개, 월별 보기",
    })
    .click();
  await expect(
    summary.getByRole("table", {
      name: "2024년 2월 학습 달력",
    }),
  ).toBeVisible();
  await expect(
    summary.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  await showCurrentMonth(summary);

  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  await showYear(summary);
  await summary
    .getByRole("combobox", { name: /연도 선택$/ })
    .click();
  await page
    .getByRole("button", {
      name: "데모 사용자 선택",
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "데모 사용자 선택",
  });
  await dialog
    .getByRole("combobox", { name: "더미 사용자" })
    .click();
  await dialog
    .getByRole("option", { name: "친구", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(
    summary.getByText("첫 학습을 시작해요"),
  ).toBeVisible();
  await openCalendar(summary);
  await expect(
    summary.getByRole("button", {
      name: /월별 학습량 보기$/,
    }),
  ).toBeVisible();
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
  await page.goto("/?user=learner");
  await seedHistory(page, "2024-02-29");

  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await openCalendar(summary);
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
    await showCurrentMonth(summary);
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
    await showCurrentMonth(summary);
    await showYear(summary);
    const populatedYear = (await summary.boundingBox())!
      .height;
    const months = summary.getByRole("button", {
      name: /^2026년 \d+월,/,
    });
    await expect(months).toHaveCount(12);
    const first = (await months.nth(0).boundingBox())!;
    const second = (await months.nth(1).boundingBox())!;
    const third = (await months.nth(2).boundingBox())!;
    expect(
      Math.abs(first.y - second.y),
    ).toBeLessThanOrEqual(1);
    expect(second.x).toBeGreaterThan(first.x);
    expect(Math.abs(first.x - third.x)).toBeLessThanOrEqual(
      1,
    );
    expect(third.y).toBeGreaterThan(first.y);

    expect(
      Math.abs(populatedYear - fiveWeeks),
    ).toBeLessThanOrEqual(1);
    await summary
      .getByRole("combobox", { name: /연도 선택$/ })
      .click();
    expect(
      Math.abs(
        (await summary.boundingBox())!.height - fiveWeeks,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      summary.getByRole("combobox", {
        name: "2026년, 연도 선택",
      }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(
      summary.getByRole("combobox", { name: /연도 선택$/ }),
    ).toBeFocused();

    await showCurrentMonth(summary);
    expect(
      Math.abs(
        (await summary.boundingBox())!.height - fiveWeeks,
      ),
    ).toBeLessThanOrEqual(1);
    await showYear(summary);
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

test("history navigation stops at the first learning month and resets for an empty user", async ({
  page,
}) => {
  await page.clock.install({
    time: new Date("2026-06-15T03:00:00Z"),
  });
  await page.goto("/?user=learner");
  await seedHistory(page, "2025-11-15");

  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  await showYear(summary);
  await summary
    .getByRole("button", { name: "이전 기간" })
    .click();
  await expect(
    summary.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  await expect(
    summary.getByRole("button", {
      name: "2025년 10월, 0개",
      exact: true,
    }),
  ).toBeDisabled();
  await summary
    .getByRole("button", {
      name: "2025년 11월, 0개, 월별 보기",
    })
    .click();
  await expect(
    summary.getByRole("table", {
      name: "2025년 11월 학습 달력",
    }),
  ).toBeVisible();
  await expect(
    summary.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  await summary
    .getByRole("button", { name: "다음 기간" })
    .click();
  await expect(
    summary.getByRole("button", { name: "이전 기간" }),
  ).toBeEnabled();

  await page
    .getByRole("button", {
      name: "데모 사용자 선택",
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "데모 사용자 선택",
  });
  await dialog
    .getByRole("combobox", { name: "더미 사용자" })
    .click();
  await dialog
    .getByRole("option", { name: "친구", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(
    summary.getByText("첫 학습을 시작해요"),
  ).toBeVisible();
  await openCalendar(summary);
  await expect(
    summary.getByRole("table", {
      name: "2026년 6월 학습 달력",
    }),
  ).toBeVisible();
  await expect(
    summary.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  await showYear(summary);
  await expect(
    summary.getByRole("button", { name: "이전 기간" }),
  ).toBeDisabled();
  await expect(
    summary.getByRole("button", {
      name: "2026년 5월, 0개",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    summary.getByRole("button", {
      name: "2026년 6월, 0개, 월별 보기",
    }),
  ).toBeEnabled();
});

test("single-year menu stays compact while the two-column month list remains visible", async ({
  page,
}) => {
  await page.clock.install({
    time: new Date("2026-11-07T03:00:00Z"),
  });
  await page.goto("/?user=learner");

  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await showYear(summary);
    const height = (await summary.boundingBox())!.height;
    await summary
      .getByRole("combobox", { name: "2026년, 연도 선택" })
      .click();
    const menu = summary.getByRole("listbox");
    await expect(menu.getByRole("option")).toHaveCount(1);
    expect((await menu.boundingBox())!.height).toBeLessThan(
      100,
    );
    await expect(
      summary.getByRole("button", {
        name: "2026년 11월, 0개, 월별 보기",
      }),
    ).toBeVisible();
    await expect(
      summary.getByText("총 0개", { exact: true }),
    ).toBeVisible();
    expect(
      Math.abs(
        (await summary.boundingBox())!.height - height,
      ),
    ).toBeLessThanOrEqual(1);
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(
      summary.getByRole("combobox"),
    ).toBeFocused();
  }
});

test("compact home exposes the question and only opens the calendar on request", async ({
  page,
}, testInfo) => {
  await page.goto("/?user=learner");
  const summary = page.getByRole("region", {
    name: "연속 학습",
    exact: true,
  });
  const toggle = summary.getByRole("button", {
    name: "달력",
    exact: true,
  });
  await expect(toggle).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({
      width,
      height: width === 320 ? 568 : 844,
    });
    await expect(
      page.getByText("TypeScript에서 숫자 타입은?", {
        exact: true,
      }),
    ).toBeInViewport();
    await page.screenshot({
      path: testInfo.outputPath(`compact-${width}.png`),
    });
  }
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    summary.getByText("오늘 완료 ✓"),
  ).toBeVisible();
  await expect(toggle).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(summary.getByRole("table")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("compact-expanded.png"),
    fullPage: true,
  });
  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.screenshot({
    path: testInfo.outputPath("compact-completed.png"),
  });
});
