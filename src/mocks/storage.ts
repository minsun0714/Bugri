import {
  ConversationRole,
  QuizStatus,
} from "@/api/constants";
import {
  attempts,
  historyDemoAttempts,
  learningDays,
} from "@/mocks/learning-history";
import {
  historyDemoQuizzes,
  quizzes,
} from "@/mocks/quizzes";
import { hashtags } from "@/mocks/users";
import type { UserState } from "@/services/state";
import {
  object,
  requireValue,
  ServiceError,
  source,
  timeZoneValid,
  validateContent,
} from "@/services/validation";

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const storageKey = (userId: string) =>
  `bugri:mock:v1:${userId}`;

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Idempotently adds the demo history (private practice quizzes + completed attempts) to the actor's state. Never touches other users or removes records. */
export function applyHistoryDemo(state: UserState) {
  if (state.historyDemoVersion === 1) return;

  const quizIds = new Set(
    state.quizzes.map(({ quizId }) => quizId),
  );

  const attemptIds = new Set(
    state.attempts.map(({ attemptId }) => attemptId),
  );

  state.quizzes.push(
    ...clone(
      historyDemoQuizzes.filter(
        ({ ownerUserId, quizId }) =>
          ownerUserId === state.userId &&
          !quizIds.has(quizId),
      ),
    ).map((quiz) => ({ ...quiz, deletedAt: null })),
  );

  state.attempts.push(
    ...clone(
      (historyDemoAttempts[state.userId] ?? []).filter(
        ({ attemptId }) => !attemptIds.has(attemptId),
      ),
    ),
  );

  state.historyDemoVersion = 1;
}

export function initialState(userId: string): UserState {
  return clone({
    schemaVersion: 1,
    userId,
    quizzes: quizzes
      .filter((q) => q.ownerUserId === userId)
      .map((q) => ({
        ...q,
        deletedAt: null,
      })),
    batches: [],
    attempts: [...attempts],
    days: [...learningDays],
    timeZone: null,
  });
}

/** Reject incompatible/corrupt storage without silently overwriting the user's data. Not a security boundary. */
function validateState(
  value: unknown,
  userId: string,
): asserts value is UserState {
  object(value);

  requireValue(
    value.schemaVersion === 1 && value.userId === userId,
    "저장 버전/사용자가 다릅니다.",
  );

  requireValue(
    value.historyDemoVersion === undefined ||
      value.historyDemoVersion === 1,
    "기록 데모 버전이 올바르지 않습니다.",
  );

  for (const key of [
    "quizzes",
    "batches",
    "attempts",
    "days",
  ])
    requireValue(
      Array.isArray(value[key]),
      "저장 배열이 손상되었습니다.",
    );

  requireValue(
    value.timeZone === null ||
      timeZoneValid(value.timeZone),
    "시간대가 손상되었습니다.",
  );

  const { quizzes, batches, attempts, days } =
    value as unknown as UserState;

  const { authoringConversation } = value;

  if (authoringConversation !== undefined) {
    object(authoringConversation);

    const { version, messages, draft, latestBatchId } =
      authoringConversation;

    requireValue(
      Number.isInteger(version) &&
        Number(version) >= 0 &&
        Array.isArray(messages) &&
        messages.length % 2 === 0,
      "대화 기록이 손상되었습니다.",
    );

    requireValue(
      typeof draft === "string" &&
        [...draft].length <= 10000,
      "대화 입력이 손상되었습니다.",
    );

    requireValue(
      latestBatchId === null ||
        batches.some(
          ({ batchId }) => batchId === latestBatchId,
        ),
      "생성 결과 연결이 손상되었습니다.",
    );

    for (const [index, message] of (
      messages as unknown[]
    ).entries()) {
      object(message);

      requireValue(
        typeof message.messageId === "string" &&
          message.role ===
            (index % 2 === 0
              ? ConversationRole.USER
              : ConversationRole.ASSISTANT),
        "대화 메시지가 손상되었습니다.",
      );

      source(message.content);
    }
  }

  const { notes } = value;

  if (notes !== undefined) {
    requireValue(
      Array.isArray(notes),
      "메모 목록이 손상되었습니다.",
    );

    for (const n of notes as unknown[]) {
      object(n);

      requireValue(
        typeof n.noteId === "string" &&
          Number.isInteger(n.version) &&
          Number(n.version) > 0 &&
          typeof n.createdAt === "string" &&
          typeof n.updatedAt === "string" &&
          (n.deletedAt === null ||
            typeof n.deletedAt === "string"),
        "메모가 손상되었습니다.",
      );

      source(n.content, "content");
    }
  }

  const revision = (
    r: UserState["attempts"][number]["revision"],
    partialHistory = false,
  ) => {
    object(r);

    const {
      revisionId,
      sourceContent,
      reviewed,
      followUpPrompt,
      ...content
    } = r;

    requireValue(
      typeof revisionId === "string" &&
        typeof reviewed === "boolean" &&
        (followUpPrompt === undefined ||
          typeof followUpPrompt === "string"),
      "버전이 손상되었습니다.",
    );

    source(sourceContent);

    validateContent(
      content,
      hashtags.map(({ id }) => id),
      partialHistory,
    );
  };

  for (const q of quizzes) {
    object(q);

    requireValue(
      q.ownerUserId === userId &&
        typeof q.quizId === "string" &&
        Number.isInteger(q.version) &&
        q.version > 0 &&
        Object.values(QuizStatus).includes(q.status) &&
        typeof q.updatedAt === "string" &&
        (q.createdAt === undefined ||
          (typeof q.createdAt === "string" &&
            Number.isFinite(Date.parse(q.createdAt)))) &&
        (q.publishedAt === undefined ||
          (typeof q.publishedAt === "string" &&
            Number.isFinite(Date.parse(q.publishedAt)))) &&
        (q.deletedAt === null ||
          typeof q.deletedAt === "string"),
      "퀴즈가 손상되었습니다.",
    );

    requireValue(
      q.status === QuizStatus.PENDING
        ? q.active === null && q.pending !== null
        : q.active !== null,
      "활성 버전이 손상되었습니다.",
    );

    if (q.active) revision(q.active);

    if (q.pending) revision(q.pending);
  }

  for (const b of batches) {
    object(b);
    source(b.sourceContent);

    requireValue(
      typeof b.batchId === "string" &&
        Array.isArray(b.candidates) &&
        b.candidates.length <= 5,
      "생성 묶음이 손상되었습니다.",
    );

    for (const c of b.candidates) {
      object(c);

      requireValue(
        typeof c.candidateId === "string" &&
          (c.savedQuizId === null ||
            quizzes.some(
              (q) => q.quizId === c.savedQuizId,
            )),
        "저장 후보가 손상되었습니다.",
      );

      validateContent(
        c.content,
        hashtags.map(({ id }) => id),
      );

      if (c.history !== undefined) {
        requireValue(
          Array.isArray(c.history),
          "추가 요청 기록이 손상되었습니다.",
        );

        for (const item of c.history as unknown[]) {
          object(item);

          requireValue(
            typeof item.prompt === "string" &&
              item.prompt.trim().length > 0,
            "추가 요청이 손상되었습니다.",
          );

          validateContent(
            item.content,
            hashtags.map(({ id }) => id),
          );
        }
      }
    }
  }

  for (const a of attempts) {
    object(a);

    requireValue(
      typeof a.attemptId === "string" &&
        typeof a.quizId === "string" &&
        (a.completedAt === null ||
          typeof a.completedAt === "string") &&
        (a.correct === null ||
          typeof a.correct === "boolean"),
      "풀이가 손상되었습니다.",
    );

    revision(a.revision, !!a.completedAt);
  }

  for (const d of days) {
    object(d);

    requireValue(
      typeof d.learningDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(d.learningDate) &&
        timeZoneValid(d.timeZone) &&
        typeof d.completedAt === "string",
      "학습일이 손상되었습니다.",
    );
  }
}

export function readState(
  storage: StoragePort,
  userId: string,
): UserState {
  let raw: string | null;

  try {
    raw = storage.getItem(storageKey(userId));
  } catch {
    throw new ServiceError(
      "STORAGE_UNAVAILABLE",
      "브라우저 저장소를 읽을 수 없습니다.",
      503,
    );
  }

  if (raw === null) return initialState(userId);

  try {
    const state: unknown = JSON.parse(raw);

    validateState(state, userId);

    return state;
  } catch {
    throw new ServiceError(
      "STORAGE_CORRUPT",
      "저장 데이터가 손상되었거나 호환되지 않습니다. 복구 또는 명시적 초기화가 필요합니다.",
      409,
    );
  }
}

export function writeState(
  storage: StoragePort,
  state: UserState,
) {
  try {
    storage.setItem(
      storageKey(state.userId),
      JSON.stringify(state),
    );
  } catch {
    throw new ServiceError(
      "STORAGE_UNAVAILABLE",
      "저장에 실패했습니다. 변경 내용을 유지하고 다시 시도하세요.",
      503,
    );
  }
}
