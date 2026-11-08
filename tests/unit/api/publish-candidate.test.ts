import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { QuizScope, QuizStatus } from "@/api/constants";

beforeEach(() => localStorage.clear());

test("explicit candidate publication validates review acknowledgement and publishes only the selected quiz", async () => {
  const api = createApiClient(
    createMockTransport({ userId: "learner" }),
  );

  const batch = await api.request("generate", {
    sourceContent: "타입",
  });

  const {
    candidates: [candidate],
  } = batch;

  const request = {
    batchId: batch.batchId,
    candidateId: candidate.candidateId,
    reviewed: true as const,
  };

  await expect(
    api.request("publishCandidate", {
      ...request,
      reviewed: false as unknown as true,
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(0);

  const result = await api.request(
    "publishCandidate",
    request,
  );

  const {
    candidates: [published],
  } = result;

  const quiz = await api.request("reviewQuiz", {
    quizId: published.savedQuizId!,
  });

  expect(quiz.status).toBe(QuizStatus.PUBLIC);
  expect(quiz.active?.reviewed).toBe(true);
  expect(quiz.pending).toBeNull();

  expect(
    result.candidates
      .slice(1)
      .every(({ savedQuizId }) => savedQuizId === null),
  ).toBe(true);

  await api.request("publishCandidate", request);

  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(1);

  const other = createApiClient(
    createMockTransport({ userId: "friend" }),
  );

  await expect(
    other.request("publishCandidate", request),
  ).rejects.toMatchObject({
    detail: { code: "NOT_FOUND" },
  });
});
