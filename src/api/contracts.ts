import type {
  AttemptHistoryFilter,
  AttemptHistoryMatch,
  QuizStatus,
} from "@/api/constants";

export { QuizStatus } from "@/api/constants";

export interface Hashtag {
  id: string;
  name: string;
}

export interface User {
  userId: string;
  publicId: string;
  displayName: string;
}

export interface Choice {
  id: string;
  text: string;
}

export type Question =
  | {
      type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
      prompt: string;
      choices: Choice[];
    }
  | { type: "TRUE_FALSE" | "SHORT_ANSWER"; prompt: string };

export type Answer =
  | { type: "SINGLE_CHOICE"; choiceId: string }
  | { type: "MULTIPLE_CHOICE"; choiceIds: string[] }
  | { type: "TRUE_FALSE"; value: boolean }
  | { type: "SHORT_ANSWER"; text: string };

export interface QuizContent {
  title: string;
  question: Question;
  answer: Answer;
  explanation: string;
  hashtagIds: string[];
}

export interface Revision extends QuizContent {
  revisionId: string;
  /** Snapshot of the memo body the quiz was generated from. */
  sourceContent: string;
}

/** One LLM refinement turn kept with a PENDING quiz. */
export interface RefinementTurn {
  prompt: string;
  content: QuizContent;
}

/** Owner-only quiz detail. It may include answers and explanations. */
export interface ReviewQuiz {
  quizId: string;
  ownerUserId: string;
  noteId: string;
  status: QuizStatus;
  version: number;
  revision: Revision;
  /** LLM refinement turns; only a PENDING quiz can add to it. */
  history: RefinementTurn[];
  /** Set when the quiz becomes CONFIRMED; the review schedule starts from it. */
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningQuizView {
  quizId: string;
  revisionId: string;
  ownerUserId: string;
  title: string;
  question: Question;
  hashtagIds: string[];
}

export interface AttemptResult {
  submittedAnswer: Answer | null;
  correct: boolean | null;
  answer: Answer | null;
  explanation: string | null;
}

export interface AttemptView {
  attemptId: string;
  quizId: string;
  revisionId: string;
  quiz: LearningQuizView | null;
  completedAt: string | null;
  learningDate: string | null;
  timeZone: string | null;
  correct: boolean | null;
  result: AttemptResult | null;
}

export interface LearningDay {
  learningDate: string;
  timeZone: string;
  completed: boolean;
  streak: number;
  completedDates: string[];
  dailyCounts: { learningDate: string; count: number }[];
}

export interface VersionRequest {
  quizId: string;
  expectedVersion: number;
}

/** Aggregates over the memo's live linked quizzes. */
export interface NoteQuizCounts {
  confirmedCount: number;
  pendingCount: number;
  /** Union of the CONFIRMED quizzes' tags. */
  hashtagIds: string[];
}

/** Owner-only memo. */
export interface Note extends NoteQuizCounts {
  noteId: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteSummary extends NoteQuizCounts {
  noteId: string;
  /** First part of the body, for list rows. */
  excerpt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOperations {
  generate: {
    request: { noteId: string };
    /** The memo's new PENDING quizzes. */
    response: ReviewQuiz[];
  };
  notes: {
    request: { page?: number; pageSize?: number };
    response: {
      items: NoteSummary[];
      page: number;
      pageSize: number;
      total: number;
    };
  };
  note: {
    request: { noteId: string };
    response: Note;
  };
  createNote: {
    request: { content: string };
    response: Note;
  };
  updateNote: {
    request: {
      noteId: string;
      content: string;
      expectedVersion: number;
    };
    response: Note;
  };
  deleteNote: {
    request: { noteId: string };
    response: { deleted: true };
  };
  noteQuizzes: {
    request: { noteId: string; status: QuizStatus };
    response: ReviewQuiz[];
  };
  reviewQuiz: {
    request: { quizId: string };
    response: ReviewQuiz;
  };
  updateQuiz: {
    request: VersionRequest & { content: QuizContent };
    response: ReviewQuiz;
  };
  refineQuiz: {
    request: VersionRequest & { prompt: string };
    response: ReviewQuiz;
  };
  confirmQuiz: {
    request: VersionRequest;
    response: ReviewQuiz;
  };
  confirmNoteQuizzes: {
    request: { noteId: string };
    response: ReviewQuiz[];
  };
  deleteQuiz: {
    request: { quizId: string };
    response: { deleted: true };
  };
  hashtags: {
    request: Record<string, never>;
    response: Hashtag[];
  };
  learningDay: {
    request: Record<string, never>;
    response: LearningDay;
  };
  learningTimezone: {
    request: Record<string, never>;
    response: { timeZone: string | null };
  };
  attemptHistory: {
    request: {
      filter?: AttemptHistoryFilter;
      query?: string;
      page?: number;
      pageSize?: number;
    };
    response: {
      items: {
        attemptId: string;
        title: string | null;
        correct: boolean | null;
        completedAt: string;
        matchedIn: AttemptHistoryMatch | null;
        excerpt: string | null;
      }[];
      page: number;
      pageSize: number;
      total: number;
    };
  };
  startAttempt: {
    request: {
      quizId: string;
      context: "DIRECT";
    };
    response: AttemptView;
  };
  attempt: {
    request: { attemptId: string };
    response: AttemptView;
  };
  answer: {
    request: { attemptId: string; answer: Answer };
    response: AttemptView;
  };
}

export type Operation = keyof ApiOperations;

export type Request<K extends Operation> =
  ApiOperations[K]["request"];

export type Response<K extends Operation> =
  ApiOperations[K]["response"];

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VERSION_CONFLICT"
  | "QUIZ_UNAVAILABLE"
  | "ALREADY_ANSWERED"
  | "TIMEZONE_REQUIRED"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_CORRUPT"
  | "GENERATION_FAILED"
  | "INVALID_RESPONSE"
  | "NETWORK_ERROR"
  | "REQUEST_TIMEOUT"
  | "SERVER_ERROR"
  | "HTTP_ERROR";

export interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    fieldErrors?: Record<string, string>;
    requestId: string;
  };
}

export type Envelope<T> = { data: T } | ErrorBody;

export interface TransportResponse<T> {
  status: number;
  body: Envelope<T>;
}

export interface ApiTransport {
  request<K extends Operation>(
    operation: K,
    request: Request<K>,
  ): Promise<TransportResponse<Response<K>>>;
}
