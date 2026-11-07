import type { StoredQuiz } from "@/services/state";
import { QuizStatus, DiscoveryKind } from "@/api/constants";
import type {
  DiscoveryPage,
  DiscoveryQuery,
  Hashtag,
  Subscription,
  User,
} from "@/api/contracts";
import { requireValue } from "@/services/validation";

export function searchDiscovery(
  {
    users,
    hashtags,
    subscriptions,
    quizzes = [],
    unavailableUserIds = [],
  }: {
    users: readonly User[];
    hashtags: readonly Hashtag[];
    subscriptions: readonly Subscription[];
    quizzes?: readonly StoredQuiz[];
    unavailableUserIds?: readonly string[];
  },
  { kind, query, page, pageSize }: DiscoveryQuery,
): DiscoveryPage {
  requireValue(
    kind === DiscoveryKind.USER ||
      kind === DiscoveryKind.HASHTAG,
    "검색 대상을 확인하세요.",
  );

  requireValue(
    typeof query === "string" &&
      Array.from(query).length <= 100,
    "검색어는 100자 이하여야 합니다.",
  );

  requireValue(
    Number.isSafeInteger(page) && page >= 1,
    "페이지는 1 이상의 정수여야 합니다.",
  );

  requireValue(
    Number.isSafeInteger(pageSize) &&
      pageSize >= 1 &&
      pageSize <= 50,
    "페이지 크기는 1~50이어야 합니다.",
  );

  const normalized = query
    .trim()
    .normalize("NFC")
    .toLowerCase();

  const term =
    kind === DiscoveryKind.USER
      ? normalized.replace(/^@/, "")
      : normalized;

  const matches = (...values: string[]) =>
    values.some((value) =>
      value.normalize("NFC").toLowerCase().includes(term),
    );

  const offset = (page - 1) * pageSize;

  const sortIds = (a: string, b: string) =>
    a < b ? -1 : a > b ? 1 : 0;

  if (kind === DiscoveryKind.USER) {
    const found = users
      .filter(({ userId, publicId, displayName }) =>
        matches(userId, publicId, displayName),
      )
      .sort((a, b) => sortIds(a.userId, b.userId));

    return {
      page,
      pageSize,
      total: found.length,
      items: found
        .slice(offset, offset + pageSize)
        .map((user) => ({
          type: DiscoveryKind.USER,
          user,
          summary: unavailableUserIds.includes(user.userId)
            ? null
            : (() => {
                const available = quizzes.filter(
                  (quiz) =>
                    quiz.ownerUserId === user.userId &&
                    quiz.status === QuizStatus.PUBLIC &&
                    !quiz.deletedAt &&
                    quiz.active,
                );

                const ids = new Set(
                  available.flatMap(
                    (quiz) => quiz.active!.hashtagIds,
                  ),
                );

                return {
                  publicQuizCount: available.length,
                  hashtags: hashtags
                    .filter(({ id }) => ids.has(id))
                    .slice(0, 3),
                };
              })(),
          subscribed: subscriptions.some(
            (sub) =>
              sub.type === "PERSON" &&
              sub.authorUserId === user.userId,
          ),
        })),
    };
  }

  const found = hashtags
    .filter(({ id, name }) => matches(id, name))
    .sort((a, b) => sortIds(a.id, b.id));

  return {
    page,
    pageSize,
    total: found.length,
    items: found
      .slice(offset, offset + pageSize)
      .map((hashtag) => ({
        type: DiscoveryKind.HASHTAG,
        hashtag,
        subscribed: subscriptions.some(
          (sub) =>
            sub.type === "HASHTAG" &&
            sub.hashtagId === hashtag.id,
        ),
      })),
  };
}
