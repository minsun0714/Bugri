import type { AttemptContext } from "@/api/constants";
import type {
  Answer,
  NextReview,
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
  /** Absent in older data; it means DIRECT. */
  context?: AttemptContext;
  /** Schedule this REVIEW submission wrote, kept so a reload shows the same result. */
  nextReview?: NextReview | null;
}

/** Per-quiz review schedule. A missing entry is computed from `confirmedAt`. */
export interface StoredReviewSchedule {
  quizId: string;
  /** Index into the 1 → 3 → 7 → 14 → 30 day intervals. */
  stage: number;
  nextReviewDate: string;
  /** Result of the latest review; null before the first one. */
  lastCorrect: boolean | null;
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
  /** Optional so schemaVersion 2 data written before review schedules still reads. */
  reviewSchedules?: StoredReviewSchedule[];
}
