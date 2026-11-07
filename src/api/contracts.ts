import type { ProfileLinkKind } from "@/api/constants";
/** Public DTOs shared by the browser mock and future /api/v1 REST transport. */
import {
  Category,
  type DeskObject,
  QuizStatus,
  type ConversationRole,
  type LearningMode,
  type LearningState,
  type QuizScope,
  DiscoveryKind,
} from "@/api/constants";

export {
  Category,
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
  dailyCounts: { learningDate: string; count: number }[];
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  category: Category;
  price: number;
}

export type Equipment = Partial<Record<Category, string>>;

export interface DeskPosition {
  x: number;
  y: number;
}

export type DeskPositions = Partial<
  Record<Category, DeskPosition>
>;

export type DeskItem =
  | Exclude<Category, typeof Category.BACKGROUND>
  | DeskObject;

export type DeskOrder = DeskItem[];

export interface DeskTransform {
  x: number;
  y: number;
  z: number;
  rotationY: number;
}

export type DeskTransforms = Partial<
  Record<Category | DeskObject, DeskTransform>
>;

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
  positions: DeskPositions;
  transforms: DeskTransforms;
  order: DeskOrder;
}

export interface ProfileLink {
  kind: ProfileLinkKind;
  url: string;
  label?: string;
}

export interface ProfileAbout {
  biography: string;
  links: ProfileLink[];
}

export interface PublicProfile {
  user: User;
  equipment: Equipment;
  positions: DeskPositions;
  transforms: DeskTransforms;
  order: DeskOrder;
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

export interface DiscoveryQuery {
  subscribedOnly?: boolean;
  kind: DiscoveryKind;
  query: string;
  page: number;
  pageSize: number;
}

export type DiscoveryItem =
  | {
      type: typeof DiscoveryKind.USER;
      user: User;
      subscribed: boolean;
    }
  | {
      type: typeof DiscoveryKind.HASHTAG;
      hashtag: Hashtag;
      subscribed: boolean;
      publicQuizCount: number;
    };

export interface DiscoveryPage {
  items: DiscoveryItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DeveloperPageQuery {
  publicId: string;
  page: number;
  pageSize: number;
}

export interface DeveloperQuizzesPage {
  user: User;
  subscribed: boolean;
  items: {
    quizId: string;
    title: string;
    hashtagIds: string[];
    updatedAt: string;
  }[];
  page: number;
  pageSize: number;
  total: number;
}

export interface DeveloperTagsPage {
  items: (Hashtag & {
    quizCount: number;
    subscribed: boolean;
  })[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiOperations {
  guestQuiz: {
    request: Record<string, never>;
    response: LearningQuizView | null;
  };
  guestAnswer: {
    request: {
      quizId: string;
      revisionId: string;
      answer: Answer;
    };
    response: AttemptResult;
  };
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
  publishCandidate: {
    request: {
      batchId: string;
      candidateId: string;
      reviewed: true;
    };
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
  developerQuizzes: {
    request: DeveloperPageQuery & {
      hashtagId?: string | null;
    };
    response: DeveloperQuizzesPage;
  };
  developerTags: {
    request: DeveloperPageQuery & { query: string };
    response: DeveloperTagsPage;
  };
  searchDiscovery: {
    request: DiscoveryQuery;
    response: DiscoveryPage;
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
  moveEquipment: {
    request: {
      category: Category;
      productId: string;
      position: DeskPosition;
    };
    response: DeskPositions;
  };
  reorderDesk: {
    request: { order: DeskOrder };
    response: DeskOrder;
  };
  transformBugri: {
    request: { transform: DeskTransform };
    response: DeskTransforms;
  };
  transformEquipment: {
    request: {
      category: Category;
      productId: string;
      transform: DeskTransform;
    };
    response: DeskTransforms;
  };
  profileAbout: {
    request: { publicId: string };
    response: ProfileAbout;
  };
  updateProfileAbout: {
    request: ProfileAbout;
    response: ProfileAbout;
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
