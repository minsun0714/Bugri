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

  await client.request("confirmQuiz", {
    quizId: "q",
    expectedVersion: 2,
  });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/quizzes/q/confirm",
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
  expect(Object.keys(endpoints)).toHaveLength(21);

  expect(endpoints.learningDay).toEqual({
    method: "GET",
    path: "/learning/day",
  });

  expect(endpoints.todayReview).toEqual({
    method: "GET",
    path: "/me/today-review",
  });
});

// Compile-time examples: payloads cannot use a scalar answer.
const invalidAnswer: Request<"answer"> = {
  attemptId: "a",
  // @ts-expect-error answers are discriminated by question format
  answer: true,
};

void invalidAnswer;

test("memo quiz operations use note and quiz paths", async () => {
  const fetcher = jest
    .fn()
    .mockResolvedValue(response({ data: [] }));

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await client.request("generate", { noteId: "note/1" });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/notes/note%2F1/quizzes/generate",
    expect.objectContaining({
      method: "POST",
      body: "{}",
    }),
  );

  await client.request("noteQuizzes", {
    noteId: "note/1",
    status: "PENDING",
  });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/notes/note%2F1/quizzes?status=PENDING",
    expect.objectContaining({ method: "GET" }),
  );

  await client.request("confirmNoteQuizzes", {
    noteId: "note/1",
  });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/notes/note%2F1/quizzes/confirm",
    expect.objectContaining({ method: "POST" }),
  );

  await client.request("refineQuiz", {
    quizId: "q/1",
    expectedVersion: 3,
    prompt: "예시 추가",
  });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/quizzes/q%2F1/refine",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        expectedVersion: 3,
        prompt: "예시 추가",
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

test("notes search sends the query, repeated tag ids and the untagged flag as GET parameters", async () => {
  const fetcher = jest
    .fn()
    .mockResolvedValue(response({ data: {} }));

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await client.request("notes", {
    query: "hooks",
    tagIds: ["web", "java"],
    untagged: true,
    page: 2,
  });

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/notes?query=hooks&tagIds=web&tagIds=java&untagged=true&page=2",
    expect.objectContaining({ method: "GET" }),
  );

  await client.request("noteTags", {});

  expect(fetcher).toHaveBeenLastCalledWith(
    "/api/v1/notes/tags",
    expect.objectContaining({ method: "GET" }),
  );
});
