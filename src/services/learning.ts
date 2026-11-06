import type {
  LearningQuizView,
  Subscription,
} from "@/api/contracts";
import type { StoredQuiz } from "@/services/state";

export function publicView({
  quizId,
  ownerUserId,
  active,
}: StoredQuiz): LearningQuizView {
  const { revisionId, title, question, hashtagIds } =
    active!;

  return {
    quizId,
    ownerUserId,
    revisionId,
    title,
    question,
    hashtagIds,
  };
}

export function candidates(
  quizzes: StoredQuiz[],
  subscriptions: Subscription[],
  hashtagId?: string | null,
): StoredQuiz[] {
  return quizzes.filter(
    ({ deletedAt, status, active, ownerUserId }) =>
      !deletedAt &&
      status === "PUBLIC" &&
      active &&
      (!hashtagId ||
        active.hashtagIds.includes(hashtagId)) &&
      subscriptions.some(
        (s) =>
          (s.type === "HASHTAG" ||
            s.authorUserId === ownerUserId) &&
          (s.type === "PERSON" ||
            active.hashtagIds.includes(s.hashtagId)),
      ),
  );
}

export function localDate(
  date: Date,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return ["year", "month", "day"]
    .map((type) => {
      const { value } = parts.find(
        ({ type: partType }) => partType === type,
      )!;

      return value;
    })
    .join("-");
}

export function previousDate(date: string): string {
  return new Date(
    Date.parse(`${date}T12:00:00Z`) - 86400000,
  )
    .toISOString()
    .slice(0, 10);
}

export function streak(
  dates: string[],
  today: string,
): number {
  const completed = new Set(dates);

  let cursor = completed.has(today)
    ? today
    : previousDate(today);

  let count = 0;

  while (completed.has(cursor)) {
    count++;
    cursor = previousDate(cursor);
  }

  return count;
}
