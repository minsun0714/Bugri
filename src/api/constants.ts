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

/** How a solving attempt was entered. Only REVIEW attempts move the review schedule. */
export const AttemptContext = {
  DIRECT: "DIRECT",
  REVIEW: "REVIEW",
} as const;

export type AttemptContext =
  (typeof AttemptContext)[keyof typeof AttemptContext];

/** Where a memo search query matched; null when no query was given. */
export const NoteMatch = {
  BODY: "BODY",
  QUIZ: "QUIZ",
} as const;

export type NoteMatch =
  (typeof NoteMatch)[keyof typeof NoteMatch];
