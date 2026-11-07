import { QuizStatus } from "@/api/constants";
import type {
  Hashtag,
  User,
  Subscription,
  Request,
  TagQuizzesPage,
} from "@/api/contracts";
import type { StoredQuiz } from "@/services/state";
import {
  requireValue,
  ServiceError,
} from "@/services/validation";

export function tagQuizzes(
  {
    hashtags,
    users,
    quizzes,
    subscriptions,
  }: {
    hashtags: readonly Hashtag[];
    users: readonly User[];
    quizzes: readonly StoredQuiz[];
    subscriptions: readonly Subscription[];
  },
  { hashtagId, page, pageSize }: Request<"tagQuizzes">,
): TagQuizzesPage {
  requireValue(
    typeof hashtagId === "string" && !!hashtagId.trim(),
    "태그를 지정하세요.",
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

  const hashtag = hashtags.find(
    ({ id }) => id === hashtagId,
  );

  if (!hashtag)
    throw new ServiceError(
      "NOT_FOUND",
      "태그를 찾을 수 없습니다.",
      404,
    );

  const found = quizzes
    .filter(
      ({ status, deletedAt, active, ownerUserId }) =>
        status === QuizStatus.PUBLIC &&
        !deletedAt &&
        active?.hashtagIds.includes(hashtagId) &&
        users.some(({ userId }) => userId === ownerUserId),
    )
    .sort((a, b) => {
      const timeA = a.publishedAt
        ? Date.parse(a.publishedAt)
        : -Infinity;

      const timeB = b.publishedAt
        ? Date.parse(b.publishedAt)
        : -Infinity;

      return (
        timeB - timeA ||
        (a.quizId < b.quizId
          ? -1
          : a.quizId > b.quizId
            ? 1
            : 0)
      );
    });

  return {
    hashtag,
    subscribed: subscriptions.some(
      (sub) =>
        sub.type === "HASHTAG" &&
        sub.hashtagId === hashtagId,
    ),
    page,
    pageSize,
    total: found.length,
    items: found
      .slice((page - 1) * pageSize, page * pageSize)
      .map(({ quizId, active, ownerUserId }) => ({
        quizId,
        title: active!.title,
        author: users.find(
          ({ userId }) => userId === ownerUserId,
        )!,
      })),
  };
}
