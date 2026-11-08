import { createApiClient } from "@/api/client";
import { createHttpTransport, endpoints } from "@/api/http";
import type { Request } from "@/api/contracts";

const response = (body: unknown, status = 200) =>
  ({
    ok: status < 400,
    status,
    json: async () => body,
  }) as Response;

test("REST encodes path, removes path fields from body and uses explicit envelope", async () => {
  const fetcher = jest.fn().mockResolvedValue(
    response({
      data: {
        deleted: true,
      },
    }),
  );

  const client = createApiClient(
    createHttpTransport({
      fetch: fetcher,
    }),
  );

  await client.request("deleteQuiz", {
    quizId: "a/b",
  });

  expect(fetcher).toHaveBeenCalledWith(
    "/api/v1/quizzes/a%2Fb",
    expect.objectContaining({
      method: "DELETE",
      body: "{}",
    }),
  );

  await client.request("approve", {
    quizId: "q",
    expectedVersion: 2,
  });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/quizzes/q/approve",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        expectedVersion: 2,
      }),
    }),
  );
});

test("GET query has no body; no mock user or auth headers", async () => {
  const fetcher = jest.fn().mockResolvedValue(
    response({
      data: [],
    }),
  );

  const client = createApiClient(
    createHttpTransport({
      baseUrl: "https://api.example.test/api/v1",
      fetch: fetcher,
    }),
  );

  await client.request("attemptHistory", {
    page: 1,
  });

  expect(fetcher).toHaveBeenCalledWith(
    "https://api.example.test/api/v1/me/attempts?page=1",
    {
      method: "GET",
      signal: expect.any(AbortSignal),
      headers: {
        Accept: "application/json",
      },
    },
  );
});

test("HTTP errors preserve code and requestId, network/invalid envelopes are distinct", async () => {
  const fetcher = jest.fn().mockResolvedValue(
    response(
      {
        error: {
          code: "QUIZ_UNAVAILABLE",
          message: "Unavailable",
          requestId: "request-1",
        },
      },
      409,
    ),
  );

  const client = createApiClient(
    createHttpTransport({
      fetch: fetcher,
    }),
  );

  await expect(
    client.request("learningDay", {}),
  ).rejects.toMatchObject({
    status: 409,
    detail: {
      code: "QUIZ_UNAVAILABLE",
      requestId: "request-1",
    },
  });

  fetcher.mockRejectedValueOnce(new Error("offline"));

  await expect(
    client.request("learningDay", {}),
  ).rejects.toMatchObject({
    detail: {
      code: "NETWORK_ERROR",
    },
  });

  fetcher.mockResolvedValueOnce(
    response({
      balance: 10,
    }),
  );

  await expect(
    client.request("learningDay", {}),
  ).rejects.toMatchObject({
    detail: {
      code: "INVALID_RESPONSE",
    },
  });
});

test("all declared operations have an HTTP endpoint", () => {
  expect(Object.keys(endpoints)).toHaveLength(22);

  expect(endpoints.learningDay).toEqual({
    method: "GET",
    path: "/learning/day",
  });
});

// Compile-time examples: payloads cannot use a scalar answer.
const invalidAnswer: Request<"answer"> = {
  attemptId: "a",
  // @ts-expect-error answers are discriminated by question format
  answer: true,
};

void invalidAnswer;

test("candidate refinement uses its batch path and explicit prompt body", async () => {
  const fetcher = jest.fn().mockResolvedValue(
    response({
      data: {
        batchId: "batch/1",
        sourceContent: "내용",
        candidates: [],
      },
    }),
  );

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await client.request("refineCandidate", {
    batchId: "batch/1",
    candidateId: "candidate-1",
    prompt: "예시 추가",
  });

  expect(fetcher).toHaveBeenCalledWith(
    "/api/v1/generation-batches/batch%2F1/refine",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        candidateId: "candidate-1",
        prompt: "예시 추가",
      }),
    }),
  );
});

test("candidate deletion uses its batch path and candidate body", async () => {
  const fetcher = jest.fn().mockResolvedValue(
    response({
      data: {
        batchId: "batch/1",
        sourceContent: "내용",
        candidates: [],
      },
    }),
  );

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await client.request("deleteCandidate", {
    batchId: "batch/1",
    candidateId: "candidate-1",
  });

  expect(fetcher).toHaveBeenCalledWith(
    "/api/v1/generation-batches/batch%2F1/candidates",
    expect.objectContaining({
      method: "DELETE",
      body: JSON.stringify({
        candidateId: "candidate-1",
      }),
    }),
  );
});

test("attempt history uses a private GET endpoint and query filters", async () => {
  const fetcher = jest.fn().mockResolvedValue(
    response({
      data: {
        items: [],
        total: 0,
        page: 2,
        pageSize: 20,
      },
    }),
  );

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await client.request("attemptHistory", {
    filter: "INCORRECT",
    page: 2,
    pageSize: 20,
  });

  expect(fetcher).toHaveBeenCalledWith(
    "/api/v1/me/attempts?filter=INCORRECT&page=2&pageSize=20",
    expect.objectContaining({ method: "GET" }),
  );

  expect(fetcher.mock.calls[0][1]).not.toHaveProperty(
    "body",
  );
});
