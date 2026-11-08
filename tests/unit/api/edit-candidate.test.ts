import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

beforeEach(() => localStorage.clear());

test("direct edits stay candidates, reject stale and invalid edits, and feed subsequent refinement", async () => {
  const api = createApiClient(
    createMockTransport({ userId: "learner" }),
  );

  const batch = await api.request("generate", {
    sourceContent: "클로저",
  });

  const {
    candidates: [candidate],
  } = batch;

  const request = {
    batchId: batch.batchId,
    candidateId: candidate.candidateId,
    content: {
      ...candidate.content,
      title: "직접 바꾼 제목",
    },
  };

  const edited = await api.request(
    "editCandidate",
    request,
  );

  expect(edited.candidates[0].content.title).toBe(
    "직접 바꾼 제목",
  );

  expect(edited.candidates[0].savedQuizId).toBeNull();

  await expect(
    api.request("editCandidate", request),
  ).rejects.toMatchObject({
    detail: { code: "VERSION_CONFLICT" },
  });

  const {
    candidates: [current],
  } = edited;

  await expect(
    api.request("editCandidate", {
      ...request,
      candidateId: current.candidateId,
      content: { ...current.content, title: "" },
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  const refined = await api.request("refineCandidate", {
    batchId: batch.batchId,
    candidateId: current.candidateId,
    prompt: "예시 추가",
  });

  expect(refined.candidates[0].content.title).toContain(
    "직접 바꾼 제목",
  );
});
