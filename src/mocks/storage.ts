import { validateProfileAbout } from "@/lib/profile-about";
import { deskItems, validOrder } from "@/lib/desk-order";
import {
  migratePosition,
  validTransform,
} from "@/lib/desk-spatial";
import {
  isMovable,
  validPosition,
} from "@/lib/desk-layout";
import {
  QuizStatus,
  LearningMode,
  DeskObject,
  Category,
  ConversationRole,
} from "@/api/constants";
import { users, hashtags } from "@/mocks/users";
import { quizzes } from "@/mocks/quizzes";
import { subscriptions } from "@/mocks/subscriptions";
import {
  attempts,
  learningDays,
} from "@/mocks/learning-history";
import { demoCoinHistory } from "@/mocks/coin-history";
import type { UserState } from "@/services/state";
import {
  object,
  requireValue,
  ServiceError,
  timeZoneValid,
  validateContent,
  source,
  categories,
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

export function initialState(userId: string): UserState {
  return clone({
    schemaVersion: 1,
    learningDemoVersion: 1,
    coinHistoryDemoVersion: 1,
    userId,
    quizzes: quizzes
      .filter((q) => q.ownerUserId === userId)
      .map((q) => ({
        ...q,
        deletedAt: null,
      })),
    batches: [],
    subscriptions: (subscriptions[userId] ?? []).map(
      (target, index) => ({
        ...target,
        subscriptionId: `seed-subscription-${userId}-${index + 1}`,
      }),
    ),
    attempts: [...attempts],
    days: [...learningDays],
    timeZone: null,
    selection: {
      hashtagId: null,
      mode: LearningMode.UNSOLVED,
      quizId: null,
    },
    purchases: [],
    equipment: {},
    positions: {},
    transforms: {},
    order: [],
    ledger: demoCoinHistory(userId),
  });
}

/** Reject incompatible/corrupt storage without silently overwriting the user's data. Not a security boundary. */
function validateState(
  value: unknown,
  userId: string,
): asserts value is UserState {
  object(value);

  if (value.profileAbout !== undefined)
    requireValue(
      Object.keys(validateProfileAbout(value.profileAbout))
        .length === 0,
      "저장된 프로필이 올바르지 않습니다.",
    );

  requireValue(
    value.schemaVersion === 1 && value.userId === userId,
    "저장 버전/사용자가 다릅니다.",
  );

  requireValue(
    value.learningDemoVersion === undefined ||
      value.learningDemoVersion === 1,
    "학습 예시 데이터 버전이 호환되지 않습니다.",
  );

  requireValue(
    value.coinHistoryDemoVersion === undefined ||
      value.coinHistoryDemoVersion === 1,
    "코인 예시 데이터 버전이 호환되지 않습니다.",
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

  const { selection, equipment } = value;

  if (value.order === undefined) value.order = [];

  requireValue(
    validOrder(value.order, deskItems(equipment)),
    "겹침 순서가 손상되었습니다.",
  );

  // Additive v1 migration: existing purchases/equipment are never reset.
  if (value.positions === undefined) value.positions = {};

  object(value.positions);

  for (const [category, position] of Object.entries(
    value.positions,
  )) {
    requireValue(
      isMovable(category) &&
        validPosition(category, position) &&
        typeof equipment[category] === "string",
      "배치 정보가 손상되었습니다.",
    );
  }

  if (value.transforms === undefined) {
    value.transforms = Object.fromEntries(
      Object.entries(value.positions).map(
        ([category, position]) => [
          category,
          migratePosition(
            category as import("@/lib/desk-layout").MovableCategory,
            position as import("@/api/contracts").DeskPosition,
          ),
        ],
      ),
    );
  }

  object(value.transforms);

  for (const [category, transform] of Object.entries(
    value.transforms,
  )) {
    requireValue(
      (category === DeskObject.BUGRI &&
        validTransform(category, transform)) ||
        (isMovable(category) &&
          validTransform(category, transform) &&
          (category === Category.DESK ||
            typeof equipment[category] === "string")),
      "3D 배치 정보가 손상되었습니다.",
    );
  }

  requireValue(
    selection.mode === LearningMode.UNSOLVED ||
      selection.mode === LearningMode.REPLAY,
    "학습 모드가 손상되었습니다.",
  );

  requireValue(
    selection.hashtagId === null ||
      hashtags.some((t) => t.id === selection.hashtagId),
    "선택 태그가 손상되었습니다.",
  );

  requireValue(
    selection.quizId === null ||
      typeof selection.quizId === "string",
    "학습 선택이 손상되었습니다.",
  );

  for (const [key, id] of Object.entries(equipment))
    requireValue(
      categories.includes(key as never) &&
        typeof id === "string",
      "장착 정보가 손상되었습니다.",
    );

  const {
    quizzes,
    batches,
    subscriptions,
    attempts,
    days,
    ledger,
    purchases,
  } = value as unknown as UserState;

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
      hashtags.map(({ id }) => id),
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

  for (const sub of subscriptions) {
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

    revision(a.revision);
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

  for (const l of ledger) {
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

  for (const p of purchases) {
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
