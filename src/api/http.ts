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
  guestQuiz: { method: "GET", path: "/guest/quiz" },
  guestAnswer: { method: "POST", path: "/guest/answer" },
  authoringConversation: {
    method: "GET",
    path: "/authoring/conversation",
  },
  sendAuthoringMessage: {
    method: "POST",
    path: "/authoring/conversation/messages",
  },
  generateFromConversation: {
    method: "POST",
    path: "/authoring/conversation/generate",
  },
  generate: {
    method: "POST",
    path: "/quizzes/generate",
  },
  generationBatch: {
    method: "GET",
    path: "/generation-batches/{id}",
    pathKey: "batchId",
  },
  publishCandidate: {
    method: "POST",
    path: "/generation-batches/{id}/publish",
    pathKey: "batchId",
  },
  editCandidate: {
    method: "POST",
    path: "/generation-batches/{id}/edit",
    pathKey: "batchId",
  },
  refineCandidate: {
    method: "POST",
    path: "/generation-batches/{id}/refine",
    pathKey: "batchId",
  },
  deleteCandidate: {
    method: "DELETE",
    path: "/generation-batches/{id}/candidates",
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
  tagQuizzes: {
    method: "GET",
    path: "/tags/{id}/quizzes",
    pathKey: "hashtagId",
  },
  developerQuizzes: {
    method: "GET",
    path: "/developers/{id}/quizzes",
    pathKey: "publicId",
  },
  developerTags: {
    method: "GET",
    path: "/developers/{id}/tags",
    pathKey: "publicId",
  },
  searchDiscovery: {
    method: "GET",
    path: "/discover/search",
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
  publicLearningDay: {
    method: "GET",
    path: "/users/{id}/learning-day",
    pathKey: "publicId",
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
  quizReaction: {
    method: "GET",
    path: "/quizzes/{id}/reaction",
    pathKey: "quizId",
  },
  updateQuizReaction: {
    method: "PUT",
    path: "/quizzes/{id}/reaction",
    pathKey: "quizId",
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
  moveEquipment: {
    method: "PUT",
    path: "/me/desk/position",
  },
  reorderDesk: {
    method: "PUT",
    path: "/me/desk/order",
  },
  transformDesk: {
    method: "PUT",
    path: "/me/desk/table",
  },
  transformBugri: {
    method: "PUT",
    path: "/me/desk/bugri",
  },
  transformEquipment: {
    method: "PUT",
    path: "/me/desk/transform",
  },
  profileOrder: {
    method: "GET",
    path: "/users/{id}/section-order",
    pathKey: "publicId",
  },
  updateProfileOrder: {
    method: "PUT",
    path: "/me/section-order",
  },
  profileAbout: {
    method: "GET",
    path: "/users/{id}/about",
    pathKey: "publicId",
  },
  updateProfileAbout: {
    method: "PUT",
    path: "/me/about",
  },
  publicProfile: {
    method: "GET",
    path: "/users/{id}",
    pathKey: "publicId",
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
