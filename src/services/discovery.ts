import { normalizeTagInput } from "@/lib/tags";
import type { StoredQuiz } from "@/services/state";
import { DiscoveryKind, QuizStatus } from "@/api/constants";
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
  }: {
    quizzes?: readonly StoredQuiz[];
    users: readonly User[];
    hashtags: readonly Hashtag[];
    subscriptions: readonly Subscription[];
  },
  {
    kind,
    query,
    page,
    pageSize,
    subscribedOnly = false,
  }: DiscoveryQuery,
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

  requireValue(
    typeof subscribedOnly === "boolean",
    "구독 필터를 확인하세요.",
  );

  const term = (
    kind === DiscoveryKind.HASHTAG
      ? normalizeTagInput(query)
      : query.trim()
  )
    .normalize("NFC")
    .toLowerCase();

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
          subscribed: subscriptions.some(
            (sub) =>
              sub.type === "PERSON" &&
              sub.authorUserId === user.userId,
          ),
        })),
    };
  }

  const isSubscribed = (id: string) =>
    subscriptions.some(
      (sub) =>
        sub.type === "HASHTAG" && sub.hashtagId === id,
    );

  const available = quizzes.filter(
    ({ status, deletedAt, active }) =>
      status === QuizStatus.PUBLIC && !deletedAt && active,
  );

  const found = hashtags
    .filter(
      ({ id, name }) =>
        matches(id, name) &&
        (!subscribedOnly || isSubscribed(id)),
    )
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
        subscribed: isSubscribed(hashtag.id),
        publicQuizCount: available.filter(({ active }) =>
          active?.hashtagIds.includes(hashtag.id),
        ).length,
      })),
  };
}
