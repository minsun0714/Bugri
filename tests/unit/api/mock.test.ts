import { QuizStatus } from "@/api/constants";
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

test("generation is owner-only; individual then bulk save does not duplicate quizzes", async () => {
  const api = make();

  const { noteId } = await api.request("createNote", {
    content: "배운 내용\n```ts\nconst x = 1;\n```",
  });

  const created = await api.request("generate", { noteId });

  expect(created.length).toBeGreaterThanOrEqual(1);
  expect(created.length).toBeLessThanOrEqual(5);

  expect(
    await api.request("noteQuizzes", {
      noteId,
      status: QuizStatus.CONFIRMED,
    }),
  ).toHaveLength(0);

  const [first] = created;

  await api.request("confirmQuiz", {
    quizId: first.quizId,
    expectedVersion: first.version,
  });

  await api.request("confirmNoteQuizzes", { noteId });
  await api.request("confirmNoteQuizzes", { noteId });

  expect(
    await make().request("noteQuizzes", {
      noteId,
      status: QuizStatus.CONFIRMED,
    }),
  ).toHaveLength(created.length);

  await expect(
    make("author").request("noteQuizzes", {
      noteId,
      status: QuizStatus.CONFIRMED,
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
