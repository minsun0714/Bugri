import { QuizStatus } from "@/api/constants";
import type { QuizContent } from "@/api/contracts";
import {
  generatedContents,
  historyDemoContents,
} from "@/mocks/quizzes";
import type {
  StoredNote,
  StoredQuiz,
} from "@/services/state";

const seededAt = "2026-11-08T00:00:00.000Z";

const sourceByNote: Record<string, string> = {
  "seed-note-learner-confirmed":
    "제네릭, 클로저, Promise, HTTP 메서드, 이벤트 루프를 복습한다.",
  "seed-note-learner-pending":
    "TypeScript 숫자 타입, 블록 스코프, HTTP 요청과 응답을 정리한 메모.",
  "seed-note-learner-empty":
    "오늘 배운 내용을 아직 퀴즈로 만들지 않았다.",
  "seed-note-author":
    "TypeScript 타입 선언과 let, const 블록 스코프 메모.",
  "seed-note-friend": "HTTP 요청·응답과 const 재할당 메모.",
};

const seedNote = (noteId: string): StoredNote => ({
  noteId,
  content: sourceByNote[noteId],
  version: 1,
  createdAt: seededAt,
  updatedAt: seededAt,
  deletedAt: null,
});

const seedQuiz = (
  quizId: string,
  noteId: string,
  ownerUserId: string,
  content: QuizContent,
  status: QuizStatus,
): StoredQuiz => ({
  quizId,
  ownerUserId,
  noteId,
  status,
  version: 1,
  revision: {
    ...content,
    revisionId: `${quizId}-revision`,
    sourceContent: sourceByNote[noteId],
  },
  history: [],
  confirmedAt:
    status === QuizStatus.CONFIRMED ? seededAt : null,
  createdAt: seededAt,
  updatedAt: seededAt,
  deletedAt: null,
});

/** Ids seed-quiz-5..12 are referenced by the optional solving-history demo. */
const learnerConfirmed = historyDemoContents.map(
  (content, index) =>
    seedQuiz(
      `seed-quiz-${generatedContents.length + index + 1}`,
      "seed-note-learner-confirmed",
      "learner",
      content,
      QuizStatus.CONFIRMED,
    ),
);

const learnerPending = [0, 2].map((index) =>
  seedQuiz(
    `seed-pending-${index + 1}`,
    "seed-note-learner-pending",
    "learner",
    generatedContents[index],
    QuizStatus.PENDING,
  ),
);

/** Read-only dummy data per user. initialState clones it, so it is never mutated. */
export const seeds: Record<
  string,
  { notes: StoredNote[]; quizzes: StoredQuiz[] }
> = {
  learner: {
    notes: [
      "seed-note-learner-confirmed",
      "seed-note-learner-pending",
      "seed-note-learner-empty",
    ].map(seedNote),
    quizzes: [...learnerConfirmed, ...learnerPending],
  },
  author: {
    notes: [seedNote("seed-note-author")],
    quizzes: [0, 1].map((index) =>
      seedQuiz(
        `seed-quiz-${index + 1}`,
        "seed-note-author",
        "author",
        generatedContents[index],
        QuizStatus.CONFIRMED,
      ),
    ),
  },
  friend: {
    notes: [seedNote("seed-note-friend")],
    quizzes: [2, 3].map((index) =>
      seedQuiz(
        `seed-quiz-${index + 1}`,
        "seed-note-friend",
        "friend",
        generatedContents[index],
        QuizStatus.CONFIRMED,
      ),
    ),
  },
};

export interface SeedReviewPlan {
  quizId: string;
  /** Index into the 1 → 3 → 7 → 14 → 30 day intervals. */
  stage: number;
  /** Days from the day the state is first created; negative means overdue. */
  dueInDays: number;
  lastCorrect: boolean | null;
}

/**
 * Review schedules relative to the day a user's state is first created, so the demo always shows
 * what is due today, overdue and due tomorrow. The author and friend have nothing due today.
 */
export const seedReviewPlans: Record<
  string,
  SeedReviewPlan[]
> = {
  learner: [
    // Overdue by 3 days, last answered correctly.
    { quizId: "seed-quiz-5", stage: 2, dueInDays: -3, lastCorrect: true },
    // Overdue by 1 day, answered wrong last time: comes first.
    { quizId: "seed-quiz-6", stage: 0, dueInDays: -1, lastCorrect: false },
    // Due today.
    { quizId: "seed-quiz-7", stage: 1, dueInDays: 0, lastCorrect: true },
    { quizId: "seed-quiz-8", stage: 0, dueInDays: 0, lastCorrect: null },
    // Due tomorrow.
    { quizId: "seed-quiz-9", stage: 2, dueInDays: 1, lastCorrect: true },
    { quizId: "seed-quiz-10", stage: 0, dueInDays: 1, lastCorrect: false },
    // Later.
    { quizId: "seed-quiz-11", stage: 3, dueInDays: 5, lastCorrect: true },
    { quizId: "seed-quiz-12", stage: 4, dueInDays: 12, lastCorrect: true },
  ],
  author: [
    { quizId: "seed-quiz-1", stage: 0, dueInDays: 1, lastCorrect: null },
    { quizId: "seed-quiz-2", stage: 1, dueInDays: 4, lastCorrect: true },
  ],
  friend: [
    { quizId: "seed-quiz-3", stage: 1, dueInDays: 2, lastCorrect: true },
    { quizId: "seed-quiz-4", stage: 2, dueInDays: 6, lastCorrect: true },
  ],
};
