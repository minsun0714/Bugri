/** Wire values are stable: changing them requires an API/storage migration. */
export const QuizStatus = {
  PENDING: "PENDING",
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
} as const;

export type QuizStatus =
  (typeof QuizStatus)[keyof typeof QuizStatus];

/** List scope is distinct from a quiz's publication status. */
export const QuizScope = {
  OWN: "OWN",
} as const;

export type QuizScope =
  (typeof QuizScope)[keyof typeof QuizScope];

export const ConversationRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
} as const;

export type ConversationRole =
  (typeof ConversationRole)[keyof typeof ConversationRole];

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
