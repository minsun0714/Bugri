import type {
  ApiTransport,
  ErrorCode,
  Operation,
  Request,
  Response,
  TransportResponse,
} from "@/api/contracts";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  pathKey?: string;
}

export const endpoints: Record<Operation, Endpoint> = {
  generate: {
    method: "POST",
    path: "/notes/{id}/quizzes/generate",
    pathKey: "noteId",
  },
  notes: { method: "GET", path: "/notes" },
  noteTags: { method: "GET", path: "/notes/tags" },
  note: {
    method: "GET",
    path: "/notes/{id}",
    pathKey: "noteId",
  },
  createNote: { method: "POST", path: "/notes" },
  updateNote: {
    method: "PUT",
    path: "/notes/{id}",
    pathKey: "noteId",
  },
  deleteNote: {
    method: "DELETE",
    path: "/notes/{id}",
    pathKey: "noteId",
  },
  noteQuizzes: {
    method: "GET",
    path: "/notes/{id}/quizzes",
    pathKey: "noteId",
  },
  reviewQuiz: {
    method: "GET",
    path: "/quizzes/{id}/review",
    pathKey: "quizId",
  },
  updateQuiz: {
    method: "PUT",
    path: "/quizzes/{id}",
    pathKey: "quizId",
  },
  refineQuiz: {
    method: "POST",
    path: "/quizzes/{id}/refine",
    pathKey: "quizId",
  },
  confirmQuiz: {
    method: "POST",
    path: "/quizzes/{id}/confirm",
    pathKey: "quizId",
  },
  confirmNoteQuizzes: {
    method: "POST",
    path: "/notes/{id}/quizzes/confirm",
    pathKey: "noteId",
  },
  deleteQuiz: {
    method: "DELETE",
    path: "/quizzes/{id}",
    pathKey: "quizId",
  },
  hashtags: {
    method: "GET",
    path: "/hashtags",
  },
  learningDay: {
    method: "GET",
    path: "/learning/day",
  },
  learningTimezone: {
    method: "GET",
    path: "/me/learning-timezone",
  },
  attemptHistory: { method: "GET", path: "/me/attempts" },
  startAttempt: {
    method: "POST",
    path: "/quizzes/{id}/attempts",
    pathKey: "quizId",
  },
  attempt: {
    method: "GET",
    path: "/attempts/{id}",
    pathKey: "attemptId",
  },
  answer: {
    method: "POST",
    path: "/attempts/{id}/answer",
    pathKey: "attemptId",
  },
};

/** No mock identity, seeds, storage, or real auth implementation is coupled to REST. */
export function createHttpTransport(
  options: {
    baseUrl?: string;
    fetch?: typeof fetch;
    timeoutMs?: number;
  } = {},
): ApiTransport {
  return {
    async request<K extends Operation>(
      operation: K,
      request: Request<K>,
    ): Promise<TransportResponse<Response<K>>> {
      const {
        baseUrl,
        fetch: fetcher,
        timeoutMs = 15_000,
      } = options;

      const requestId = globalThis.crypto.randomUUID();

      const failure = (
        code: ErrorCode,
        message: string,
        status = 502,
      ) => ({
        status,
        body: {
          error: {
            code,
            message,
            requestId,
          },
        },
      });

      const {
        [operation]: {
          method,
          pathKey,
          path: endpointPath,
        },
      } = endpoints;

      const params = {
        ...request,
      } as Record<string, unknown>;

      let path = endpointPath;

      if (pathKey) {
        path = path.replace(
          "{id}",
          encodeURIComponent(String(params[pathKey])),
        );

        delete params[pathKey];
      }

      const query = new URLSearchParams();

      if (method === "GET")
        for (const [key, value] of Object.entries(params))
          if (value !== undefined && value !== null)
            if (Array.isArray(value)) {
              for (const item of value)
                query.append(key, String(item));
            } else query.set(key, String(value));

      const controller = new AbortController();

      const timer = setTimeout(
        () => controller.abort(),
        timeoutMs,
      );

      let response: globalThis.Response | undefined;

      const invalidResponse = () => {
        if (response && !response.ok) {
          const { status } = response;

          return failure(
            status === 404
              ? "NOT_FOUND"
              : status === 403
                ? "FORBIDDEN"
                : status >= 500
                  ? "SERVER_ERROR"
                  : "HTTP_ERROR",
            "요청을 완료하지 못했습니다.",
            status,
          );
        }

        return failure(
          "INVALID_RESPONSE",
          "API 응답 형식을 확인하세요.",
        );
      };

      try {
        response = await (fetcher ?? globalThis.fetch)(
          `${baseUrl ?? "/api/v1"}${path}${query.size ? `?${query}` : ""}`,
          {
            method,
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              ...(method === "GET"
                ? {}
                : { "Content-Type": "application/json" }),
            },
            ...(method === "GET"
              ? {}
              : { body: JSON.stringify(params) }),
          },
        );

        const body = await response.json();
        const { ok, status } = response;

        if (
          !body ||
          typeof body !== "object" ||
          (ok
            ? !("data" in body) || "error" in body
            : !body.error ||
              typeof body.error.code !== "string" ||
              typeof body.error.message !== "string" ||
              typeof body.error.requestId !== "string")
        )
          return invalidResponse();

        return { status, body };
      } catch {
        if (controller.signal.aborted) {
          return failure(
            "REQUEST_TIMEOUT",
            "응답 시간이 초과되었습니다.",
            504,
          );
        }

        return response
          ? invalidResponse()
          : failure(
              "NETWORK_ERROR",
              "API 연결에 실패했습니다.",
            );
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
