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

export const Category = {
  KEYBOARD: "KEYBOARD",
  MONITOR: "MONITOR",
  DESK: "DESK",
  ACCESSORY: "ACCESSORY",
  BACKGROUND: "BACKGROUND",
} as const;

export type Category =
  (typeof Category)[keyof typeof Category];

export const DeskTool = {
  CAMERA: "camera",
  MOVE: "move",
  ROTATE: "rotate",
  HEIGHT: "height",
} as const;

export type DeskTool =
  (typeof DeskTool)[keyof typeof DeskTool];

export const DeskView = {
  ANGLED: "angled",
  FRONT: "front",
  TOP: "top",
} as const;

export type DeskView =
  (typeof DeskView)[keyof typeof DeskView];

/** Resident scene objects are not purchasable product categories. */
export const DeskObject = { BUGRI: "BUGRI" } as const;

export type DeskObject =
  (typeof DeskObject)[keyof typeof DeskObject];

export const LayerAction = {
  FORWARD: "FORWARD",
  BACKWARD: "BACKWARD",
  FRONT: "FRONT",
  BACK: "BACK",
} as const;

export type LayerAction =
  (typeof LayerAction)[keyof typeof LayerAction];

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

export const ProfileLinkKind = {
  GITHUB: "GITHUB",
  BLOG: "BLOG",
  PORTFOLIO: "PORTFOLIO",
  LINKEDIN: "LINKEDIN",
  OTHER: "OTHER",
} as const;

export type ProfileLinkKind =
  (typeof ProfileLinkKind)[keyof typeof ProfileLinkKind];

export const QuizReaction = {
  LIKE: "LIKE",
  DISLIKE: "DISLIKE",
} as const;

export type QuizReaction =
  (typeof QuizReaction)[keyof typeof QuizReaction];

export const ProfileSection = {
  DESK: "DESK",
  QUIZZES: "QUIZZES",
  ACTIVITY: "ACTIVITY",
} as const;

export type ProfileSection =
  (typeof ProfileSection)[keyof typeof ProfileSection];

export const RewardReason = {
  FIRST_CORRECT: "FIRST_CORRECT",
  RETRY_CORRECT: "RETRY_CORRECT",
  DAILY_CORRECT: "DAILY_CORRECT",
  REVIEW: "REVIEW",
  CREATOR: "CREATOR",
} as const;

export type RewardReason =
  (typeof RewardReason)[keyof typeof RewardReason];

export const RewardNonPaymentReason = {
  INCORRECT: "INCORRECT",
  REVIEW_WAIT: "REVIEW_WAIT",
  OWNER_WAIT: "OWNER_WAIT",
  CREATION_UNKNOWN: "CREATION_UNKNOWN",
  LEGACY_CORRECT: "LEGACY_CORRECT",
  DAILY_ALREADY_PAID: "DAILY_ALREADY_PAID",
} as const;

export type RewardNonPaymentReason =
  (typeof RewardNonPaymentReason)[keyof typeof RewardNonPaymentReason];

export const AttemptHistoryFilter = {
  ALL: "ALL",
  CORRECT: "CORRECT",
  INCORRECT: "INCORRECT",
} as const;

export type AttemptHistoryFilter =
  (typeof AttemptHistoryFilter)[keyof typeof AttemptHistoryFilter];
