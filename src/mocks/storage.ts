import {
  AttemptContext,
  QuizStatus,
} from "@/api/constants";
import {
  historyDemoAttempts,
  learningDays,
} from "@/mocks/learning-history";
import { seedReviewPlans, seeds } from "@/mocks/seed";
import { hashtags } from "@/mocks/users";
import { localDate } from "@/services/learning";
import {
  addDays,
  reviewIntervals,
} from "@/services/review-schedule";
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

export interface InitialStateOptions {
  demoHistory?: boolean;
  /**
   * Creation time. With it the seed gets review schedules relative to today in `timeZone` (UTC when
   * unknown). Without it the schedules are computed from each quiz's `confirmedAt`.
   */
  now?: Date;
  timeZone?: string | null;
}

/** The history demo adds completed Attempts on the learner's CONFIRMED seed quizzes. */
export function initialState(
  userId: string,
  {
    demoHistory = false,
    now,
    timeZone,
  }: InitialStateOptions = {},
): UserState {
  const { notes = [], quizzes = [] } = seeds[userId] ?? {};

  const today = now
    ? localDate(now, timeZone ?? "UTC")
    : null;

  const reviewSchedules = today
    ? (seedReviewPlans[userId] ?? []).map(
        ({ quizId, stage, dueInDays, lastCorrect }) => ({
          quizId,
          stage,
          nextReviewDate: addDays(today, dueInDays),
          lastCorrect,
        }),
      )
    : undefined;

  return clone({
    schemaVersion: 2,
    userId,
    notes,
    quizzes,
    attempts: demoHistory
      ? [...(historyDemoAttempts[userId] ?? [])]
      : [],
    days: [...learningDays],
    timeZone: null,
    ...(reviewSchedules ? { reviewSchedules } : {}),
  });
}

function validateState(
  value: unknown,
  userId: string,
): asserts value is UserState {
  object(value);

  requireValue(
    value.schemaVersion === 2 && value.userId === userId,
    "저장 버전/사용자가 다릅니다.",
  );

  for (const key of [
    "notes",
    "quizzes",
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

  const { notes, quizzes, attempts, days } =
    value as unknown as UserState;

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

  const tagIds = hashtags.map(({ id }) => id);

  const revision = (
    r: UserState["attempts"][number]["revision"],
    partialHistory = false,
  ) => {
    object(r);

    const { revisionId, sourceContent, ...content } = r;

    requireValue(
      typeof revisionId === "string",
      "버전이 손상되었습니다.",
    );

    source(sourceContent);

    validateContent(content, tagIds, partialHistory);
  };

  for (const q of quizzes) {
    object(q);

    requireValue(
      q.ownerUserId === userId &&
        typeof q.quizId === "string" &&
        notes.some(({ noteId }) => noteId === q.noteId) &&
        Number.isInteger(q.version) &&
        q.version > 0 &&
        Object.values(QuizStatus).includes(q.status) &&
        typeof q.createdAt === "string" &&
        Number.isFinite(Date.parse(q.createdAt)) &&
        typeof q.updatedAt === "string" &&
        (q.deletedAt === null ||
          typeof q.deletedAt === "string"),
      "퀴즈가 손상되었습니다.",
    );

    requireValue(
      q.status === QuizStatus.CONFIRMED
        ? typeof q.confirmedAt === "string" &&
            Number.isFinite(Date.parse(q.confirmedAt))
        : q.confirmedAt === null,
      "확인 시각이 손상되었습니다.",
    );

    revision(q.revision);

    requireValue(
      Array.isArray(q.history),
      "추가 요청 기록이 손상되었습니다.",
    );

    for (const turn of q.history as unknown[]) {
      object(turn);

      requireValue(
        typeof turn.prompt === "string" &&
          turn.prompt.trim().length > 0,
        "추가 요청이 손상되었습니다.",
      );

      validateContent(turn.content, tagIds);
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

  const { reviewSchedules } = value as unknown as UserState;

  requireValue(
    reviewSchedules === undefined ||
      Array.isArray(reviewSchedules),
    "복습 일정이 손상되었습니다.",
  );

  for (const entry of (reviewSchedules ??
    []) as unknown[]) {
    object(entry);

    requireValue(
      typeof entry.quizId === "string" &&
        Number.isInteger(entry.stage) &&
        Number(entry.stage) >= 0 &&
        Number(entry.stage) < reviewIntervals.length &&
        typeof entry.nextReviewDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(entry.nextReviewDate) &&
        (entry.lastCorrect === null ||
          typeof entry.lastCorrect === "boolean"),
      "복습 일정이 손상되었습니다.",
    );
  }

  for (const a of attempts) {
    requireValue(
      a.context === undefined ||
        Object.values(AttemptContext).includes(a.context),
      "풀이 경로가 손상되었습니다.",
    );
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
  options: InitialStateOptions = {},
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

  if (raw === null) return initialState(userId, options);

  let state: unknown;

  try {
    state = JSON.parse(raw);
  } catch {
    throw corrupt();
  }

  // Demo prototype decision: data from another schemaVersion is discarded, not migrated.
  if (
    state !== null &&
    typeof state === "object" &&
    "schemaVersion" in state &&
    typeof state.schemaVersion === "number" &&
    state.schemaVersion !== 2
  ) {
    const fresh = initialState(userId, options);

    writeState(storage, fresh);

    return fresh;
  }

  try {
    validateState(state, userId);

    return state;
  } catch {
    throw corrupt();
  }
}

function corrupt() {
  return new ServiceError(
    "STORAGE_CORRUPT",
    "저장 데이터가 손상되었거나 호환되지 않습니다. 복구 또는 명시적 초기화가 필요합니다.",
    409,
  );
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
