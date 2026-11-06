import type {
  LearningQuizView,
  Subscription,
} from "../api/contracts";
import type { StoredQuiz } from "./state";
export function publicView(
  quiz: StoredQuiz,
): LearningQuizView {
  const r = quiz.active!;
  return {
    quizId: quiz.quizId,
    ownerUserId: quiz.ownerUserId,
    revisionId: r.revisionId,
    title: r.title,
    question: r.question,
    hashtagIds: r.hashtagIds,
  };
}
export function candidates(
  quizzes: StoredQuiz[],
  subscriptions: Subscription[],
  hashtagId?: string | null,
): StoredQuiz[] {
  return quizzes.filter(
    (q) =>
      !q.deletedAt &&
      q.status === "PUBLIC" &&
      q.active &&
      (!hashtagId ||
        q.active.hashtagIds.includes(hashtagId)) &&
      subscriptions.some(
        (s) =>
          (s.type === "HASHTAG" ||
            s.authorUserId === q.ownerUserId) &&
          (s.type === "PERSON" ||
            q.active!.hashtagIds.includes(s.hashtagId)),
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
    .map(
      (type) => parts.find((p) => p.type === type)!.value,
    )
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
