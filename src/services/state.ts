import type {
  Answer,
  Equipment,
  DeskPositions,
  DeskTransforms,
  DeskOrder,
  GenerationBatch,
  LedgerEntry,
  LearningQuery,
  Purchase,
  ReviewQuiz,
  Revision,
  Subscription,
} from "@/api/contracts";

export interface StoredQuiz extends ReviewQuiz {
  deletedAt: string | null;
}

export interface StoredAttempt {
  attemptId: string;
  quizId: string;
  revision: Revision;
  ownerUserId: string;
  submittedAnswer: Answer | null;
  correct: boolean | null;
  completedAt: string | null;
  learningDate: string | null;
  timeZone: string | null;
}

export interface StoredDay {
  learningDate: string;
  timeZone: string;
  completedAt: string;
}

export interface UserState {
  schemaVersion: 1;
  userId: string;
  quizzes: StoredQuiz[];
  batches: GenerationBatch[];
  subscriptions: Subscription[];
  attempts: StoredAttempt[];
  days: StoredDay[];
  timeZone: string | null;
  selection: Required<LearningQuery> & {
    quizId: string | null;
  };
  ledger: LedgerEntry[];
  purchases: Purchase[];
  equipment: Equipment;
  positions: DeskPositions;
  transforms: DeskTransforms;
  order: DeskOrder;
}
