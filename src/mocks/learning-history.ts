import type { Answer } from "@/api/contracts";
import { seeds } from "@/mocks/seed";
import type {
  StoredAttempt,
  StoredDay,
} from "@/services/state";

const demoTimeZone = "Asia/Seoul";

// quizNumber is the seed-quiz-N suffix; the learner's completed history for the search demo.
const demoRecords: readonly [
  quizNumber: number,
  completedAt: string,
  submitted: Answer,
  correct: boolean,
][] = [
  [
    5,
    "2026-11-06T09:12:00.000Z",
    { type: "SINGLE_CHOICE", choiceId: "a" },
    true,
  ],
  [
    6,
    "2026-11-05T13:40:00.000Z",
    { type: "TRUE_FALSE", value: true },
    true,
  ],
  [
    7,
    "2026-11-04T08:05:00.000Z",
    { type: "MULTIPLE_CHOICE", choiceIds: ["a", "b", "c"] },
    true,
  ],
  [
    7,
    "2026-11-04T00:20:00.000Z",
    { type: "MULTIPLE_CHOICE", choiceIds: ["a", "b"] },
    false,
  ],
  [
    8,
    "2026-11-02T10:30:00.000Z",
    { type: "SINGLE_CHOICE", choiceId: "b" },
    false,
  ],
  [
    9,
    "2026-10-30T07:45:00.000Z",
    { type: "SHORT_ANSWER", text: "PATCH" },
    true,
  ],
  [
    10,
    "2026-10-28T11:00:00.000Z",
    { type: "TRUE_FALSE", value: true },
    true,
  ],
  [
    11,
    "2026-10-25T14:15:00.000Z",
    { type: "MULTIPLE_CHOICE", choiceIds: ["a"] },
    false,
  ],
  [
    12,
    "2026-10-21T06:50:00.000Z",
    { type: "SHORT_ANSWER", text: "이벤트 루프" },
    true,
  ],
  [
    5,
    "2026-10-18T12:00:00.000Z",
    { type: "SINGLE_CHOICE", choiceId: "c" },
    false,
  ],
  [
    6,
    "2026-10-15T09:25:00.000Z",
    { type: "TRUE_FALSE", value: false },
    false,
  ],
  [
    9,
    "2026-10-12T15:10:00.000Z",
    { type: "SHORT_ANSWER", text: "PUT" },
    false,
  ],
];

const learnerAttempts: readonly StoredAttempt[] =
  demoRecords.map(
    (
      [quizNumber, completedAt, submittedAnswer, correct],
      index,
    ) => {
      const quizId = `seed-quiz-${quizNumber}`;

      const quiz = seeds.learner.quizzes.find(
        (item) => item.quizId === quizId,
      )!;

      return {
        attemptId: `seed-attempt-${String(index + 1).padStart(2, "0")}`,
        quizId,
        ownerUserId: quiz.ownerUserId,
        revision: JSON.parse(JSON.stringify(quiz.revision)),
        submittedAnswer,
        correct,
        completedAt,
        // Asia/Seoul is UTC+9; history demo records carry no rewards or streak days.
        learningDate: new Date(
          Date.parse(completedAt) + 9 * 3600_000,
        )
          .toISOString()
          .slice(0, 10),
        timeZone: demoTimeZone,
      };
    },
  );

export const attempts: readonly StoredAttempt[] = [];

/** Optional completed-Attempt fixtures per dummy user for the history search demo. Only the learner has any. */
export const historyDemoAttempts: Readonly<
  Record<string, readonly StoredAttempt[]>
> = { learner: learnerAttempts };

export const learningDays: readonly StoredDay[] = [];

/** Public demo fixtures only; not the product default for timezone detection. */
export const publicLearningTimeZones: Readonly<
  Record<string, string>
> = {
  learner: "Asia/Seoul",
  author: "Asia/Seoul",
  friend: "Asia/Seoul",
};
