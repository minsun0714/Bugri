import type {
  AttemptHistoryFilter,
  AttemptHistoryMatch,
  ConversationRole,
  QuizScope,
  QuizStatus,
} from "@/api/constants";

export { QuizScope, QuizStatus } from "@/api/constants";

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
  sourceContent: string;
  reviewed: boolean;
  followUpPrompt?: string;
}

export interface ReviewQuiz {
  createdAt?: string;
  publishedAt?: string;
  quizId: string;
  ownerUserId: string;
  status: QuizStatus;
  version: number;
  active: Revision | null;
  pending: Revision | null;
  updatedAt: string;
}

export interface QuizSummary {
  quizId: string;
  ownerUserId: string;
  title: string;
  status: QuizStatus;
  hashtagIds: string[];
  updatedAt: string;
  hasPendingRevision: boolean;
}

export interface LearningQuizView {
  quizId: string;
  revisionId: string;
  ownerUserId: string;
  title: string;
  question: Question;
  hashtagIds: string[];
}

export interface AuthoringMessage {
  messageId: string;
  role: ConversationRole;
  content: string;
}

export interface AuthoringConversation {
  version: number;
  messages: AuthoringMessage[];
  draft: string;
  latestBatchId: string | null;
}

export interface GenerationBatch {
  batchId: string;
  sourceContent: string;
  candidates: {
    candidateId: string;
    content: QuizContent;
    savedQuizId: string | null;
    history?: { prompt: string; content: QuizContent }[];
  }[];
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

export type PendingRequest = VersionRequest &
  (
    | {
        action: "EDIT";
        sourceContent: string;
        content: QuizContent;
      }
    | { action: "MARK_REVIEWED" }
  );

/** Owner-only memo. Tags and linked quizzes arrive with the note-to-quiz task. */
export interface Note {
  noteId: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoteSummary {
  noteId: string;
  /** First part of the body, for list rows. */
  excerpt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOperations {
  authoringConversation: {
    request: Record<string, never>;
    response: AuthoringConversation;
  };
  sendAuthoringMessage: {
    request: { content: string; expectedVersion: number };
    response: AuthoringConversation;
  };
  generateFromConversation: {
    request: { draft: string; expectedVersion: number };
    response: {
      conversation: AuthoringConversation;
      batch: GenerationBatch;
    };
  };
  generate: {
    request: { sourceContent: string };
    response: GenerationBatch;
  };
  generationBatch: {
    request: { batchId: string };
    response: GenerationBatch;
  };
  editCandidate: {
    request: {
      batchId: string;
      candidateId: string;
      content: QuizContent;
    };
    response: GenerationBatch;
  };
  refineCandidate: {
    request: {
      batchId: string;
      candidateId: string;
      prompt: string;
    };
    response: GenerationBatch;
  };
  deleteCandidate: {
    request: {
      batchId: string;
      candidateId: string;
    };
    response: GenerationBatch;
  };
  saveBatch: {
    request: { batchId: string } & (
      | { mode: "SINGLE"; candidateId: string }
      | { mode: "ALL" }
    );
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
  quizzes: {
    request: { scope: QuizScope };
    response: QuizSummary[];
  };
  reviewQuiz: {
    request: { quizId: string };
    response: ReviewQuiz;
  };
  updatePending: {
    request: PendingRequest;
    response: ReviewQuiz;
  };
  regenerate: {
    request: VersionRequest & { prompt: string };
    response: ReviewQuiz;
  };
  approve: {
    request: VersionRequest & {};
    response: ReviewQuiz;
  };
  deleteQuiz: {
    request: { quizId: string };
    response: { deleted: true };
  };
  discoverHashtags: {
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
  | "NOT_REVIEWED"
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
