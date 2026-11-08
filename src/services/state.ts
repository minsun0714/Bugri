import type { QuizReaction } from "@/api/constants";
import type {
  RewardGrant,
  RewardOutcome,
  ProfileAbout,
  ProfileOrder,
  Answer,
  AuthoringConversation,
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
  rewardOutcome?: RewardOutcome;
  attemptId: string;
  quizId: string;
  revision: Omit<
    Revision,
    "title" | "answer" | "explanation"
  > & {
    [Field in "title" | "answer" | "explanation"]?:
      Revision[Field] | null;
  };
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
  rewards?: RewardGrant[];
  quizReactions?: {
    quizId: string;
    reaction: QuizReaction;
  }[];
  profileAbout?: ProfileAbout;
  profileOrder?: ProfileOrder;
  /** One-time mock fixture upgrade; absent in older v1 snapshots. */
  learningDemoVersion?: 1;
  coinHistoryDemoVersion?: 1;
  authoringConversation?: AuthoringConversation;
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
