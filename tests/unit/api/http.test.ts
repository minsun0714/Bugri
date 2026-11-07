import {
  Category,
  DiscoveryKind,
  QuizStatus,
  LearningMode,
} from "@/api/constants";
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
    visibility: QuizStatus.PUBLIC,
  });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/quizzes/q/approve",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        expectedVersion: 2,
        visibility: "PUBLIC",
      }),
    }),
  );
});

test("GET query has no body and omits All hashtag; no mock user or auth headers", async () => {
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

  await client.request("learningQuiz", {
    hashtagId: null,
    mode: LearningMode.UNSOLVED,
  });

  expect(fetcher).toHaveBeenCalledWith(
    "https://api.example.test/api/v1/learning/quiz?mode=UNSOLVED",
    {
      method: "GET",
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
    client.request("wallet", {}),
  ).rejects.toMatchObject({
    status: 409,
    detail: {
      code: "QUIZ_UNAVAILABLE",
      requestId: "request-1",
    },
  });

  fetcher.mockRejectedValueOnce(new Error("offline"));

  await expect(
    client.request("wallet", {}),
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
    client.request("wallet", {}),
  ).rejects.toMatchObject({
    detail: {
      code: "INVALID_RESPONSE",
    },
  });
});

test("all declared operations have an HTTP endpoint", () => {
  expect(Object.keys(endpoints)).toHaveLength(46);
});

// Compile-time examples: payloads cannot use a quiz as a subscription or a scalar answer.
const invalidSubscription: Request<"subscribe"> = {
  // @ts-expect-error quiz subscriptions are not a contract
  type: "QUIZ",
  quizId: "q",
};

const invalidAnswer: Request<"answer"> = {
  attemptId: "a",
  // @ts-expect-error answers are discriminated by question format
  answer: true,
};

void invalidSubscription;
void invalidAnswer;

test("desk placement sends coordinates to the typed HTTP endpoint", async () => {
  const fetcher = jest
    .fn()
    .mockResolvedValue(
      response({ data: { KEYBOARD: { x: 30, y: -10 } } }),
    );

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  const request = {
    category: Category.KEYBOARD,
    productId: "keyboard-1",
    position: { x: 30, y: -10 },
  };

  await expect(
    client.request("moveEquipment", request),
  ).resolves.toEqual({ KEYBOARD: request.position });

  expect(fetcher).toHaveBeenCalledWith(
    "/api/v1/me/desk/position",
    expect.objectContaining({
      method: "PUT",
      body: JSON.stringify(request),
    }),
  );
});

test("Bugri placement uses its own typed endpoint without a product or purchase", async () => {
  const transform = { x: -1, y: 0, z: 2, rotationY: 90 };

  const fetcher = jest
    .fn()
    .mockResolvedValue(
      response({ data: { BUGRI: transform } }),
    );

  const api = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await api.request("transformBugri", { transform });

  expect(fetcher).toHaveBeenCalledWith(
    "/api/v1/me/desk/bugri",
    expect.objectContaining({
      method: "PUT",
      body: JSON.stringify({ transform }),
    }),
  );
});

test("discovery search sends server-side search and page parameters", async () => {
  const fetcher = jest.fn().mockResolvedValue(
    response({
      data: {
        items: [],
        page: 2,
        pageSize: 20,
        total: 40,
      },
    }),
  );

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await client.request("searchDiscovery", {
    kind: DiscoveryKind.USER,
    query: "개발자",
    page: 2,
    pageSize: 20,
  });

  const {
    mock: { calls },
  } = fetcher;

  const [[url, options]] = calls;
  const parsed = new URL(url, "https://example.test");

  expect(parsed.pathname).toBe("/api/v1/discover/search");

  expect(Object.fromEntries(parsed.searchParams)).toEqual({
    kind: "USER",
    query: "개발자",
    page: "2",
    pageSize: "20",
  });

  expect(options.body).toBeUndefined();
});

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
