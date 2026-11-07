import { createApiClient } from "@/api/client";
import { QuizScope } from "@/api/constants";
import { createMockTransport } from "@/mocks/adapter";

const make = (userId = "learner") =>
  createApiClient(createMockTransport({ userId }));

beforeEach(() => localStorage.clear());

test("refines an unsaved candidate using its source and current content, preserving other candidates and history", async () => {
  const api = make();

  const batch = await api.request("generate", {
    sourceContent: "학습 내용",
  });

  const {
    candidates: [candidate, ...others],
  } = batch;

  const result = await api.request("refineCandidate", {
    batchId: batch.batchId,
    candidateId: candidate.candidateId,
    prompt: "예시 추가",
  });

  const {
    candidates: [refined, ...rest],
  } = result;

  expect(refined.content.question.prompt).toContain(
    "예시 추가",
  );

  expect(refined.savedQuizId).toBeNull();

  expect(refined.history).toEqual([
    { prompt: "예시 추가", content: refined.content },
  ]);

  expect(rest).toEqual(others);

  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(0);

  expect(
    await make().request("generationBatch", {
      batchId: batch.batchId,
    }),
  ).toEqual(result);

  await expect(
    api.request("refineCandidate", {
      batchId: batch.batchId,
      candidateId: candidate.candidateId,
      prompt: "오래된 요청",
    }),
  ).rejects.toMatchObject({
    detail: { code: "VERSION_CONFLICT" },
  });
});

test("rejects saved candidates and other users; failed generation preserves original candidates", async () => {
  const api = make();

  const batch = await api.request("generate", {
    sourceContent: "학습 내용",
  });

  const {
    candidates: [first, second],
  } = batch;

  await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "SINGLE",
    candidateId: first.candidateId,
  });

  await expect(
    api.request("refineCandidate", {
      batchId: batch.batchId,
      candidateId: first.candidateId,
      prompt: "수정",
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  await expect(
    make("friend").request("refineCandidate", {
      batchId: batch.batchId,
      candidateId: second.candidateId,
      prompt: "수정",
    }),
  ).rejects.toMatchObject({
    detail: { code: "NOT_FOUND" },
  });

  const broken = createApiClient(
    createMockTransport({
      userId: "learner",
      generate: () => {
        throw new Error("timeout");
      },
    }),
  );

  await expect(
    broken.request("refineCandidate", {
      batchId: batch.batchId,
      candidateId: second.candidateId,
      prompt: "유지할 요청",
    }),
  ).rejects.toMatchObject({
    detail: { code: "GENERATION_FAILED" },
  });

  const restored = await api.request("generationBatch", {
    batchId: batch.batchId,
  });

  expect(restored.candidates[1]).toEqual(second);
});

test("deletes a candidate and soft-deletes its saved quiz", async () => {
  const api = make();

  const batch = await api.request("generate", {
    sourceContent: "삭제할 학습 내용",
  });

  const {
    candidates: [candidate],
  } = batch;

  await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "SINGLE",
    candidateId: candidate.candidateId,
  });

  const result = await api.request("deleteCandidate", {
    batchId: batch.batchId,
    candidateId: candidate.candidateId,
  });

  expect(result.candidates).toHaveLength(3);

  expect(
    result.candidates.some(
      ({ candidateId }) =>
        candidateId === candidate.candidateId,
    ),
  ).toBe(false);

  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(0);

  for (const { candidateId } of result.candidates) {
    await api.request("deleteCandidate", {
      batchId: batch.batchId,
      candidateId,
    });
  }

  const restored = await make().request("generationBatch", {
    batchId: batch.batchId,
  });

  expect(restored.candidates).toHaveLength(0);

  await expect(
    api.request("deleteCandidate", {
      batchId: batch.batchId,
      candidateId: candidate.candidateId,
    }),
  ).rejects.toMatchObject({
    detail: { code: "VERSION_CONFLICT" },
  });

  await expect(
    make("friend").request("deleteCandidate", {
      batchId: batch.batchId,
      candidateId: batch.candidates[1].candidateId,
    }),
  ).rejects.toMatchObject({
    detail: { code: "NOT_FOUND" },
  });
});
