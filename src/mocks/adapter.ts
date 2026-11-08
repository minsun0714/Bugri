import type {
  ApiTransport,
  Operation,
  Request,
  Response,
  TransportResponse,
} from "@/api/contracts";
import { generatedContents } from "@/mocks/quizzes";
import {
  clone,
  readState,
  type StoragePort,
  writeState,
} from "@/mocks/storage";
import { hashtags, users } from "@/mocks/users";
import {
  execute,
  type MockGenerator,
  type ServiceContext,
} from "@/services/mock-service";
import {
  keys,
  object,
  requireValue,
  ServiceError,
  timeZoneValid,
} from "@/services/validation";

export interface MockOptions {
  userId: string;
  storage?: StoragePort;
  now?: () => Date;
  detectTimeZone?: () => string | undefined;
  /** No product default has been decided. Only use an explicitly chosen fallback. */
  fallbackTimeZone?: string;
  /** Seed the learner's completed Attempts for the solving-history demo. */
  demoHistory?: boolean;
  generate?: MockGenerator;
}

/** Instantiate in a browser event/effect. No localStorage access at module import or on a server. */
export function createMockTransport(
  options: MockOptions,
): ApiTransport {
  const defaultGenerate: MockGenerator = ({
    current,
    prompt,
  }) =>
    current
      ? [
          {
            ...current,
            question: {
              ...current.question,
              prompt: `${current.question.prompt}\n(Mock 재생성: ${prompt})`,
            },
          },
        ]
      : clone(generatedContents);

  return {
    async request<K extends Operation>(
      operation: K,
      request: Request<K>,
    ): Promise<TransportResponse<Response<K>>> {
      const {
        userId,
        fallbackTimeZone,
        storage: suppliedStorage,
      } = options;

      const requestId = globalThis.crypto.randomUUID();

      try {
        // Public directories do not depend on a user's browser snapshot.
        if (operation === "hashtags") {
          object(request);
          keys(request, []);

          return {
            status: 200,
            body: {
              data: clone(hashtags) as Response<K>,
            },
          };
        }

        requireValue(
          users.some((u) => u.userId === userId),
          "알 수 없는 더미 사용자입니다.",
        );

        requireValue(
          fallbackTimeZone === undefined ||
            timeZoneValid(fallbackTimeZone),
          "명시적 fallback 시간대를 확인하세요.",
        );

        let storage: StoragePort;

        try {
          if (suppliedStorage) storage = suppliedStorage;
          else {
            if (typeof window === "undefined")
              throw new Error("Browser required");

            storage = window.localStorage;
          }
        } catch {
          throw new ServiceError(
            "STORAGE_UNAVAILABLE",
            "브라우저 저장소가 필요합니다. 서버에서는 HTTP 어댑터를 사용하세요.",
            503,
          );
        }

        const now = options.now?.() ?? new Date();

        // Every write-allowed request re-detects the device zone; a valid, different zone replaces the saved one.
        // Stored attempts and learning days keep their own zone. Failed detection keeps the saved value.
        const readOnlyHistory =
          operation === "attemptHistory" ||
          operation === "attempt";

        let detected: string | undefined;

        if (!readOnlyHistory) {
          try {
            detected = options.detectTimeZone
              ? options.detectTimeZone()
              : Intl.DateTimeFormat().resolvedOptions()
                  .timeZone;
          } catch {
            /* explicit setting remains available */
          }
        }

        // Fresh reads on every request observe other dummy users and tabs. Only actor-owned state is written.
        // A brand-new seed gets review dates relative to "today" in the zone this request detected.
        const state = readState(storage, userId, {
          demoHistory: options.demoHistory,
          now,
          timeZone: timeZoneValid(detected)
            ? detected
            : (fallbackTimeZone ?? null),
        });

        const allStates = [state];

        const before = JSON.stringify(state);

        if (!readOnlyHistory) {
          if (timeZoneValid(detected)) {
            if (state.timeZone !== detected)
              state.timeZone = detected;
          } else if (!state.timeZone) {
            state.timeZone = fallbackTimeZone ?? null;
          }
        }

        const context: ServiceContext = {
          state,
          allStates,
          allQuizzes: allStates.flatMap(
            ({ quizzes }) => quizzes,
          ),
          now,
          id: () => globalThis.crypto.randomUUID(),
          generate: options.generate ?? defaultGenerate,
        };

        const data = execute(
          operation,
          clone(request),
          context,
        );

        // One setItem commits the complete mutation; failure leaves persisted state unchanged.
        if (JSON.stringify(state) !== before)
          writeState(storage, state);

        return {
          status: 200,
          body: {
            data: clone(data) as Response<K>,
          },
        };
      } catch (error) {
        const fault =
          error instanceof ServiceError
            ? error
            : new ServiceError(
                "VALIDATION_ERROR",
                "요청을 처리할 수 없습니다.",
              );

        const { status, code, message, fieldErrors } =
          fault;

        return {
          status,
          body: {
            error: {
              code,
              message,
              ...(fieldErrors
                ? {
                    fieldErrors,
                  }
                : {}),
              requestId,
            },
          },
        };
      }
    },
  };
}
