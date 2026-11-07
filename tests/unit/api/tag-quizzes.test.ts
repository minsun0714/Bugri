import { tagQuizzes } from "@/services/tag-quizzes";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";
import { QuizStatus } from "@/api/constants";

const api = (userId = "friend") =>
  createApiClient(
    createMockTransport({ userId, storage: localStorage }),
  );

const query = { hashtagId: "web", page: 1, pageSize: 20 };

beforeEach(() => localStorage.clear());

test("tag catalog includes public titles and authors without solving content or subscription writes", async () => {
  const result = await api().request("tagQuizzes", query);

  expect(result.hashtag.name).toBe("Web");
  expect(result.total).toBeGreaterThan(0);
  expect(result.items[0].author.publicId).toBeTruthy();

  expect(JSON.stringify(result)).not.toMatch(
    /answer|explanation|sourceContent|question|pending/,
  );

  expect(await api().request("subscriptions", {})).toEqual(
    [],
  );

  const first = await api().request("tagQuizzes", {
    ...query,
    pageSize: 1,
  });

  const second = await api().request("tagQuizzes", {
    ...query,
    pageSize: 1,
    page: 2,
  });

  expect(first.items).toHaveLength(1);

  expect(second.items[0]?.quizId).not.toBe(
    first.items[0].quizId,
  );
});

test("catalog excludes private, pending and deleted revisions, even for their owner", async () => {
  const state = initialState("author");
  const { quizzes } = state;
  const [first, second] = quizzes;

  first.status = QuizStatus.PRIVATE;
  second.deletedAt = "2026-11-07T00:00:00Z";

  state.quizzes.push({
    ...first,
    quizId: "hidden-draft",
    status: QuizStatus.PENDING,
    active: null,
    pending: first.active,
  });

  localStorage.setItem(
    storageKey("author"),
    JSON.stringify(state),
  );

  for (const user of ["author", "friend"]) {
    const result = await api(user).request(
      "tagQuizzes",
      query,
    );

    expect(
      result.items.map(({ quizId }) => quizId),
    ).not.toEqual(expect.arrayContaining([first.quizId]));

    expect(
      result.items.map(({ quizId }) => quizId),
    ).not.toContain(second.quizId);

    expect(
      result.items.map(({ quizId }) => quizId),
    ).not.toContain("hidden-draft");
  }
});

test("empty and missing tags differ, pagination is validated and subscriptions are user isolated", async () => {
  expect(
    (
      await api().request("tagQuizzes", {
        ...query,
        hashtagId: "java",
      })
    ).total,
  ).toBe(0);

  await expect(
    api().request("tagQuizzes", {
      ...query,
      hashtagId: "missing",
    }),
  ).rejects.toMatchObject({ status: 404 });

  await expect(
    api().request("tagQuizzes", { ...query, page: 0 }),
  ).rejects.toMatchObject({ status: 400 });

  await expect(
    api().request("tagQuizzes", { ...query, pageSize: 51 }),
  ).rejects.toMatchObject({ status: 400 });

  await api().request("subscribe", {
    type: "HASHTAG",
    hashtagId: "java",
  });

  expect(
    (
      await api().request("tagQuizzes", {
        ...query,
        hashtagId: "java",
      })
    ).subscribed,
  ).toBe(true);

  expect(
    (
      await api("learner").request("tagQuizzes", {
        ...query,
        hashtagId: "java",
      })
    ).subscribed,
  ).toBe(false);
});

test("tag catalog spans authors and sorts latest publication before paginating", () => {
  const { quizzes } = initialState("author");

  const original = quizzes.find(({ active }) =>
    active?.hashtagIds.includes("web"),
  )!;

  const users = [
    {
      userId: "author",
      publicId: "one",
      displayName: "One",
    },
    {
      userId: "friend",
      publicId: "two",
      displayName: "Two",
    },
  ];

  const result = tagQuizzes(
    {
      users,
      hashtags: [{ id: "web", name: "Web" }],
      subscriptions: [],
      quizzes: [
        {
          ...original,
          quizId: "older",
          ownerUserId: "author",
          publishedAt: "2026-10-01T00:00:00Z",
        },
        {
          ...original,
          quizId: "newer",
          ownerUserId: "friend",
          publishedAt: "2026-11-01T00:00:00Z",
        },
      ],
    },
    { ...query, pageSize: 1 },
  );

  expect(result.total).toBe(2);

  expect(result.items).toEqual([
    {
      quizId: "newer",
      title: original.active!.title,
      author: users[1],
    },
  ]);
});
