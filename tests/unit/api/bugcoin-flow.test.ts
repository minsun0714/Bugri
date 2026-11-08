import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";
import { QuizStatus } from "@/api/constants";

let now = new Date("2026-02-01T00:00:00Z");

const api = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      now: () => now,
      detectTimeZone: () => "UTC",
    }),
  );

async function solve(correct = true, userId = "learner") {
  const client = api(userId);

  const { attemptId } = await client.request(
    "startAttempt",
    { quizId: "seed-quiz-1", context: "DIRECT" },
  );

  return client.request("answer", {
    attemptId,
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: correct ? "a" : "b",
    },
  });
}

beforeEach(() => {
  localStorage.clear();
  now = new Date("2026-02-01T00:00:00Z");
});

test("submission, wallet restoration, creator credit and replay are idempotent", async () => {
  const result = await solve();

  expect(result.rewardBugCent).toBe(200);

  expect((await api().request("wallet", {})).balance).toBe(
    102,
  );

  expect(
    (await api("author").request("wallet", {})).balance,
  ).toBe(100.4);

  await api().request("answer", {
    attemptId: result.attemptId,
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
  });

  await solve();

  expect((await api().request("wallet", {})).balance).toBe(
    102,
  );

  expect(
    (await api("author").request("wallet", {})).balance,
  ).toBe(100.4);
});

test("wrong answer history survives date and revision changes", async () => {
  await solve(false);

  expect((await api().request("wallet", {})).balance).toBe(
    100,
  );

  const owner = api("author");

  const original = await owner.request("reviewQuiz", {
    quizId: "seed-quiz-1",
  });

  const { active } = original;

  const edited = await owner.request("updatePending", {
    quizId: original.quizId,
    expectedVersion: original.version,
    action: "EDIT",
    sourceContent: "수정 학습 내용",
    content: {
      title: active!.title,
      question: active!.question,
      answer: active!.answer,
      explanation: "수정 해설",
      hashtagIds: active!.hashtagIds,
    },
  });

  const reviewed = await owner.request("updatePending", {
    quizId: original.quizId,
    expectedVersion: edited.version,
    action: "MARK_REVIEWED",
  });

  const approved = await owner.request("approve", {
    quizId: original.quizId,
    expectedVersion: reviewed.version,
    visibility: QuizStatus.PUBLIC,
  });

  expect(approved.active!.revisionId).not.toBe(
    active!.revisionId,
  );

  now = new Date("2026-02-02T00:00:00Z");
  expect((await solve()).rewardBugCent).toBe(150);

  expect((await api().request("wallet", {})).balance).toBe(
    101.5,
  );
});

test("private owner receives review and daily bonus at exactly creation + 168h", async () => {
  const state = initialState("author");

  const quiz = state.quizzes.find(
    ({ quizId }) => quizId === "seed-quiz-1",
  )!;

  quiz.status = QuizStatus.PRIVATE;
  quiz.createdAt = "2026-01-25T00:00:00Z";

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  now = new Date("2026-01-31T23:59:59.999Z");

  expect((await solve(true, "author")).rewardBugCent).toBe(
    0,
  );

  now = new Date("2026-02-01T00:00:00Z");

  expect((await solve(true, "author")).rewardBugCent).toBe(
    120,
  );

  expect(
    (await api("author").request("wallet", {})).balance,
  ).toBe(101.2);
});

test("storage failure does not commit either solver or creator rewards", async () => {
  const { attemptId } = await api().request(
    "startAttempt",
    { quizId: "seed-quiz-1", context: "DIRECT" },
  );

  const broken = createApiClient(
    createMockTransport({
      userId: "learner",
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: () => {
          throw new Error("quota");
        },
      },
      now: () => now,
    }),
  );

  await expect(
    broken.request("answer", {
      attemptId,
      answer: { type: "SINGLE_CHOICE", choiceId: "a" },
    }),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_UNAVAILABLE" },
  });

  expect(
    (await api("author").request("wallet", {})).balance,
  ).toBe(100);

  expect((await api().request("wallet", {})).balance).toBe(
    100,
  );
});

test.each([null, {}, "invalid"])(
  "corrupt creation timestamp %j is rejected without overwriting",
  async (createdAt) => {
    const state = initialState("author");

    const raw = JSON.stringify({
      ...state,
      quizzes: state.quizzes.map((quiz) => ({
        ...quiz,
        createdAt,
      })),
    });

    localStorage.setItem(storageKey("author"), raw);

    await expect(
      api("author").request("wallet", {}),
    ).rejects.toMatchObject({
      detail: { code: "STORAGE_CORRUPT" },
    });

    expect(localStorage.getItem(storageKey("author"))).toBe(
      raw,
    );
  },
);

test("reward balance remains exact after repeated reviews and purchase", async () => {
  await solve();

  for (let week = 1; week <= 10; week++) {
    now = new Date(
      Date.parse("2026-02-01T00:00:00Z") +
        week * 168 * 3600000,
    );

    await solve();
  }

  await api().request("purchase", {
    productId: "keyboard-1",
    requestKey: "reward-purchase",
  });

  expect((await api().request("wallet", {})).balance).toBe(
    84,
  );
});

test("deletion preserves committed solver and creator rewards", async () => {
  await solve();

  await api("author").request("deleteQuiz", {
    quizId: "seed-quiz-1",
  });

  expect((await api().request("wallet", {})).balance).toBe(
    102,
  );

  expect(
    (await api("author").request("wallet", {})).balance,
  ).toBe(100.4);
});

test("zero reward records wrong-answer reason and preserves it after timezone/date changes", async () => {
  const result = await solve(false);

  expect(result.rewardOutcome).toMatchObject({
    reasonCodes: ["INCORRECT"],
    learningDate: "2026-02-01",
    timeZone: "UTC",
  });

  now = new Date("2026-03-01T00:00:00Z");

  await api().request("updateTimezone", {
    timeZone: "Asia/Seoul",
  });

  expect(
    await api().request("attempt", {
      attemptId: result.attemptId,
    }),
  ).toEqual(result);

  expect(
    await api().request("answer", {
      attemptId: result.attemptId,
      answer: { type: "SINGLE_CHOICE", choiceId: "b" },
    }),
  ).toEqual(result);
});

test("zero correct replay explains both review cooldown and already paid daily bonus", async () => {
  await solve();

  const result = await solve();

  expect(result.rewardBugCent).toBe(0);

  expect(result.rewardOutcome).toEqual({
    reasonCodes: ["REVIEW_WAIT", "DAILY_ALREADY_PAID"],
    eligibleAt: "2026-02-08T00:00:00.000Z",
    learningDate: "2026-02-01",
    timeZone: "UTC",
  });
});

test.each(["2026-02-01T00:00:00Z", undefined])(
  "owner eligibility reason for creation %s",
  async (createdAt) => {
    const state = initialState("author");

    const quiz = state.quizzes.find(
      ({ quizId }) => quizId === "seed-quiz-1",
    )!;

    quiz.createdAt = createdAt;

    localStorage.setItem(
      storageKey("author"),
      JSON.stringify(state),
    );

    const result = await solve(true, "author");

    expect(result.rewardOutcome?.reasonCodes).toEqual([
      createdAt ? "OWNER_WAIT" : "CREATION_UNKNOWN",
    ]);
  },
);

test("legacy zero attempts have no invented explanation", async () => {
  const result = await solve(false);

  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  delete state.attempts.find(
    (a: { attemptId: string }) =>
      a.attemptId === result.attemptId,
  ).rewardOutcome;

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );

  expect(
    (
      await api().request("attempt", {
        attemptId: result.attemptId,
      })
    ).rewardOutcome,
  ).toBeUndefined();
});

test("legacy correct history explains missing initial award and paid daily bonus", async () => {
  await solve();

  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  state.rewards = state.rewards.filter(
    (entry: { reason: string }) =>
      entry.reason !== "FIRST_CORRECT",
  );

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );

  expect(
    (await solve()).rewardOutcome?.reasonCodes,
  ).toEqual(["LEGACY_CORRECT", "DAILY_ALREADY_PAID"]);
});

test.each(["UNKNOWN", null])(
  "corrupt reason %j is rejected without replacing stored data",
  async (reason) => {
    await solve(false);

    const state = JSON.parse(
      localStorage.getItem(storageKey("learner"))!,
    );

    state.attempts.at(-1).rewardOutcome.reasonCodes = [
      reason,
    ];

    const raw = JSON.stringify(state);

    localStorage.setItem(storageKey("learner"), raw);

    await expect(
      api().request("wallet", {}),
    ).rejects.toMatchObject({
      detail: { code: "STORAGE_CORRUPT" },
    });

    expect(
      localStorage.getItem(storageKey("learner")),
    ).toBe(raw);
  },
);

test("waiting reason requires a valid saved eligibility timestamp", async () => {
  await solve();
  await solve();

  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  delete state.attempts.at(-1).rewardOutcome.eligibleAt;

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );

  await expect(
    api().request("wallet", {}),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_CORRUPT" },
  });
});
