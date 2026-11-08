import type {
  Answer,
  Note,
  NoteQuizCounts,
  ReviewQuiz,
  Revision,
} from "@/api/contracts";

/** Soft delete keeps completed Attempts readable. */
export interface StoredQuiz extends ReviewQuiz {
  deletedAt: string | null;
}

export interface StoredNote extends Omit<
  Note,
  keyof NoteQuizCounts
> {
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
  schemaVersion: 2;
  notes: StoredNote[];
  userId: string;
  quizzes: StoredQuiz[];
  attempts: StoredAttempt[];
  days: StoredDay[];
  timeZone: string | null;
}
