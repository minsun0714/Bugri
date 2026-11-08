import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";
import { QuizStatus } from "@/api/constants";

const create = () =>
  createApiClient(
    createMockTransport({
      userId: "author",
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

beforeEach(() => localStorage.clear());

test("constant-based writes keep stored wire values and restore existing state", async () => {
  const api = create();

  await api.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  expect(QuizStatus.PENDING).toBe("PENDING");

  const saved = JSON.parse(
    localStorage.getItem(storageKey("author"))!,
  );

  const { quizzes } = saved;
  const [quiz] = quizzes;

  // Literal expectations deliberately guard the API/storage wire values.
  expect(quiz.status).toBe(QuizStatus.CONFIRMED);
  expect(quiz.status).toBe("CONFIRMED");

  expect(
    (
      await create().request("reviewQuiz", {
        quizId: "seed-quiz-1",
      })
    ).status,
  ).toBe("CONFIRMED");
});

test("runtime validation still rejects unknown attempt contexts", async () => {
  const api = create();

  // Simulate untrusted JSON crossing the typed client boundary.
  await expect(
    api.request("startAttempt", {
      quizId: "seed-quiz-1",
      context: "UNKNOWN",
    } as never),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });
});
