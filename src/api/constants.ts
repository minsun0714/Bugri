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
