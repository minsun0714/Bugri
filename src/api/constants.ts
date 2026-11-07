/** Wire values are stable: changing them requires an API/storage migration. */
export const QuizStatus = {
  PENDING: "PENDING",
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
} as const;

export type QuizStatus =
  (typeof QuizStatus)[keyof typeof QuizStatus];

export const LearningMode = {
  UNSOLVED: "UNSOLVED",
  REPLAY: "REPLAY",
} as const;

export type LearningMode =
  (typeof LearningMode)[keyof typeof LearningMode];

export const LearningState = {
  AVAILABLE: "AVAILABLE",
  EMPTY: "EMPTY",
  EXHAUSTED: "EXHAUSTED",
  NO_REPLAY: "NO_REPLAY",
} as const;

export type LearningState =
  (typeof LearningState)[keyof typeof LearningState];

/** List scope is distinct from a quiz's publication status. */
export const QuizScope = {
  OWN: "OWN",
  PUBLIC: "PUBLIC",
} as const;

export type QuizScope =
  (typeof QuizScope)[keyof typeof QuizScope];

export const DiscoveryKind = {
  USER: "USER",
  HASHTAG: "HASHTAG",
} as const;

export type DiscoveryKind =
  (typeof DiscoveryKind)[keyof typeof DiscoveryKind];

export const ConversationRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
} as const;

export type ConversationRole =
  (typeof ConversationRole)[keyof typeof ConversationRole];
