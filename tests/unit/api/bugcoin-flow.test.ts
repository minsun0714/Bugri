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
