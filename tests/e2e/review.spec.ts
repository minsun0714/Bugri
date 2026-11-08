import { test, expect, type Page } from "@playwright/test";

const learnerKey = "bugri:mock:v1:learner";

/** What to pick for the learner's due quizzes: the right answer, or a wrong one. */
const choices: Record<
  string,
  { right: string[]; wrong: string[] }
> = {
  클로저: { right: ["참"], wrong: ["거짓"] },
  "제네릭 기본": {
    right: ["호출 시점에 결정되는 타입 매개변수"],
    wrong: ["any의 별칭"],
  },
  "Promise 상태": {
    right: ["pending", "fulfilled", "rejected"],
    wrong: ["running"],
  },
  CORS: { right: ["동일 출처 정책"], wrong: ["쿠키 정책"] },
};

async function solveCurrent(
  page: Page,
  title: string,
  correct: boolean,
) {
  const { right, wrong } = choices[title];

  for (const label of correct ? right : wrong)
    await page.getByLabel(label, { exact: true }).check();

  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();

  await expect(
    page.getByText(correct ? "정답입니다" : "오답입니다", {
      exact: true,
    }),
  ).toBeVisible();
}

const start = (page: Page) =>
  page
    .getByRole("button", { name: "복습 시작", exact: true })
    .click();

test("solving today's review one question at a time shows each next date and ends the day", async ({
  page,
}) => {
  await page.goto("/?user=learner");

  await expect(
    page.getByRole("heading", { name: "오늘 복습 4개" }),
  ).toBeVisible();

  await start(page);

  // A quiz answered wrong last time comes first. Answering wrong again returns it tomorrow.
  await expect(
    page.getByText("클로저", { exact: true }),
  ).toBeVisible();

  await solveCurrent(page, "클로저", false);

  await expect(
    page.getByText(/^다음 복습: 내일 \(\d{4}-\d{2}-\d{2}\)$/),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "오늘 복습 3개" }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "원래 메모 보기" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "다음 문제", exact: true })
    .click();

  await solveCurrent(page, "제네릭 기본", true);

  await expect(
    page.getByText(/^다음 복습: 14일 뒤 \(/),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "다음 문제", exact: true })
    .click();

  await solveCurrent(page, "Promise 상태", true);

  await expect(
    page.getByText(/^다음 복습: 7일 뒤 \(/),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "다음 문제", exact: true })
    .click();

  await solveCurrent(page, "CORS", true);

  await expect(
    page.getByText(/^다음 복습: 3일 뒤 \(/),
  ).toBeVisible();

  // Nothing is left, so the last button finishes the review.
  await page
    .getByRole("button", { name: "복습 마치기", exact: true })
    .click();

  await expect(
    page.getByRole("heading", { name: "오늘 복습 끝" }),
  ).toBeVisible();

  // Two quizzes were already due tomorrow, plus the one answered wrong.
  await expect(
    page.getByText("내일 복습할 퀴즈 3개"),
  ).toBeVisible();

  await expect(page).not.toHaveURL(/review=/);

  await expect(page.getByText("1일 연속 학습")).toBeVisible();
});

test("a reload restores the open question and its result", async ({
  page,
}) => {
  await page.goto("/?user=learner");
  await start(page);

  await page.getByLabel("거짓", { exact: true }).check();

  await page.reload();

  // The question comes back unanswered and without the answer.
  await expect(
    page.getByRole("button", { name: "답 제출", exact: true }),
  ).toBeDisabled();

  await expect(
    page.getByText("내부 함수는 바깥 스코프", {
      exact: false,
    }),
  ).toHaveCount(0);

  await solveCurrent(page, "클로저", true);

  const url = page.url();

  await page.reload();

  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();

  await expect(
    page.getByText(/^다음 복습: 3일 뒤 \(/),
  ).toBeVisible();

  await expect(page).toHaveURL(url);
});

test("the original note opens from the result", async ({
  page,
}) => {
  await page.goto("/?user=learner");
  await start(page);
  await solveCurrent(page, "클로저", true);

  await page
    .getByRole("link", { name: "원래 메모 보기" })
    .click();

  await expect(page).toHaveURL(
    /\/notes\/seed-note-learner-confirmed\?user=learner/,
  );
});

test("a direct solve and its retry count as study but leave the schedule alone", async ({
  page,
}) => {
  await page.goto("/solve?user=learner&quiz=seed-quiz-8");

  await solveCurrent(page, "CORS", true);

  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();

  await solveCurrent(page, "CORS", false);

  const stage = await page.evaluate((key) => {
    const { reviewSchedules } = JSON.parse(
      localStorage.getItem(key)!,
    );

    return reviewSchedules.find(
      ({ quizId }: { quizId: string }) =>
        quizId === "seed-quiz-8",
    );
  }, learnerKey);

  expect(stage).toMatchObject({
    stage: 0,
    lastCorrect: null,
  });

  await page.goto("/?user=learner");

  // Still due, but today counts as a study day.
  await expect(
    page.getByRole("heading", { name: "오늘 복습 4개" }),
  ).toBeVisible();

  await expect(page.getByText("1일 연속 학습")).toBeVisible();
});

test("a user with no quiz is pointed to the first memo", async ({
  page,
}) => {
  await page.goto("/?user=learner");

  await expect(
    page.getByRole("heading", { name: "오늘 복습 4개" }),
  ).toBeVisible();

  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key)!);

    state.quizzes = [];
    state.notes = [];
    localStorage.setItem(key, JSON.stringify(state));
  }, learnerKey);

  await page.reload();

  await expect(
    page.getByText("메모를 퀴즈로 만들면 여기서 복습해요"),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "복습 시작" }),
  ).toHaveCount(0);
});

test("a user with quizzes but none due sees what comes next", async ({
  page,
}) => {
  await page.goto("/?user=author");

  await expect(
    page.getByRole("heading", {
      name: "오늘 복습할 퀴즈가 없어요",
    }),
  ).toBeVisible();

  await expect(
    page.getByText("내일 복습할 퀴즈 1개"),
  ).toBeVisible();

  await page.goto("/?user=friend");

  await expect(
    page.getByText(/^다음 복습 \d{4}-\d{2}-\d{2} · 1개$/),
  ).toBeVisible();
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the quick note and the start of today's review share the first screen", async ({
    page,
  }) => {
    await page.goto("/?user=learner");

    await expect(
      page.getByRole("heading", { name: "빠른 메모" }),
    ).toBeInViewport();

    await expect(
      page.getByRole("button", {
        name: "복습 시작",
        exact: true,
      }),
    ).toBeInViewport();
  });
});
