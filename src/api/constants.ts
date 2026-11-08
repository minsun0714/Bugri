/** Wire values are stable: changing them requires an API/storage migration. */
export const QuizStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
} as const;

export type QuizStatus =
  (typeof QuizStatus)[keyof typeof QuizStatus];

export const AttemptHistoryFilter = {
  ALL: "ALL",
  CORRECT: "CORRECT",
  INCORRECT: "INCORRECT",
} as const;

export type AttemptHistoryFilter =
  (typeof AttemptHistoryFilter)[keyof typeof AttemptHistoryFilter];

/** Where a history search query matched; null when no query was given. */
export const AttemptHistoryMatch = {
  TITLE: "TITLE",
  BODY: "BODY",
} as const;

export type AttemptHistoryMatch =
  (typeof AttemptHistoryMatch)[keyof typeof AttemptHistoryMatch];
