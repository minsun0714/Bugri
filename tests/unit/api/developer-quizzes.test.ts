import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { QuizStatus } from "@/api/constants";
import { initialState, storageKey } from "@/mocks/storage";

const api = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

const query = {
  publicId: "bugri-author",
  page: 1,
  pageSize: 20,
};

beforeEach(() => localStorage.clear());

test("public author page scopes quizzes and tags without leaking solving or review content", async () => {
  const quizzes = await api("friend").request(
    "developerQuizzes",
    query,
  );

  expect(quizzes.user.userId).toBe("author");

  expect(quizzes.items.map(({ quizId }) => quizId)).toEqual(
    ["seed-quiz-1", "seed-quiz-2"],
  );

  expect(JSON.stringify(quizzes)).not.toMatch(
    /answer|explanation|sourceContent|pending|question/,
  );

  const tags = await api("friend").request(
    "developerTags",
    { ...query, query: "" },
  );

  expect(tags.items.map(({ id }) => id)).toEqual([
    "javascript",
    "typescript",
    "web",
  ]);

  const filtered = await api("friend").request(
    "developerQuizzes",
    { ...query, hashtagId: "typescript" },
  );

  expect(filtered.total).toBe(1);
  expect(filtered.items[0].quizId).toBe("seed-quiz-1");
});

test("private, pending, deleted and other authors' quizzes never appear, even for owner", async () => {
  const state = initialState("author");
  const { quizzes: stored } = state;
  const [first, second] = stored;

  first.status = QuizStatus.PRIVATE;
  second.deletedAt = "2026-11-07T00:00:00Z";

  state.quizzes.push({
    ...first,
    quizId: "draft",
    status: QuizStatus.PENDING,
    pending: first.active,
    active: null,
  });

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  for (const userId of ["author", "learner"]) {
    expect(
      (await api(userId).request("developerQuizzes", query))
        .items,
    ).toEqual([]);

    expect(
      (
        await api(userId).request("developerTags", {
          ...query,
          query: "",
        })
      ).items,
    ).toEqual([]);
  }
});

test("person-tag subscription is scoped to this author and retained across reload", async () => {
  await api("friend").request("subscribe", {
    type: "PERSON_HASHTAG",
    authorUserId: "author",
    hashtagId: "typescript",
  });

  const tags = await api("friend").request(
    "developerTags",
    { ...query, query: "type" },
  );

  expect(tags.items).toEqual([
    expect.objectContaining({
      id: "typescript",
      subscribed: true,
      quizCount: 1,
    }),
  ]);

  const other = await api("friend").request(
    "developerTags",
    { ...query, publicId: "bugri-friend", query: "type" },
  );

  expect(other.items).toEqual([]);
});

test("large author catalogs are paged before returning quiz metadata", async () => {
  const state = initialState("author");
  const { quizzes: stored } = state;
  const [base] = stored;

  state.quizzes = Array.from(
    { length: 1000 },
    (_, index) => ({
      ...base,
      quizId: `quiz-${String(index).padStart(4, "0")}`,
    }),
  );

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  const result = await api().request("developerQuizzes", {
    ...query,
    page: 2,
  });

  expect(result.total).toBe(1000);
  expect(result.items).toHaveLength(20);
  expect(result.items[0].quizId).toBe("quiz-0020");

  await expect(
    api().request("developerQuizzes", {
      ...query,
      pageSize: 51,
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  await expect(
    api().request("developerTags", {
      ...query,
      page: 0,
      query: "",
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  await expect(
    api().request("developerQuizzes", {
      ...query,
      publicId: "missing",
    }),
  ).rejects.toMatchObject({ status: 404 });
});

test("latest public quizzes sort before slicing four items, independent of edits", async () => {
  const state = initialState("author");

  const {
    quizzes: [base],
  } = state;

  state.quizzes = Array.from({ length: 6 }, (_, index) => ({
    ...base,
    quizId: `recent-${index}`,
    publishedAt: `2026-01-0${index + 1}T00:00:00.000Z`,
    updatedAt:
      index === 0
        ? "2027-01-01T00:00:00.000Z"
        : base.updatedAt,
  }));

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  const result = await api().request("developerQuizzes", {
    ...query,
    pageSize: 4,
  });

  expect(result.total).toBe(6);

  expect(result.items.map(({ quizId }) => quizId)).toEqual([
    "recent-5",
    "recent-4",
    "recent-3",
    "recent-2",
  ]);
});

test("public content approval keeps publication time; private-to-public sets a new time", async () => {
  const state = initialState("author");

  const {
    quizzes: [quiz],
  } = state;

  quiz.publishedAt = "2026-01-01T00:00:00.000Z";

  quiz.pending = {
    ...quiz.active!,
    revisionId: "edited",
    reviewed: true,
  };

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  const owner = createApiClient(
    createMockTransport({
      userId: "author",
      storage: localStorage,
      now: () => new Date("2026-11-07T00:00:00.000Z"),
    }),
  );

  const approved = await owner.request("approve", {
    quizId: quiz.quizId,
    expectedVersion: quiz.version,
    visibility: QuizStatus.PUBLIC,
  });

  const stored = () =>
    JSON.parse(
      localStorage.getItem(storageKey("author"))!,
    ).quizzes.find(
      (item: { quizId: string }) =>
        item.quizId === quiz.quizId,
    );

  expect(stored().publishedAt).toBe(
    "2026-01-01T00:00:00.000Z",
  );

  const hidden = await owner.request("visibility", {
    quizId: quiz.quizId,
    expectedVersion: approved.version,
    visibility: QuizStatus.PRIVATE,
  });

  await owner.request("visibility", {
    quizId: quiz.quizId,
    expectedVersion: hidden.version,
    visibility: QuizStatus.PUBLIC,
  });

  expect(stored().publishedAt).toBe(
    "2026-11-07T00:00:00.000Z",
  );
});

test("multiple tag filters use union before pagination and reject malformed lists", async () => {
  const selected = {
    ...query,
    hashtagIds: ["javascript", "web"],
  };

  const result = await api().request(
    "developerQuizzes",
    selected,
  );

  expect(result.total).toBe(1);

  expect(result.items.map(({ quizId }) => quizId)).toEqual([
    "seed-quiz-2",
  ]);

  const union = await api().request("developerQuizzes", {
    ...query,
    hashtagIds: ["typescript", "web"],
    pageSize: 1,
    page: 2,
  });

  expect(union.total).toBe(2);
  expect(union.items).toHaveLength(1);

  await expect(
    api().request("developerQuizzes", {
      ...query,
      hashtagIds: [3],
    } as never),
  ).rejects.toMatchObject({ status: 400 });
});
