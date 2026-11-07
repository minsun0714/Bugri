import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";
import { QuizStatus } from "@/api/constants";

beforeEach(() => localStorage.clear());

function guest() {
  return createApiClient(
    createMockTransport({
      userId: "guest",
      storage: localStorage,
    }),
  );
}

test("guest selection and grading never write personal state or reveal answers before submission", async () => {
  const api = guest();
  const quiz = await api.request("guestQuiz", {});

  expect(quiz).not.toBeNull();
  expect(quiz).not.toHaveProperty("answer");
  expect(quiz).not.toHaveProperty("explanation");
  expect(quiz).not.toHaveProperty("sourceContent");

  const states = ["author", "learner", "friend"].map(
    initialState,
  );

  const stored = states
    .flatMap(({ quizzes }) => quizzes)
    .find(({ quizId }) => quizId === quiz!.quizId)!;

  const result = await api.request("guestAnswer", {
    quizId: quiz!.quizId,
    revisionId: quiz!.revisionId,
    answer: stored.active!.answer,
  });

  expect(result.correct).toBe(true);
  expect(localStorage.length).toBe(0);
});

test("guest candidates exclude private/pending/deleted; submission rechecks public availability", async () => {
  const hidden = ["author", "friend", "learner"].map(
    initialState,
  );

  hidden.forEach((state) => {
    state.quizzes.forEach((quiz, index) => {
      quiz.status =
        index % 2 ? QuizStatus.PENDING : QuizStatus.PRIVATE;

      if (quiz.status === QuizStatus.PENDING) {
        quiz.pending = quiz.active;
        quiz.active = null;
      }
    });

    localStorage.setItem(
      storageKey(state.userId),
      JSON.stringify(state),
    );
  });

  expect(await guest().request("guestQuiz", {})).toBeNull();

  const fresh = initialState("author");

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(fresh),
  );

  const quiz = await guest().request("guestQuiz", {});

  fresh.quizzes.forEach((item) => {
    item.deletedAt = "2026-11-07T00:00:00Z";
  });

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(fresh),
  );

  expect(await guest().request("guestQuiz", {})).toBeNull();

  await expect(
    guest().request("guestAnswer", {
      quizId: quiz!.quizId,
      revisionId: quiz!.revisionId,
      answer: { type: "SHORT_ANSWER", text: "x" },
    }),
  ).rejects.toMatchObject({
    detail: { code: "QUIZ_UNAVAILABLE" },
  });
});
