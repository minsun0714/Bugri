import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";

const api = (userId = "author") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      now: () => new Date("2026-11-08T12:00:00Z"),
    }),
  );

beforeEach(() => localStorage.clear());

async function complete() {
  const client = api();

  const { attemptId } = await client.request(
    "startAttempt",
    {
      quizId: "seed-quiz-1",
      context: "DIRECT",
    },
  );

  return client.request("answer", {
    attemptId,
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
  });
}

test("completed attempts are separate, sorted with stable ties, filtered before pagination and isolated", async () => {
  await complete();

  const state = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  const {
    attempts: [base],
  } = state;

  delete base.rewardOutcome;

  state.attempts = Array.from(
    { length: 43 },
    (_, index) => ({
      ...base,
      attemptId: `record-${String(index).padStart(2, "0")}`,
      correct: index % 2 === 0,
      completedAt:
        index === 42
          ? "2026-11-09T12:00:00Z"
          : base.completedAt,
    }),
  );

  state.attempts.push({
    ...base,
    attemptId: "unfinished",
    completedAt: null,
    submittedAnswer: null,
    correct: null,
  });

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  const first = await api().request("attemptHistory", {
    filter: "ALL",
    page: 1,
    pageSize: 20,
  });

  expect(first.total).toBe(43);
  expect(first.items).toHaveLength(20);
  expect(first.items[0].attemptId).toBe("record-42");
  expect(first.items[1].attemptId).toBe("record-00");

  expect(JSON.stringify(first)).not.toMatch(
    /submittedAnswer|explanation|sourceContent/,
  );

  const second = await api().request("attemptHistory", {
    filter: "CORRECT",
    page: 2,
    pageSize: 20,
  });

  expect(second.total).toBe(22);

  expect(
    second.items.map(({ attemptId }) => attemptId),
  ).toEqual(["record-38", "record-40"]);

  expect(
    (
      await api().request("attemptHistory", {
        filter: "INCORRECT",
        page: 2,
        pageSize: 20,
      })
    ).items,
  ).toHaveLength(1);

  expect(
    (await api("friend").request("attemptHistory", {}))
      .total,
  ).toBe(0);

  await expect(
    api("friend").request("attempt", {
      attemptId: "record-00",
    }),
  ).rejects.toMatchObject({ status: 404 });
});

test("history and result reads never migrate or write legacy activity", async () => {
  const completed = await complete();

  const state = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  delete state.learningDemoVersion;
  state.timeZone = null;

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  const before = localStorage.getItem(storageKey("author"));

  await api().request("attemptHistory", {});

  await api().request("attempt", {
    attemptId: completed.attemptId,
  });

  expect(localStorage.getItem(storageKey("author"))).toBe(
    before,
  );
});

test("current edits do not replace saved results; hidden quizzes keep records but hide contents", async () => {
  const completed = await complete();

  const author = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  const quiz = author.quizzes.find(
    ({ quizId }: { quizId: string }) =>
      quizId === completed.quizId,
  );

  quiz.revision.title = "Changed title";
  quiz.revision.explanation = "Changed explanation";

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(author),
  );

  expect(
    (
      await api().request("attempt", {
        attemptId: completed.attemptId,
      })
    ).result,
  ).toEqual(completed.result);

  expect(
    (await api().request("attemptHistory", {})).items[0]
      .title,
  ).toBe(completed.quiz!.title);

  {
    // Only deletion hides a record's content.
    quiz.deletedAt = "2026-11-08T14:00:00Z";

    localStorage.setItem(
      storageKey("author"),
      JSON.stringify(author),
    );

    expect(
      (await api().request("attemptHistory", {})).items[0],
    ).toMatchObject({
      title: null,
      correct: true,
      attemptId: completed.attemptId,
    });

    expect(
      await api().request("attempt", {
        attemptId: completed.attemptId,
      }),
    ).toMatchObject({
      quiz: null,
      result: null,
      completedAt: completed.completedAt,
    });

    await expect(
      api().request("startAttempt", {
        quizId: completed.quizId,
        context: "DIRECT",
      }),
    ).rejects.toMatchObject({
      detail: { code: "QUIZ_UNAVAILABLE" },
    });
  }
});

test("retry creates a fresh attempt and keeps completed history", async () => {
  const completed = await complete();
  const day = await api().request("learningDay", {});

  const next = await api().request("startAttempt", {
    quizId: completed.quizId,
    context: "DIRECT",
  });

  expect(next.attemptId).not.toBe(completed.attemptId);
  expect(next.completedAt).toBeNull();

  expect(
    (await api().request("attemptHistory", {})).total,
  ).toBe(1);

  expect(
    await api().request("attempt", {
      attemptId: completed.attemptId,
    }),
  ).toEqual(completed);

  expect(await api().request("learningDay", {})).toEqual(
    day,
  );
});

test.each([
  { page: 0 },
  { pageSize: 51 },
  { filter: "unknown" },
])(
  "invalid history query %j is rejected",
  async (request) => {
    await expect(
      // @ts-expect-error Deliberately invalid filter wire value.
      api().request("attemptHistory", request),
    ).rejects.toMatchObject({
      detail: { code: "VALIDATION_ERROR" },
    });
  },
);

test("legacy missing result fields stay missing without borrowing current quiz content", async () => {
  const completed = await complete();

  const state = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  const {
    attempts: [record],
  } = state;

  delete record.revision.title;
  delete record.revision.answer;
  delete record.revision.explanation;
  record.submittedAnswer = null;

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  expect(
    (await api().request("attemptHistory", {})).items[0]
      .title,
  ).toBeNull();

  expect(
    (
      await api().request("attempt", {
        attemptId: completed.attemptId,
      })
    ).result,
  ).toEqual({
    submittedAnswer: null,
    correct: true,
    answer: null,
    explanation: null,
  });
});

test("a legacy completed attempt without an answer cannot be submitted again", async () => {
  const completed = await complete();

  const state = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  const {
    attempts: [record],
  } = state;

  record.submittedAnswer = null;

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  const before = localStorage.getItem(storageKey("author"));

  await expect(
    api().request("answer", {
      attemptId: completed.attemptId,
      answer: { type: "SINGLE_CHOICE", choiceId: "a" },
    }),
  ).rejects.toMatchObject({
    detail: { code: "ALREADY_ANSWERED" },
  });

  expect(localStorage.getItem(storageKey("author"))).toBe(
    before,
  );
});

test("records of another user's quiz keep their completion but hide content and retry", async () => {
  const completed = await complete();

  // The quiz changes hands (e.g. legacy data): the learner now holds a record of someone else's quiz.
  const state = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify({
      ...state,
      userId: "learner",
      quizzes: [],
    }),
  );

  const learner = api("learner");

  const history = await learner.request(
    "attemptHistory",
    {},
  );

  expect(history.total).toBe(1);

  expect(history.items[0]).toMatchObject({
    attemptId: completed.attemptId,
    title: null,
    correct: true,
  });

  expect(
    await learner.request("attempt", {
      attemptId: completed.attemptId,
    }),
  ).toMatchObject({ quiz: null, result: null });

  await expect(
    learner.request("startAttempt", {
      quizId: completed.quizId,
      context: "DIRECT",
    }),
  ).rejects.toMatchObject({
    status: 409,
    detail: { code: "QUIZ_UNAVAILABLE" },
  });
});
