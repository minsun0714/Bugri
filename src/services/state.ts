import type {
  Answer,
  AuthoringConversation,
  GenerationBatch,
  Note,
  ReviewQuiz,
  Revision,
} from "@/api/contracts";

export interface StoredQuiz extends ReviewQuiz {
  deletedAt: string | null;
}

export interface StoredNote extends Note {
  deletedAt: string | null;
}

export interface StoredAttempt {
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
  /** Set once the optional history search demo fixtures were merged. */
  historyDemoVersion?: 1;
  authoringConversation?: AuthoringConversation;
  /** Absent in snapshots written before notes existed; treated as an empty list. */
  notes?: StoredNote[];
  userId: string;
  quizzes: StoredQuiz[];
  batches: GenerationBatch[];
  attempts: StoredAttempt[];
  days: StoredDay[];
  timeZone: string | null;
}
