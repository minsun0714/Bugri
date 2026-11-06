/** Public DTOs shared by the browser mock and future /api/v1 REST transport. */
import {
  QuizStatus,
  type LearningMode,
  type LearningState,
  type QuizScope,
} from "@/api/constants";

export {
  QuizStatus,
  LearningMode,
  LearningState,
  QuizScope,
} from "@/api/constants";

export type Visibility = Exclude<
  QuizStatus,
  typeof QuizStatus.PENDING
>;

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

export interface GenerationBatch {
  batchId: string;
  sourceContent: string;
  candidates: {
    candidateId: string;
    content: QuizContent;
    savedQuizId: string | null;
  }[];
}

export type SubscriptionTarget =
  | { type: "PERSON"; authorUserId: string }
  | { type: "HASHTAG"; hashtagId: string }
  | {
      type: "PERSON_HASHTAG";
      authorUserId: string;
      hashtagId: string;
    };

export type Subscription = SubscriptionTarget & {
  subscriptionId: string;
};

export interface LearningQuery {
  hashtagId?: string | null;
  mode?: LearningMode;
}

export interface LearningSelection {
  hashtagId: string | null;
  mode: LearningMode;
  state: LearningState;
  quiz: LearningQuizView | null;
  candidateCount: number;
}

export interface AttemptResult {
  submittedAnswer: Answer;
  correct: boolean;
  answer: Answer;
  explanation: string;
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
}

export type Category =
  | "KEYBOARD"
  | "MONITOR"
  | "DESK"
  | "ACCESSORY"
  | "BACKGROUND";

export interface Product {
  productId: string;
  name: string;
  description: string;
  category: Category;
  price: number;
}

export type Equipment = Partial<Record<Category, string>>;

export interface LedgerEntry {
  id: string;
  amount: number;
  reason: "SEED" | "DAILY_COMPLETION" | "PURCHASE";
  reference: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  ledger: LedgerEntry[];
}

export interface Purchase {
  purchaseId: string;
  productId: string;
  requestKey: string;
  price: number;
  purchasedAt: string;
}

export interface Inventory {
  products: Product[];
  equipment: Equipment;
}

export interface PublicProfile {
  user: User;
  equipment: Equipment;
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

export interface ApiOperations {
  generate: {
    request: { sourceContent: string };
    response: GenerationBatch;
  };
  generationBatch: {
    request: { batchId: string };
    response: GenerationBatch;
  };
  saveBatch: {
    request: { batchId: string } & (
      | { mode: "SINGLE"; candidateId: string }
      | { mode: "ALL" }
    );
    response: ReviewQuiz[];
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
    request: VersionRequest & { visibility?: Visibility };
    response: ReviewQuiz;
  };
  visibility: {
    request: VersionRequest & { visibility: Visibility };
    response: ReviewQuiz;
  };
  deleteQuiz: {
    request: { quizId: string };
    response: { deleted: true };
  };
  subscriptions: {
    request: Record<string, never>;
    response: Subscription[];
  };
  subscribe: {
    request: SubscriptionTarget;
    response: Subscription;
  };
  unsubscribe: {
    request: { subscriptionId: string };
    response: { deleted: true };
  };
  discoverUsers: {
    request: Record<string, never>;
    response: User[];
  };
  discoverHashtags: {
    request: Record<string, never>;
    response: Hashtag[];
  };
  learningTags: {
    request: { authorUserId?: string };
    response: Hashtag[];
  };
  learningQuiz: {
    request: LearningQuery;
    response: LearningSelection;
  };
  learningNext: {
    request: LearningQuery;
    response: LearningSelection;
  };
  learningDay: {
    request: Record<string, never>;
    response: LearningDay;
  };
  learningTimezone: {
    request: Record<string, never>;
    response: { timeZone: string | null };
  };
  updateTimezone: {
    request: { timeZone: string };
    response: { timeZone: string };
  };
  startAttempt: {
    request: {
      quizId: string;
      context: "DIRECT" | "LEARNING";
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
  products: {
    request: { category?: Category };
    response: Product[];
  };
  wallet: {
    request: Record<string, never>;
    response: Wallet;
  };
  purchase: {
    request: { productId: string; requestKey: string };
    response: Purchase;
  };
  inventory: {
    request: Record<string, never>;
    response: Inventory;
  };
  equip: {
    request: {
      category: Category;
      productId: string | null;
    };
    response: Equipment;
  };
  publicProfile: {
    request: { publicId: string };
    response: PublicProfile;
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
  | "INSUFFICIENT_BALANCE"
  | "ALREADY_OWNED"
  | "IDEMPOTENCY_CONFLICT"
  | "TIMEZONE_REQUIRED"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_CORRUPT"
  | "GENERATION_FAILED"
  | "INVALID_RESPONSE"
  | "NETWORK_ERROR";

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
