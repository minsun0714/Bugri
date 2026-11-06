import type {
  ApiTransport,
  Operation,
  Request,
  Response,
  TransportResponse,
} from "@/api/contracts";
import {
  execute,
  type MockGenerator,
} from "@/services/mock-service";
import {
  requireValue,
  ServiceError,
  timeZoneValid,
} from "@/services/validation";
import {
  clone,
  readState,
  type StoragePort,
  writeState,
} from "@/mocks/storage";
import { generatedContents } from "@/mocks/quizzes";
import { users } from "@/mocks/users";

export interface MockOptions {
  userId: string;
  storage?: StoragePort;
  now?: () => Date;
  detectTimeZone?: () => string | undefined;
  /** No product default has been decided. Only use an explicitly chosen fallback. */
  fallbackTimeZone?: string;
  /** Fixture configuration, not an approved economy policy. Default: no reward minting. */
  dailyReward?: number;
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
        dailyReward,
        fallbackTimeZone,
        storage: suppliedStorage,
      } = options;

      const requestId = globalThis.crypto.randomUUID();

      try {
        requireValue(
          users.some((u) => u.userId === userId),
          "알 수 없는 더미 사용자입니다.",
        );

        requireValue(
          dailyReward === undefined ||
            (Number.isSafeInteger(dailyReward) &&
              dailyReward >= 0),
          "Mock 보상 설정은 0 이상의 정수여야 합니다.",
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

        // Fresh reads on every request observe other dummy users and tabs. Only actor-owned state is written.
        const allStates = users.map(({ userId }) =>
          readState(storage, userId),
        );

        const state = allStates.find(
          (s) => s.userId === userId,
        )!;

        const before = JSON.stringify(state);

        if (!state.timeZone) {
          let detected: string | undefined;

          try {
            detected = options.detectTimeZone
              ? options.detectTimeZone()
              : Intl.DateTimeFormat().resolvedOptions()
                  .timeZone;
          } catch {
            /* explicit setting remains available */
          }

          state.timeZone = timeZoneValid(detected)
            ? detected
            : (fallbackTimeZone ?? null);
        }

        const data = execute(operation, clone(request), {
          state,
          allStates,
          allQuizzes: allStates.flatMap(
            ({ quizzes }) => quizzes,
          ),
          now: options.now?.() ?? new Date(),
          id: () => globalThis.crypto.randomUUID(),
          generate: options.generate ?? defaultGenerate,
          dailyReward: dailyReward ?? 0,
        });

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
