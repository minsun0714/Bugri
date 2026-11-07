import { QuizStatus } from "@/api/constants";
import type {
  DeveloperPageQuery,
  DeveloperQuizzesPage,
  DeveloperTagsPage,
  Hashtag,
  Subscription,
  User,
} from "@/api/contracts";
import type { StoredQuiz } from "@/services/state";
import {
  requireValue,
  ServiceError,
} from "@/services/validation";

interface Source {
  users: readonly User[];
  hashtags: readonly Hashtag[];
  quizzes: readonly StoredQuiz[];
  subscriptions: readonly Subscription[];
}

function catalog(
  { users, quizzes }: Source,
  { publicId, page, pageSize }: DeveloperPageQuery,
) {
  requireValue(
    typeof publicId === "string" && !!publicId.trim(),
    "개발자를 지정하세요.",
  );

  requireValue(
    Number.isSafeInteger(page) && page > 0,
    "페이지를 확인하세요.",
  );

  requireValue(
    Number.isSafeInteger(pageSize) &&
      pageSize > 0 &&
      pageSize <= 50,
    "페이지 크기는 1~50이어야 합니다.",
  );

  const user = users.find(
    (candidate) => candidate.publicId === publicId,
  );

  if (!user)
    throw new ServiceError(
      "NOT_FOUND",
      "개발자를 찾을 수 없습니다.",
      404,
    );

  const available = quizzes.filter(
    (quiz) =>
      quiz.ownerUserId === user.userId &&
      quiz.status === QuizStatus.PUBLIC &&
      !quiz.deletedAt &&
      quiz.active,
  );

  return { user, available };
}

const compare = (a: string, b: string) =>
  a < b ? -1 : a > b ? 1 : 0;

export function developerQuizzes(
  source: Source,
  request: DeveloperPageQuery & {
    hashtagId?: string | null;
  },
): DeveloperQuizzesPage {
  const { user, available } = catalog(source, request);
  const { page, pageSize, hashtagId } = request;

  requireValue(
    hashtagId == null || typeof hashtagId === "string",
    "태그를 확인하세요.",
  );

  const found = available
    .filter(
      ({ active }) =>
        !hashtagId ||
        active!.hashtagIds.includes(hashtagId),
    )
    .sort((a, b) => {
      const publishedA = a.publishedAt
        ? Date.parse(a.publishedAt)
        : -Infinity;

      const publishedB = b.publishedAt
        ? Date.parse(b.publishedAt)
        : -Infinity;

      return (
        publishedB - publishedA ||
        compare(a.quizId, b.quizId)
      );
    });

  return {
    user,
    subscribed: source.subscriptions.some(
      (sub) =>
        sub.type === "PERSON" &&
        sub.authorUserId === user.userId,
    ),
    page,
    pageSize,
    total: found.length,
    items: found
      .slice((page - 1) * pageSize, page * pageSize)
      .map(({ quizId, active, updatedAt }) => ({
        quizId,
        title: active!.title,
        hashtagIds: [...active!.hashtagIds],
        updatedAt,
      })),
  };
}

export function developerTags(
  source: Source,
  request: DeveloperPageQuery & { query: string },
): DeveloperTagsPage {
  const { user, available } = catalog(source, request);
  const { query, page, pageSize } = request;

  requireValue(
    typeof query === "string" &&
      Array.from(query).length <= 100,
    "태그 검색어는 100자 이하여야 합니다.",
  );

  const term = query.trim().normalize("NFC").toLowerCase();
  const counts = new Map<string, number>();

  for (const { active } of available) {
    for (const id of active!.hashtagIds)
      counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const found = source.hashtags
    .filter(
      ({ id, name }) =>
        counts.has(id) &&
        [id, name].some((value) =>
          value
            .normalize("NFC")
            .toLowerCase()
            .includes(term),
        ),
    )
    .sort((a, b) => compare(a.id, b.id));

  return {
    page,
    pageSize,
    total: found.length,
    items: found
      .slice((page - 1) * pageSize, page * pageSize)
      .map(({ id, name }) => ({
        id,
        name,
        quizCount: counts.get(id)!,
        subscribed: source.subscriptions.some(
          (sub) =>
            sub.type === "PERSON_HASHTAG" &&
            sub.authorUserId === user.userId &&
            sub.hashtagId === id,
        ),
      })),
  };
}
