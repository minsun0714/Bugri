import { createApiClient } from "@/api/client";
import { AttemptContext } from "@/api/constants";
import type { Answer, Question } from "@/api/contracts";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";

// 2026-11-08 12:00 in Seoul. The learner seed is relative to this day.
const noon = Date.UTC(2026, 10, 8, 3, 0, 0);

const dayMs = 86_400_000;

let clock = noon;
let zone = "Asia/Seoul";

const make = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => zone,
      now: () => new Date((clock += 1000)),
    }),
  );

const stored = (userId = "learner") =>
  JSON.parse(localStorage.getItem(storageKey(userId))!);

const scheduleOf = (quizId: string, userId = "learner") =>
  stored(userId).reviewSchedules.find(
    (entry: { quizId: string }) => entry.quizId === quizId,
  );

const scheduleEntry = (
  state: { reviewSchedules: { quizId: string }[] },
  quizId: string,
) =>
  state.reviewSchedules.find(
    (entry) => entry.quizId === quizId,
  ) as unknown as { nextReviewDate: string };

/** Creates the learner's seed state on the first day, before tests move the clock. */
beforeEach(async () => {
  localStorage.clear();
  clock = noon;
  zone = "Asia/Seoul";

  await make().request("todayReview", {});
});

const correctAnswer = async (
  api: ReturnType<typeof make>,
  attemptId: string,
  quizId: string,
): Promise<Answer> => {
  const { revision } = await api.request("reviewQuiz", {
    quizId,
  });

  return revision.answer;
};

/** A valid answer for the question that is not the right one. */
function wrongAnswer(
  question: Question,
  right: Answer,
): Answer {
  switch (right.type) {
    case "TRUE_FALSE":
      return { type: "TRUE_FALSE", value: !right.value };
    case "SHORT_ANSWER":
      return { type: "SHORT_ANSWER", text: "x-wrong" };
    case "SINGLE_CHOICE": {
      const { choices } = question as Extract<
        Question,
        { choices: unknown }
      >;

      const other = choices.find(
        ({ id }) => id !== right.choiceId,
      )!;

      return { type: "SINGLE_CHOICE", choiceId: other.id };
    }
    case "MULTIPLE_CHOICE": {
      const { choices } = question as Extract<
        Question,
        { choices: unknown }
      >;

      const missing = right.choiceIds.slice(1);

      return {
        type: "MULTIPLE_CHOICE",
        choiceIds: missing.length
          ? missing
          : choices
              .map(({ id }) => id)
              .filter((id) => id !== right.choiceIds[0])
              .slice(0, 1),
      };
    }
  }
}

async function review(
  api: ReturnType<typeof make>,
  quizId: string,
  correct: boolean,
) {
  const started = await api.request("startAttempt", {
    quizId,
    context: AttemptContext.REVIEW,
  });

  const right = await correctAnswer(
    api,
    started.attemptId,
    quizId,
  );

  return api.request("answer", {
    attemptId: started.attemptId,
    answer: correct
      ? right
      : wrongAnswer(started.quiz!.question, right),
  });
}

test("the learner seed has quizzes due today, overdue and due tomorrow", async () => {
  const api = make();

  const today = await api.request("todayReview", {});

  expect(today.learningDate).toBe("2026-11-08");
  expect(today.timeZone).toBe("Asia/Seoul");
  expect(today.dueCount).toBe(4);
  expect(today.tomorrowCount).toBe(2);
  expect(today.reviewedToday).toBe(0);
  expect(today.totalCount).toBe(8);
  expect(today.upcoming).toEqual({
    date: "2026-11-09",
    count: 2,
  });
});

test("the next quiz is a wrong one first, then the oldest, ties by quizId", async () => {
  const api = make();

  const order: string[] = [];

  for (let round = 0; round < 4; round++) {
    const { next } = await api.request("todayReview", {});

    order.push(next!.quizId);

    // Answer correctly so the quiz leaves today's list.
    await review(api, next!.quizId, true);
  }

  // seed-quiz-6 was answered wrong last time, 5 is the oldest, 7 and 8 are due today.
  expect(order).toEqual([
    "seed-quiz-6",
    "seed-quiz-5",
    "seed-quiz-7",
    "seed-quiz-8",
  ]);
});

test("the next quiz never carries the answer, explanation or source", async () => {
  const { next } = await make().request("todayReview", {});

  expect(Object.keys(next!).sort()).toEqual([
    "hashtagIds",
    "ownerUserId",
    "question",
    "quizId",
    "revisionId",
    "title",
  ]);

  expect(JSON.stringify(next)).not.toMatch(
    /explanation|sourceContent|"answer"/,
  );
});

test("author and friend have no review due today but see what is coming", async () => {
  const author = await make("author").request(
    "todayReview",
    {},
  );

  expect(author.dueCount).toBe(0);
  expect(author.next).toBeNull();
  expect(author.totalCount).toBe(2);
  expect(author.tomorrowCount).toBe(1);
  expect(author.upcoming).toEqual({
    date: "2026-11-09",
    count: 1,
  });

  const friend = await make("friend").request(
    "todayReview",
    {},
  );

  expect(friend.dueCount).toBe(0);
  expect(friend.tomorrowCount).toBe(0);
  expect(friend.totalCount).toBe(2);
  expect(friend.upcoming).toEqual({
    date: "2026-11-10",
    count: 1,
  });
});

test("PENDING and deleted quizzes are not review targets and users are isolated", async () => {
  const api = make();

  const before = await api.request("todayReview", {});

  // The learner's PENDING seed quizzes are not counted.
  expect(before.totalCount).toBe(8);

  await api.request("deleteQuiz", { quizId: "seed-quiz-7" });

  const afterQuiz = await api.request("todayReview", {});

  expect(afterQuiz.dueCount).toBe(3);
  expect(afterQuiz.totalCount).toBe(7);

  // Deleting the memo removes every linked quiz.
  await api.request("deleteNote", {
    noteId: "seed-note-learner-confirmed",
  });

  const afterNote = await api.request("todayReview", {});

  expect(afterNote.dueCount).toBe(0);
  expect(afterNote.totalCount).toBe(0);
  expect(afterNote.next).toBeNull();
  expect(afterNote.upcoming).toBeNull();

  // The author's schedule is untouched.
  const author = await make("author").request(
    "todayReview",
    {},
  );

  expect(author.totalCount).toBe(2);
});

test("a quiz confirmed today comes back tomorrow, in the learner's zone", async () => {
  const api = make();

  const note = await api.request("createNote", {
    content: "오늘 배운 것",
  });

  await api.request("generate", { noteId: note.noteId });

  const confirmed = await api.request("confirmNoteQuizzes", {
    noteId: note.noteId,
  });

  expect(confirmed.length).toBeGreaterThan(0);

  const sameDay = await api.request("todayReview", {});

  // Seed quizzes are due; the new ones are not.
  expect(sameDay.dueCount).toBe(4);
  expect(sameDay.tomorrowCount).toBe(2 + confirmed.length);

  clock += dayMs;

  const nextDay = await api.request("todayReview", {});

  expect(nextDay.learningDate).toBe("2026-11-09");
  expect(nextDay.dueCount).toBe(4 + 2 + confirmed.length);
});

test("a state without schedules is read by computing from confirmedAt", async () => {
  const api = make("author");

  await api.request("todayReview", {});

  const state = stored("author");

  delete state.reviewSchedules;

  state.quizzes[0].confirmedAt = "2026-11-06T03:00:00.000Z";
  state.quizzes[1].confirmedAt = "2026-11-08T03:00:00.000Z";

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  const today = await api.request("todayReview", {});

  // Confirmed 11-06 → first review 11-07 (overdue). Confirmed today → tomorrow.
  expect(today.dueCount).toBe(1);
  expect(today.next!.quizId).toBe("seed-quiz-1");
  expect(today.tomorrowCount).toBe(1);
  expect(stored("author").schemaVersion).toBe(2);
});

test("only a REVIEW submission changes the schedule", async () => {
  const api = make();

  const before = scheduleOf("seed-quiz-8");

  const direct = await api.request("startAttempt", {
    quizId: "seed-quiz-8",
    context: AttemptContext.DIRECT,
  });

  const answer = await correctAnswer(
    api,
    direct.attemptId,
    "seed-quiz-8",
  );

  const done = await api.request("answer", {
    attemptId: direct.attemptId,
    answer,
  });

  expect(done.context).toBe(AttemptContext.DIRECT);
  expect(done.nextReview).toBeNull();
  expect(scheduleOf("seed-quiz-8")).toEqual(before);

  const today = await api.request("todayReview", {});

  // Still due, but the day now counts as a learning day.
  expect(today.dueCount).toBe(4);
  expect(today.reviewedToday).toBe(0);

  const day = await api.request("learningDay", {});

  expect(day.completed).toBe(true);
});

test("a correct review moves one step and shows the next date", async () => {
  const api = make();

  // seed-quiz-7 is at stage 1 (3 days) and due today.
  const done = await review(api, "seed-quiz-7", true);

  expect(done.correct).toBe(true);
  expect(done.context).toBe(AttemptContext.REVIEW);

  expect(done.nextReview).toEqual({
    date: "2026-11-15",
    days: 7,
  });

  expect(scheduleOf("seed-quiz-7")).toMatchObject({
    stage: 2,
    nextReviewDate: "2026-11-15",
    lastCorrect: true,
  });

  const today = await api.request("todayReview", {});

  expect(today.dueCount).toBe(3);
  expect(today.reviewedToday).toBe(1);
});

test("a wrong review returns tomorrow and resets the interval", async () => {
  const api = make();

  // seed-quiz-5 is overdue at stage 2.
  const done = await review(api, "seed-quiz-5", false);

  expect(done.correct).toBe(false);

  expect(done.nextReview).toEqual({
    date: "2026-11-09",
    days: 1,
  });

  expect(scheduleOf("seed-quiz-5")).toMatchObject({
    stage: 0,
    nextReviewDate: "2026-11-09",
    lastCorrect: false,
  });
});

test("an overdue quiz is rescheduled from the day it was reviewed", async () => {
  const api = make();

  clock += 40 * dayMs;

  const done = await review(api, "seed-quiz-9", true);

  // Review on 2026-12-18, stage 2 → 3 for a 14-day interval.
  expect(done.learningDate).toBe("2026-12-18");
  expect(done.nextReview).toEqual({
    date: "2027-01-01",
    days: 14,
  });
});

test("the interval stays at 30 days after repeated correct reviews", async () => {
  const api = make();

  // seed-quiz-12 is at stage 4 (30 days).
  clock += 13 * dayMs;

  const done = await review(api, "seed-quiz-12", true);

  expect(done.nextReview!.days).toBe(30);
  expect(scheduleOf("seed-quiz-12").stage).toBe(4);
});

test("submitting the same review again keeps the first result and schedule", async () => {
  const api = make();

  const started = await api.request("startAttempt", {
    quizId: "seed-quiz-8",
    context: AttemptContext.REVIEW,
  });

  const answer = await correctAnswer(
    api,
    started.attemptId,
    "seed-quiz-8",
  );

  const first = await api.request("answer", {
    attemptId: started.attemptId,
    answer,
  });

  const schedule = scheduleOf("seed-quiz-8");

  const second = await api.request("answer", {
    attemptId: started.attemptId,
    answer,
  });

  expect(second).toEqual(first);
  expect(scheduleOf("seed-quiz-8")).toEqual(schedule);

  await expect(
    api.request("answer", {
      attemptId: started.attemptId,
      answer: wrongAnswer(started.quiz!.question, answer),
    }),
  ).rejects.toMatchObject({
    status: 409,
    detail: { code: "ALREADY_ANSWERED" },
  });

  expect(scheduleOf("seed-quiz-8")).toEqual(schedule);
});

test("a review attempt cannot advance a quiz that is no longer due", async () => {
  const api = make();

  const started = await api.request("startAttempt", {
    quizId: "seed-quiz-8",
    context: AttemptContext.REVIEW,
  });

  // Another tab already moved the schedule forward.
  const state = stored();

  scheduleEntry(state, "seed-quiz-8").nextReviewDate =
    "2026-11-20";

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );

  const done = await api.request("answer", {
    attemptId: started.attemptId,
    answer: await correctAnswer(
      api,
      started.attemptId,
      "seed-quiz-8",
    ),
  });

  expect(done.completedAt).not.toBeNull();
  expect(done.nextReview).toBeNull();
  expect(scheduleOf("seed-quiz-8").nextReviewDate).toBe(
    "2026-11-20",
  );
});

test("a review can only start for a quiz that is due", async () => {
  const api = make();

  await expect(
    api.request("startAttempt", {
      quizId: "seed-quiz-12",
      context: AttemptContext.REVIEW,
    }),
  ).rejects.toMatchObject({
    status: 409,
    detail: { code: "QUIZ_UNAVAILABLE" },
  });

  await expect(
    api.request("startAttempt", {
      quizId: "seed-pending-1",
      context: AttemptContext.REVIEW,
    }),
  ).rejects.toMatchObject({
    detail: { code: "QUIZ_UNAVAILABLE" },
  });

  await expect(
    api.request("startAttempt", {
      quizId: "seed-quiz-8",
      context: "OTHER" as never,
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  // A direct attempt for a quiz that is not due is still fine.
  await expect(
    api.request("startAttempt", {
      quizId: "seed-quiz-12",
      context: AttemptContext.DIRECT,
    }),
  ).resolves.toMatchObject({ quizId: "seed-quiz-12" });
});

test("starting a review twice resumes the unfinished attempt", async () => {
  const api = make();

  const first = await api.request("startAttempt", {
    quizId: "seed-quiz-8",
    context: AttemptContext.REVIEW,
  });

  const again = await api.request("startAttempt", {
    quizId: "seed-quiz-8",
    context: AttemptContext.REVIEW,
  });

  expect(again.attemptId).toBe(first.attemptId);
  expect(stored().attempts).toHaveLength(1);
});

test("editing a quiz keeps its schedule, and the open review uses its starting version", async () => {
  const api = make();

  const started = await api.request("startAttempt", {
    quizId: "seed-quiz-7",
    context: AttemptContext.REVIEW,
  });

  const before = scheduleOf("seed-quiz-7");

  const quiz = await api.request("reviewQuiz", {
    quizId: "seed-quiz-7",
  });

  const { revisionId, sourceContent, ...content } =
    quiz.revision;

  void revisionId;
  void sourceContent;

  await api.request("updateQuiz", {
    quizId: "seed-quiz-7",
    expectedVersion: quiz.version,
    content: { ...content, title: "수정한 제목" },
  });

  expect(scheduleOf("seed-quiz-7")).toEqual(before);

  const done = await api.request("answer", {
    attemptId: started.attemptId,
    answer: quiz.revision.answer,
  });

  expect(done.correct).toBe(true);
  expect(scheduleOf("seed-quiz-7").stage).toBe(2);
});

test("a deleted quiz cannot be submitted and leaves the schedule alone", async () => {
  const api = make();

  const started = await api.request("startAttempt", {
    quizId: "seed-quiz-7",
    context: AttemptContext.REVIEW,
  });

  const before = scheduleOf("seed-quiz-7");

  const answer = await correctAnswer(
    api,
    started.attemptId,
    "seed-quiz-7",
  );

  await api.request("deleteQuiz", { quizId: "seed-quiz-7" });

  await expect(
    api.request("answer", {
      attemptId: started.attemptId,
      answer,
    }),
  ).rejects.toMatchObject({
    detail: { code: "QUIZ_UNAVAILABLE" },
  });

  expect(scheduleOf("seed-quiz-7")).toEqual(before);
});

test("changing the time zone does not recompute stored schedules", async () => {
  const api = make();

  await review(api, "seed-quiz-7", true);

  const kept = scheduleOf("seed-quiz-7");

  zone = "America/New_York";

  // 2026-11-08 12:00 in Seoul is 22:00 on 11-07 in New York.
  const today = await api.request("todayReview", {});

  expect(today.timeZone).toBe("America/New_York");
  expect(today.learningDate).toBe("2026-11-07");
  expect(scheduleOf("seed-quiz-7")).toEqual(kept);

  // Only the "today" comparison moves, so fewer quizzes are due.
  expect(today.dueCount).toBeLessThan(4);
});

test("a review without a known time zone is rejected", async () => {
  zone = "";

  // A user whose state does not exist yet has no saved zone either.
  const api = make("friend");

  await expect(
    api.request("todayReview", {}),
  ).rejects.toMatchObject({
    detail: { code: "TIMEZONE_REQUIRED" },
  });
});

test("a malformed schedule is reported as corrupt storage", async () => {
  const api = make();

  await api.request("todayReview", {});

  const state = stored();

  state.reviewSchedules = [
    { quizId: "seed-quiz-5", stage: 9, nextReviewDate: "x" },
  ];

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );

  await expect(
    api.request("todayReview", {}),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_CORRUPT" },
  });
});

test("todayReview rejects unknown request fields", async () => {
  await expect(
    make().request("todayReview", { userId: "author" } as never),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });
});
