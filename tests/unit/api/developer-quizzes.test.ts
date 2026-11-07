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
