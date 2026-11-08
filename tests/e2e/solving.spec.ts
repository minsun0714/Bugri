import { test, expect, type Page } from "@playwright/test";
import { initialState } from "@/mocks/storage";

async function submit(page: Page, labels: string[]) {
  if (labels.length) {
    for (const label of labels)
      await page.getByLabel(label, { exact: true }).check();
  } else
    await page
      .getByLabel("답안", { exact: true })
      .fill("const");
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "축하하는 버그리",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("잘했어!", { exact: true }),
  ).toHaveCount(0);
}

test("replay creates a separate attempt and users cannot read each other's result", async ({
  page,
}) => {
  await page.goto("/solve?user=author&quiz=seed-quiz-1");
  await submit(page, ["number"]);
  const completed = page.url();
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(page).not.toHaveURL(completed);
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeDisabled();
  await page.goto(
    completed.replace("user=author", "user=friend"),
  );
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toBeVisible();
  await expect(
    page.getByText("숫자 타입은 number입니다.", {
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto(completed);
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
});

test("four formats are graded and restored after reload", async ({
  page,
}) => {
  const cases: [string, string[]][] = [
    ["seed-quiz-1", ["number"]],
    ["seed-quiz-2", ["let", "const"]],
    ["seed-quiz-3", ["참"]],
    ["seed-quiz-4", []],
  ];

  for (const [quizId, labels] of cases) {
    // seed-quiz-1/2 belong to the author, 3/4 to the friend; only authors can solve.
    const user = ["seed-quiz-1", "seed-quiz-2"].includes(
      quizId,
    )
      ? "author"
      : "friend";

    await page.goto(`/solve?user=${user}&quiz=${quizId}`);
    await expect(
      page.getByRole("button", {
        name: "답 제출",
        exact: true,
      }),
    ).toBeDisabled();
    await submit(page, labels);
    const url = page.url();
    await page.reload();
    await expect(
      page.getByText("정답입니다", { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(url);
    await expect(
      page.getByRole("button", {
        name: "다시 풀기",
        exact: true,
      }),
    ).toBeVisible();
  }

  const attempts = await page.evaluate(() =>
    ["author", "friend"].reduce(
      (total, user) =>
        total +
        JSON.parse(
          localStorage.getItem(`bugri:mock:v1:${user}`)!,
        ).attempts.length,
      0,
    ),
  );
  expect(attempts).toBeGreaterThanOrEqual(4);
});

test("deleted quiz blocks pending submission and hides completed content", async ({
  page,
}) => {
  await page.goto("/solve?user=author&quiz=seed-quiz-1");
  await submit(page, ["number"]);
  const completed = page.url();
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await page.getByLabel("number", { exact: true }).check();
  const state = JSON.parse(
    await page.evaluate(() =>
      localStorage.getItem("bugri:mock:v1:author")!,
    ),
  );
  state.quizzes[0].deletedAt = "2026-11-08T14:00:00.000Z";
  await page.evaluate(
    (value) =>
      localStorage.setItem(
        "bugri:mock:v1:author",
        JSON.stringify(value),
      ),
    state,
  );
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toContainText("더 이상 이용할 수 없습니다");
  await page.goto(completed);
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/완료 기록은 유지/),
  ).toBeVisible();
  await expect(
    page.getByText("숫자 타입은 number입니다.", {
      exact: true,
    }),
  ).toHaveCount(0);
});

test("failed save preserves input and permits retry", async ({
  page,
}) => {
  await page.goto("/solve?user=friend&quiz=seed-quiz-4");
  await page
    .getByLabel("답안", { exact: true })
    .fill("let");
  await page.evaluate(() => {
    Object.assign(window, {
      restoreStorage: Storage.prototype.setItem,
    });
    Storage.prototype.setItem = () => {
      throw new Error("full");
    };
  });
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toContainText("저장소");
  await expect(
    page.getByLabel("답안", { exact: true }),
  ).toHaveValue("let");
  await page.evaluate(() => {
    Storage.prototype.setItem = (
      window as unknown as {
        restoreStorage: typeof Storage.prototype.setItem;
      }
    ).restoreStorage;
  });
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("오답입니다", { exact: true }),
  ).toBeVisible();
});

test("owner access to a CONFIRMED quiz renders code on mobile", async ({
  page,
}) => {
  const state = initialState("author");
  state.quizzes[0].revision.question.prompt =
    "코드를 읽으세요.\n\n```ts\nconst value = 1;\n```";
  await page.addInitScript(
    (value) =>
      localStorage.setItem(
        "bugri:mock:v1:author",
        JSON.stringify(value),
      ),
    state,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solve?user=author&quiz=seed-quiz-1");
  await expect(page.locator("main pre")).toContainText(
    "const value = 1;",
  );
  await page.getByLabel("number", { exact: true }).focus();
  await page.keyboard.press("Space");
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/solve?user=learner&quiz=seed-quiz-1");
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toBeVisible();
});

test("retrying a failed direct restart stays on that quiz", async ({
  page,
}) => {
  await page.goto("/solve?user=author&quiz=seed-quiz-1");
  await submit(page, ["number"]);
  const completed = page.url();
  await page.evaluate(() => {
    Object.assign(window, {
      restoreStorage: Storage.prototype.setItem,
    });
    Storage.prototype.setItem = () => {
      throw new Error("full");
    };
  });
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toContainText("저장소");
  await page.evaluate(() => {
    Storage.prototype.setItem = (
      window as unknown as {
        restoreStorage: typeof Storage.prototype.setItem;
      }
    ).restoreStorage;
  });
  await page
    .getByRole("button", { name: "다시 시도", exact: true })
    .click();
  await expect(page).not.toHaveURL(completed);
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeDisabled();
});
