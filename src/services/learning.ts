import type {
  LearningQuizView,
  Question,
} from "@/api/contracts";
import type {
  StoredAttempt,
  StoredQuiz,
} from "@/services/state";

export function questionKey(question: Question): string {
  return JSON.stringify(question);
}

export function publicView({
  quizId,
  ownerUserId,
  revision,
}: StoredQuiz): LearningQuizView {
  const { revisionId, title, question, hashtagIds } =
    revision;

  return {
    quizId,
    ownerUserId,
    revisionId,
    title,
    question,
    hashtagIds,
  };
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

/** Count completed distinct quizzes within each original learning date. */
export function dailyQuizCounts(
  attempts: StoredAttempt[],
): { learningDate: string; count: number }[] {
  const days = new Map<string, Set<string>>();

  for (const {
    completedAt,
    learningDate,
    quizId,
  } of attempts) {
    if (!completedAt || !learningDate) continue;

    const quizzes =
      days.get(learningDate) ?? new Set<string>();

    quizzes.add(quizId);
    days.set(learningDate, quizzes);
  }

  return [...days.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([learningDate, quizzes]) => ({
      learningDate,
      count: quizzes.size,
    }));
}
