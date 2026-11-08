import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";

const api = () =>
  createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
      now: () => new Date("2026-11-07T12:00:00Z"),
    }),
  );

beforeEach(() => localStorage.clear());

test("public activity returns only the profile owner's aggregate without writing snapshots", async () => {
  const author = initialState("author");

  author.timeZone = "America/New_York";

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(author),
  );

  const before = localStorage.getItem(storageKey("author"));

  const result = await api().request("publicLearningDay", {
    publicId: "bugri-author",
  });

  expect(result).toEqual({
    timeZone: "America/New_York",
    learningDate: "2026-11-07",
    completed: false,
    streak: 0,
    completedDates: [],
    dailyCounts: [],
  });

  expect(localStorage.getItem(storageKey("author"))).toBe(
    before,
  );

  expect(
    localStorage.getItem(storageKey("friend")),
  ).toBeNull();
});

test("missing profiles return an explicit error", async () => {
  await expect(
    api().request("publicLearningDay", {
      publicId: "missing",
    }),
  ).rejects.toMatchObject({ status: 404 });

  expect(localStorage.length).toBe(0);
});

test("public totals match home after completion and omit answers and rewards", async () => {
  const owner = createApiClient(
    createMockTransport({
      userId: "author",
      storage: localStorage,
      now: () => new Date("2026-11-07T12:00:00Z"),
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

  const { attemptId } = await owner.request(
    "startAttempt",
    { quizId: "seed-quiz-1", context: "DIRECT" },
  );

  await owner.request("answer", {
    attemptId,
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
  });

  const expected = await owner.request("learningDay", {});

  const result = await api().request("publicLearningDay", {
    publicId: "bugri-author",
  });

  expect(result).toEqual(expected);
  expect(result.streak).toBe(1);

  expect(result.dailyCounts).toEqual([
    { learningDate: "2026-11-07", count: 1 },
  ]);

  expect(Object.keys(result).sort()).toEqual([
    "completed",
    "completedDates",
    "dailyCounts",
    "learningDate",
    "streak",
    "timeZone",
  ]);
});

test.each([false, true])(
  "unselected demo profiles expose activity without writing storage (saved: %s)",
  async (saved) => {
    if (saved) {
      localStorage.setItem(
        storageKey("author"),
        JSON.stringify(initialState("author")),
      );
    }

    const before = localStorage.getItem(
      storageKey("author"),
    );

    const client = createApiClient(
      createMockTransport({
        userId: "friend",
        storage: localStorage,
        now: () => new Date("2026-11-07T23:00:00Z"),
        detectTimeZone: () => "America/Los_Angeles",
      }),
    );

    const result = await client.request(
      "publicLearningDay",
      { publicId: "bugri-author" },
    );

    expect(result).toEqual({
      timeZone: "Asia/Seoul",
      learningDate: "2026-11-08",
      completed: false,
      streak: 0,
      completedDates: [],
      dailyCounts: [],
    });

    expect(localStorage.getItem(storageKey("author"))).toBe(
      before,
    );

    expect(
      localStorage.getItem(storageKey("friend")),
    ).toBeNull();
  },
);
