import type {
  ApiTransport,
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
    path: "/quizzes/generate",
  },
  generationBatch: {
    method: "GET",
    path: "/generation-batches/{id}",
    pathKey: "batchId",
  },
  saveBatch: {
    method: "POST",
    path: "/generation-batches/{id}/save",
    pathKey: "batchId",
  },
  quizzes: {
    method: "GET",
    path: "/quizzes",
  },
  reviewQuiz: {
    method: "GET",
    path: "/quizzes/{id}/review",
    pathKey: "quizId",
  },
  updatePending: {
    method: "PUT",
    path: "/quizzes/{id}/pending",
    pathKey: "quizId",
  },
  regenerate: {
    method: "POST",
    path: "/quizzes/{id}/regenerate",
    pathKey: "quizId",
  },
  approve: {
    method: "POST",
    path: "/quizzes/{id}/approve",
    pathKey: "quizId",
  },
  visibility: {
    method: "PATCH",
    path: "/quizzes/{id}/visibility",
    pathKey: "quizId",
  },
  deleteQuiz: {
    method: "DELETE",
    path: "/quizzes/{id}",
    pathKey: "quizId",
  },
  subscriptions: {
    method: "GET",
    path: "/subscriptions",
  },
  subscribe: {
    method: "POST",
    path: "/subscriptions",
  },
  unsubscribe: {
    method: "DELETE",
    path: "/subscriptions",
  },
  discoverUsers: {
    method: "GET",
    path: "/discover/users",
  },
  discoverHashtags: {
    method: "GET",
    path: "/discover/hashtags",
  },
  learningTags: {
    method: "GET",
    path: "/learning/tags",
  },
  learningQuiz: {
    method: "GET",
    path: "/learning/quiz",
  },
  learningNext: {
    method: "POST",
    path: "/learning/next",
  },
  learningDay: {
    method: "GET",
    path: "/learning/day",
  },
  learningTimezone: {
    method: "GET",
    path: "/me/learning-timezone",
  },
  updateTimezone: {
    method: "PATCH",
    path: "/me/learning-timezone",
  },
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
  products: {
    method: "GET",
    path: "/shop/products",
  },
  wallet: {
    method: "GET",
    path: "/me/bugcoin",
  },
  purchase: {
    method: "POST",
    path: "/shop/purchases",
  },
  inventory: {
    method: "GET",
    path: "/me/inventory",
  },
  equip: {
    method: "PUT",
    path: "/me/desk/equipment",
  },
  publicProfile: {
    method: "GET",
    path: "/users/{id}",
    pathKey: "publicId",
  },
};

/** No mock identity, seeds, storage, or real auth implementation is coupled to REST. */
export function createHttpTransport(
  options: { baseUrl?: string; fetch?: typeof fetch } = {},
): ApiTransport {
  return {
    async request<K extends Operation>(
      operation: K,
      request: Request<K>,
    ): Promise<TransportResponse<Response<K>>> {
      const requestId = globalThis.crypto.randomUUID();

      const failure = (
        code: "NETWORK_ERROR" | "INVALID_RESPONSE",
        message: string,
      ) => ({
        status: 502,
        body: {
          error: {
            code,
            message,
            requestId,
          },
        },
      });

      const endpoint = endpoints[operation];

      const params = {
        ...request,
      } as Record<string, unknown>;

      let path = endpoint.path;

      if (endpoint.pathKey) {
        path = path.replace(
          "{id}",
          encodeURIComponent(
            String(params[endpoint.pathKey]),
          ),
        );

        delete params[endpoint.pathKey];
      }

      const query = new URLSearchParams();

      if (endpoint.method === "GET")
        for (const [key, value] of Object.entries(params))
          if (value !== undefined && value !== null)
            query.set(key, String(value));

      let response: globalThis.Response;

      try {
        response = await (
          options.fetch ?? globalThis.fetch
        )(
          `${options.baseUrl ?? "/api/v1"}${path}${query.size ? `?${query}` : ""}`,
          {
            method: endpoint.method,
            headers: {
              Accept: "application/json",
              ...(endpoint.method === "GET"
                ? {}
                : {
                    "Content-Type": "application/json",
                  }),
            },
            ...(endpoint.method === "GET"
              ? {}
              : {
                  body: JSON.stringify(params),
                }),
          },
        );
      } catch {
        return failure(
          "NETWORK_ERROR",
          "API 연결에 실패했습니다.",
        );
      }

      try {
        const body = await response.json();

        if (
          !body ||
          typeof body !== "object" ||
          (response.ok
            ? !("data" in body) || "error" in body
            : !body.error ||
              typeof body.error.code !== "string" ||
              typeof body.error.message !== "string" ||
              typeof body.error.requestId !== "string")
        )
          return failure(
            "INVALID_RESPONSE",
            "API 응답 형식을 확인하세요.",
          );

        return {
          status: response.status,
          body,
        };
      } catch {
        return failure(
          "INVALID_RESPONSE",
          "JSON 응답이 필요합니다.",
        );
      }
    },
  };
}
