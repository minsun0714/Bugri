import { QuizScope, QuizStatus } from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

const make = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

beforeEach(() => localStorage.clear());

test("generation is owner-only; individual then bulk save does not duplicate candidates", async () => {
  const api = make();

  const batch = await api.request("generate", {
    sourceContent: "배운 내용\n```ts\nconst x = 1;\n```",
  });

  expect(batch.candidates.length).toBeGreaterThanOrEqual(1);
  expect(batch.candidates.length).toBeLessThanOrEqual(5);

  expect(
    await api.request("quizzes", {
      scope: QuizScope.OWN,
    }),
  ).toHaveLength(0);

  const [first] = await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "SINGLE",
    candidateId: batch.candidates[0].candidateId,
  });

  expect(first.status).toBe(QuizStatus.PENDING);

  await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "ALL",
  });

  await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "ALL",
  });

  expect(
    await make().request("quizzes", {
      scope: QuizScope.OWN,
    }),
  ).toHaveLength(batch.candidates.length);

  await expect(
    make("author").request("generationBatch", {
      batchId: batch.batchId,
    }),
  ).rejects.toMatchObject({
    status: 404,
  });
});

test("direct solving never exposes answers; wrong answers and replays count once per day", async () => {
  const api = make("author");

  const attempt = await api.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  expect(JSON.stringify(attempt)).not.toMatch(
    /"answer"|"explanation"|"sourceContent"/,
  );

  expect(attempt.result).toBeNull();

  const result = await api.request("answer", {
    attemptId: attempt.attemptId,
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: "b",
    },
  });

  expect(result.correct).toBe(false);

  expect(
    (await api.request("learningDay", {})).completed,
  ).toBe(true);

  const replay = await api.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  await api.request("answer", {
    attemptId: replay.attemptId,
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: "a",
    },
  });

  expect(
    (await api.request("learningDay", {})).completedDates,
  ).toHaveLength(1);
});
