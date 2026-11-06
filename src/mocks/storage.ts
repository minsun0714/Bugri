import { users, hashtags } from "./users";
import { quizzes } from "./quizzes";
import { subscriptions } from "./subscriptions";
import { attempts, learningDays } from "./learning-history";
import { initialBugCoin } from "./shop-items";
import type { UserState } from "../services/state";
import {
  object,
  requireValue,
  ServiceError,
  timeZoneValid,
  validateContent,
  source,
  categories,
} from "../services/validation";
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export const storageKey = (userId: string) =>
  `bugri:mock:v1:${userId}`;
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
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
    subscriptions: [...subscriptions],
    attempts: [...attempts],
    days: [...learningDays],
    timeZone: null,
    selection: {
      hashtagId: null,
      mode: "UNSOLVED",
      quizId: null,
    },
    purchases: [],
    equipment: {},
    ledger: [
      {
        id: `seed-balance-${userId}`,
        amount: initialBugCoin,
        reason: "SEED",
        reference: userId,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
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
  for (const key of [
    "quizzes",
    "batches",
    "subscriptions",
    "attempts",
    "days",
    "ledger",
    "purchases",
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
  object(value.selection);
  object(value.equipment);
  const selection = value.selection;
  requireValue(
    value.selection.mode === "UNSOLVED" ||
      value.selection.mode === "REPLAY",
    "학습 모드가 손상되었습니다.",
  );
  requireValue(
    value.selection.hashtagId === null ||
      hashtags.some((t) => t.id === selection.hashtagId),
    "선택 태그가 손상되었습니다.",
  );
  requireValue(
    value.selection.quizId === null ||
      typeof value.selection.quizId === "string",
    "학습 선택이 손상되었습니다.",
  );
  for (const [key, id] of Object.entries(value.equipment))
    requireValue(
      categories.includes(key as never) &&
        typeof id === "string",
      "장착 정보가 손상되었습니다.",
    );
  const s = value as unknown as UserState;
  const revision = (
    r: NonNullable<UserState["quizzes"][number]["active"]>,
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
      hashtags.map((t) => t.id),
    );
  };
  for (const q of s.quizzes) {
    object(q);
    requireValue(
      q.ownerUserId === userId &&
        typeof q.quizId === "string" &&
        Number.isInteger(q.version) &&
        q.version > 0 &&
        ["PENDING", "PUBLIC", "PRIVATE"].includes(
          q.status,
        ) &&
        typeof q.updatedAt === "string" &&
        (q.deletedAt === null ||
          typeof q.deletedAt === "string"),
      "퀴즈가 손상되었습니다.",
    );
    requireValue(
      q.status === "PENDING"
        ? q.active === null && q.pending !== null
        : q.active !== null,
      "활성 버전이 손상되었습니다.",
    );
    if (q.active) revision(q.active);
    if (q.pending) revision(q.pending);
  }
  for (const b of s.batches) {
    object(b);
    source(b.sourceContent);
    requireValue(
      typeof b.batchId === "string" &&
        Array.isArray(b.candidates) &&
        b.candidates.length >= 1 &&
        b.candidates.length <= 5,
      "생성 묶음이 손상되었습니다.",
    );
    for (const c of b.candidates) {
      object(c);
      requireValue(
        typeof c.candidateId === "string" &&
          (c.savedQuizId === null ||
            s.quizzes.some(
              (q) => q.quizId === c.savedQuizId,
            )),
        "저장 후보가 손상되었습니다.",
      );
      validateContent(
        c.content,
        hashtags.map((t) => t.id),
      );
    }
  }
  for (const sub of s.subscriptions) {
    object(sub);
    requireValue(
      typeof sub.subscriptionId === "string" &&
        ["PERSON", "HASHTAG", "PERSON_HASHTAG"].includes(
          sub.type,
        ),
      "구독이 손상되었습니다.",
    );
    if (sub.type !== "HASHTAG")
      requireValue(
        users.some((u) => u.userId === sub.authorUserId),
        "구독 사용자가 손상되었습니다.",
      );
    if (sub.type !== "PERSON")
      requireValue(
        hashtags.some((t) => t.id === sub.hashtagId),
        "구독 태그가 손상되었습니다.",
      );
  }
  for (const a of s.attempts) {
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
    revision(a.revision);
  }
  for (const d of s.days) {
    object(d);
    requireValue(
      typeof d.learningDate === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(d.learningDate) &&
        timeZoneValid(d.timeZone) &&
        typeof d.completedAt === "string",
      "학습일이 손상되었습니다.",
    );
  }
  for (const l of s.ledger) {
    object(l);
    requireValue(
      Number.isSafeInteger(l.amount) &&
        typeof l.id === "string" &&
        typeof l.reference === "string" &&
        typeof l.createdAt === "string" &&
        ["SEED", "DAILY_COMPLETION", "PURCHASE"].includes(
          l.reason,
        ),
      "원장이 손상되었습니다.",
    );
  }
  for (const p of s.purchases) {
    object(p);
    requireValue(
      typeof p.purchaseId === "string" &&
        typeof p.productId === "string" &&
        typeof p.requestKey === "string" &&
        Number.isSafeInteger(p.price) &&
        p.price > 0 &&
        typeof p.purchasedAt === "string",
      "구매가 손상되었습니다.",
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
