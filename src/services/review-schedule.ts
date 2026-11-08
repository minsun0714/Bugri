import { localDate } from "@/services/learning";

/** PRD AC-03b: days until the next review after each consecutive correct answer. */
export const reviewIntervals = [1, 3, 7, 14, 30] as const;

const lastStage = reviewIntervals.length - 1;

const dayMs = 86_400_000;

export interface ReviewStep {
  /** Index into `reviewIntervals` of the interval just used. */
  stage: number;
  nextReviewDate: string;
}

export interface ReviewOutcome extends ReviewStep {
  intervalDays: number;
}

/** Calendar arithmetic on YYYY-MM-DD strings. Noon UTC keeps it independent of any zone or DST. */
export function addDays(
  date: string,
  days: number,
): string {
  return new Date(
    Date.parse(`${date}T12:00:00Z`) + days * dayMs,
  )
    .toISOString()
    .slice(0, 10);
}

/** Signed number of calendar days from `from` to `to`. */
export function dateDistance(
  from: string,
  to: string,
): number {
  return Math.round(
    (Date.parse(`${to}T12:00:00Z`) -
      Date.parse(`${from}T12:00:00Z`)) /
      dayMs,
  );
}

/** The first review is the day after the quiz was confirmed, in the learner's zone at that time. */
export function firstReview(
  confirmedAt: string | Date,
  timeZone: string,
): ReviewStep {
  return {
    stage: 0,
    nextReviewDate: addDays(
      localDate(new Date(confirmedAt), timeZone),
      reviewIntervals[0],
    ),
  };
}

/** Pure schedule step after a review done on `date` (the learning date of the answer). */
export function nextReview({
  stage,
  correct,
  date,
}: {
  stage: number;
  correct: boolean;
  date: string;
}): ReviewOutcome {
  const next = correct ? Math.min(stage + 1, lastStage) : 0;

  const { [next]: intervalDays } = reviewIntervals;

  return {
    stage: next,
    intervalDays,
    nextReviewDate: addDays(date, intervalDays),
  };
}
