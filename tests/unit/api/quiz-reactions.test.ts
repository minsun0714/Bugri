import { QuizReaction, QuizStatus } from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";

const api = (userId = "learner") =>
  createApiClient(
    createMockTransport({ userId, storage: localStorage }),
  );

const quizId = "seed-quiz-1";

async function complete(userId = "learner") {
  const client = api(userId);

  const { attemptId } = await client.request(
    "startAttempt",
    { quizId, context: "DIRECT" },
  );

  await client.request("answer", {
    attemptId,
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
  });

  return client;
}

beforeEach(() => localStorage.clear());

test("reaction works before solving and supports replacement, cancellation, reload and user isolation", async () => {
  await expect(
    api().request("updateQuizReaction", {
      quizId,
      reaction: QuizReaction.LIKE,
    }),
  ).resolves.toEqual({
    reaction: QuizReaction.LIKE,
    likeCount: 1,
    dislikeCount: 0,
  });

  const client = api();

  for (const reaction of [
    QuizReaction.LIKE,
    QuizReaction.LIKE,
    QuizReaction.DISLIKE,
    null,
    QuizReaction.LIKE,
  ]) {
    await expect(
      client.request("updateQuizReaction", {
        quizId,
        reaction,
      }),
    ).resolves.toEqual({
      reaction,
      likeCount: reaction === QuizReaction.LIKE ? 1 : 0,
      dislikeCount:
        reaction === QuizReaction.DISLIKE ? 1 : 0,
    });

    await expect(
      api().request("quizReaction", { quizId }),
    ).resolves.toEqual({
      reaction,
      likeCount: reaction === QuizReaction.LIKE ? 1 : 0,
      dislikeCount:
        reaction === QuizReaction.DISLIKE ? 1 : 0,
    });
  }

  const friend = api("friend");

  await expect(
    friend.request("quizReaction", { quizId }),
  ).resolves.toEqual({
    reaction: null,
    likeCount: 1,
    dislikeCount: 0,
  });
});

test("invalid values and failed writes preserve saved reaction", async () => {
  const client = await complete();

  await client.request("updateQuizReaction", {
    quizId,
    reaction: QuizReaction.LIKE,
  });

  for (const reaction of ["unknown", undefined, 1]) {
    await expect(
      client.request("updateQuizReaction", {
        quizId,
        reaction,
      } as never),
    ).rejects.toMatchObject({ status: 400 });
  }

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  const broken = createApiClient(
    createMockTransport({
      userId: "learner",
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: () => {
          throw new Error("full");
        },
      },
    }),
  );

  await expect(
    broken.request("updateQuizReaction", {
      quizId,
      reaction: QuizReaction.DISLIKE,
    }),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_UNAVAILABLE" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    before,
  );
});

test("unavailable quizzes reject changes without removing completed records or reactions", async () => {
  const client = await complete();

  await client.request("updateQuizReaction", {
    quizId,
    reaction: QuizReaction.LIKE,
  });

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  const owner = api("author");

  const { version } = await owner.request("reviewQuiz", {
    quizId,
  });

  await owner.request("visibility", {
    quizId,
    expectedVersion: version,
    visibility: QuizStatus.PRIVATE,
  });

  await expect(
    client.request("updateQuizReaction", {
      quizId,
      reaction: null,
    }),
  ).rejects.toMatchObject({
    detail: { code: "QUIZ_UNAVAILABLE" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    before,
  );
});

test("corrupt reaction storage is rejected without overwriting it", async () => {
  await complete();

  const key = storageKey("learner");
  const state = JSON.parse(localStorage.getItem(key)!);

  state.quizReactions = [{ quizId, reaction: "unknown" }];

  const corrupt = JSON.stringify(state);

  localStorage.setItem(key, corrupt);

  await expect(
    api().request("quizReaction", { quizId }),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_CORRUPT" },
  });

  expect(localStorage.getItem(key)).toBe(corrupt);
});

test("public counts combine users and guests read without writing", async () => {
  await api().request("updateQuizReaction", {
    quizId,
    reaction: QuizReaction.LIKE,
  });

  await api("friend").request("updateQuizReaction", {
    quizId,
    reaction: QuizReaction.LIKE,
  });

  const guest = createApiClient(
    createMockTransport({
      userId: "guest",
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: () => {
          throw new Error("guest must not write");
        },
      },
    }),
  );

  await expect(
    guest.request("quizReaction", { quizId }),
  ).resolves.toEqual({
    reaction: null,
    likeCount: 2,
    dislikeCount: 0,
  });

  await api("friend").request("updateQuizReaction", {
    quizId,
    reaction: QuizReaction.DISLIKE,
  });

  await expect(
    api().request("quizReaction", { quizId }),
  ).resolves.toEqual({
    reaction: QuizReaction.LIKE,
    likeCount: 1,
    dislikeCount: 1,
  });

  await api().request("updateQuizReaction", {
    quizId,
    reaction: null,
  });

  await expect(
    guest.request("quizReaction", { quizId }),
  ).resolves.toEqual({
    reaction: null,
    likeCount: 0,
    dislikeCount: 1,
  });
});
