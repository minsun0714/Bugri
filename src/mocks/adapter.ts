import { quizReactionSummary } from "@/services/quiz-reactions";
import { guestLearning } from "@/services/guest-learning";
import { demoCoinHistory } from "@/mocks/coin-history";
import { initialBugCoin } from "@/mocks/shop-items";
import type {
  ApiTransport,
  AuthoringMessage,
  Operation,
  Request,
  Response,
  TransportResponse,
} from "@/api/contracts";
import {
  execute,
  type MockGenerator,
  type ServiceContext,
} from "@/services/mock-service";
import {
  object,
  text,
  keys,
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
import { mockAuthoringReply } from "@/mocks/authoring-chat";
import { users, hashtags } from "@/mocks/users";
import { subscriptions } from "@/mocks/subscriptions";

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
  reply?: (
    messages: AuthoringMessage[],
    content: string,
  ) => unknown;
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
        if (
          operation === "quizReaction" &&
          userId === "guest"
        ) {
          object(request);
          keys(request, ["quizId"]);

          const { quizId } =
            request as Request<"quizReaction">;

          text(quizId, "quizId");

          const storage =
            suppliedStorage ?? window.localStorage;

          const states = users.map(({ userId }) =>
            readState(storage, userId),
          );

          return {
            status: 200,
            body: {
              data: quizReactionSummary(
                null,
                quizId,
                states,
              ) as Response<K>,
            },
          };
        }

        if (
          operation === "guestQuiz" ||
          operation === "guestAnswer"
        ) {
          const storage =
            suppliedStorage ?? window.localStorage;

          const quizzes = users.flatMap(
            ({ userId }) =>
              readState(storage, userId).quizzes,
          );

          const data = guestLearning(
            operation,
            request as
              Request<"guestQuiz"> | Request<"guestAnswer">,
            quizzes,
          );

          return {
            status: 200,
            body: { data: clone(data) as Response<K> },
          };
        }

        // Public directories do not depend on a user's browser snapshot.
        if (
          operation === "discoverUsers" ||
          operation === "discoverHashtags"
        ) {
          object(request);
          keys(request, []);

          return {
            status: 200,
            body: {
              data: clone(
                operation === "discoverUsers"
                  ? users
                  : hashtags,
              ) as Response<K>,
            },
          };
        }

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
        const state = readState(storage, userId);
        const unavailableUserIds: string[] = [];

        const actorOnly = [
          "subscriptions",
          "subscribe",
          "unsubscribe",
        ].includes(operation);

        const allStates = actorOnly ? [state] : [];

        if (!actorOnly) {
          for (const { userId: otherId } of users) {
            if (otherId === userId) {
              allStates.push(state);
              continue;
            }

            try {
              allStates.push(readState(storage, otherId));
            } catch (error) {
              if (
                operation !== "searchDiscovery" ||
                !(error instanceof ServiceError) ||
                error.code !== "STORAGE_CORRUPT"
              )
                throw error;

              // Do not substitute seeds or overwrite the corrupt owner's data.
              unavailableUserIds.push(otherId);
            }
          }
        }

        const before = JSON.stringify(state);

        if (
          operation !== "publicLearningDay" &&
          operation !== "profileOrder" &&
          !state.timeZone
        ) {
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

        const context: ServiceContext = {
          state,
          allStates,
          unavailableUserIds,
          allQuizzes: allStates.flatMap(
            ({ quizzes }) => quizzes,
          ),
          now: options.now?.() ?? new Date(),
          id: () => globalThis.crypto.randomUUID(),
          generate: options.generate ?? defaultGenerate,
          reply: options.reply ?? mockAuthoringReply,
          dailyReward: dailyReward ?? 0,
        };

        // Upgrade only the actor's legacy snapshot. Service-level subscribe deduplicates targets.
        // Commit the marker with the requested operation so a failed write never partially migrates.
        if (
          operation !== "publicLearningDay" &&
          operation !== "profileOrder" &&
          state.learningDemoVersion === undefined
        ) {
          for (const target of subscriptions[userId] ??
            []) {
            execute("subscribe", clone(target), context);
          }

          state.learningDemoVersion = 1;
        }

        if (
          operation !== "publicLearningDay" &&
          operation !== "profileOrder" &&
          state.coinHistoryDemoVersion === undefined
        ) {
          state.ledger = state.ledger.flatMap((entry) =>
            entry.id === `seed-balance-${userId}` &&
            entry.reason === "SEED" &&
            entry.reference === userId &&
            entry.amount === initialBugCoin &&
            entry.createdAt === "2026-01-01T00:00:00.000Z"
              ? demoCoinHistory(userId)
              : [entry],
          );

          state.coinHistoryDemoVersion = 1;
        }

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
