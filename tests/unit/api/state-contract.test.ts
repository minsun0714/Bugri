import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";
import { LearningMode, QuizStatus } from "@/api/constants";
import type { Request } from "@/api/contracts";

const create = () =>
  createApiClient(
    createMockTransport({
      userId: "author",
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

beforeEach(() => localStorage.clear());

test("constant-based requests keep stored wire values and restore existing state", async () => {
  const api = create();

  await api.request("visibility", {
    quizId: "seed-quiz-1",
    expectedVersion: 1,
    visibility: QuizStatus.PRIVATE,
  });

  await api.request("learningQuiz", {
    mode: LearningMode.REPLAY,
  });

  const saved = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  const { quizzes, selection } = saved;
  const [quiz] = quizzes;

  // Literal expectations deliberately guard the pre-existing API/storage contract.
  expect(quiz.status).toBe("PRIVATE");
  expect(selection.mode).toBe("REPLAY");

  expect(
    (
      await create().request("reviewQuiz", {
        quizId: "seed-quiz-1",
      })
    ).status,
  ).toBe("PRIVATE");
});

test("runtime validation still rejects unknown modes and PENDING visibility", async () => {
  const api = create();

  // Simulate untrusted JSON crossing the typed client boundary.
  await expect(
    api.request("visibility", {
      quizId: "seed-quiz-1",
      expectedVersion: 1,
      visibility: QuizStatus.PENDING,
    } as unknown as Request<"visibility">),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  await expect(
    api.request("learningQuiz", {
      mode: "UNKNOWN",
    } as unknown as Request<"learningQuiz">),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  expect(
    (
      await api.request("reviewQuiz", {
        quizId: "seed-quiz-1",
      })
    ).status,
  ).toBe(QuizStatus.PUBLIC);
});
