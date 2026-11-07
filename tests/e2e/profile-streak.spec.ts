import { test, expect } from "@playwright/test";
import { initialState } from "@/mocks/storage";

for (const width of [1280, 390]) {
  test(`public profile reuses the home calendar for its owner at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.setFixedTime(
      new Date("2026-11-07T12:00:00Z"),
    );
    const state = initialState("author");
    state.timeZone = "Asia/Seoul";
    state.days = ["2026-11-06", "2026-11-07"].map(
      (learningDate) => ({
        learningDate,
        timeZone: "Asia/Seoul",
        completedAt: `${learningDate}T00:00:00Z`,
      }),
    );
    const [quiz] = state.quizzes;
    state.attempts = state.days.map(
      ({ learningDate, timeZone, completedAt }) => ({
        attemptId: `profile-${learningDate}`,
        quizId: quiz.quizId,
        revision: quiz.active!,
        ownerUserId: "author",
        submittedAnswer: {
          type: "SINGLE_CHOICE",
          choiceId: "a",
        },
        correct: false,
        completedAt,
        learningDate,
        timeZone,
      }),
    );
    await page.addInitScript(
      (value) =>
        localStorage.setItem(
          "bugri:mock:v1:author",
          JSON.stringify(value),
        ),
      state,
    );
    for (const query of [
      "",
      "?user=friend",
      "?user=author",
    ]) {
      await page.goto(`/users/bugri-author${query}`);
      const activity = page.getByRole("region", {
        name: "학습 활동",
        exact: true,
      });
      await expect(
        activity.getByText("2일 연속"),
      ).toBeVisible();
      await expect(
        activity.getByText("✓ 오늘 학습 완료"),
      ).toBeVisible();
      await expect(
        activity.getByRole("table"),
      ).toBeVisible();
      await activity
        .getByRole("button", { name: /월별 학습량 보기/ })
        .click();
      await expect(
        activity.getByRole("combobox", {
          name: /연도 선택/,
        }),
      ).toBeVisible();
      await activity
        .getByRole("button", {
          name: "2026년 11월, 2개, 월별 보기",
        })
        .click();
      await expect(
        activity.getByRole("table"),
      ).toBeVisible();
      await expect(
        activity.getByRole("button", {
          name: /월별 학습량 보기/,
        }),
      ).toBeFocused();
      await expect(
        activity.getByText("총 2개"),
      ).toBeVisible();
      await expect(
        activity.getByLabel(
          "2026-11-07 오늘 학습 완료, 1개",
        ),
      ).toBeVisible();
      await activity.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath(
          `activity-${width}-${query || "guest"}.png`,
        ),
      });
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            innerWidth,
        ),
      ).toBe(true);
    }
    await page.evaluate(() => {
      const key = "bugri:mock:v1:friend";
      const state = JSON.parse(localStorage.getItem(key)!);
      state.timeZone = null;
      localStorage.setItem(key, JSON.stringify(state));
    });
    await page.goto("/users/bugri-friend?user=author");
    const activity = page.getByRole("region", {
      name: "학습 활동",
      exact: true,
    });
    await expect(activity.getByRole("alert")).toHaveCount(
      0,
    );
    await expect(activity.getByRole("table")).toBeVisible();
    await expect(
      activity.getByText("2일 연속"),
    ).toHaveCount(0);
    await expect(
      activity.getByText("총 0개"),
    ).toBeVisible();
    await activity.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(
        `activity-unset-${width}.png`,
      ),
    });
  });
}

for (const query of ["", "?user=friend"]) {
  test(`unselected demo owner activity is visible ${query || "as guest"}`, async ({
    page,
  }) => {
    await page.goto(`/users/bugri-author${query}`);
    const activity = page.getByRole("region", {
      name: "학습 활동",
      exact: true,
    });
    await expect(activity.getByRole("table")).toBeVisible();
    await expect(activity.getByRole("alert")).toHaveCount(
      0,
    );
    await expect(
      activity.getByText("총 0개"),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        localStorage.getItem("bugri:mock:v1:author"),
      ),
    ).toBeNull();
  });
}
