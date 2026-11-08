import { searchDiscovery } from "@/services/discovery";
import { DiscoveryKind, QuizStatus } from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

const users = Array.from({ length: 1000 }, (_, index) => ({
  userId: `user-${index}`,
  publicId: `developer-${index}`,
  displayName: `개발자 ${index}`,
}));

const hashtags = Array.from(
  { length: 1000 },
  (_, index) => ({
    id: `tag-${index}`,
    name: `태그 ${index}`,
  }),
);

const source = { users, hashtags, subscriptions: [] };

const request = {
  kind: DiscoveryKind.USER,
  query: "",
  page: 1,
  pageSize: 20,
};

test("1000 users and 1000 tags return only the requested page in stable order", () => {
  const first = searchDiscovery(source, request);

  const second = searchDiscovery(source, {
    ...request,
    page: 2,
  });

  expect(first.total).toBe(1000);
  expect(first.items).toHaveLength(20);
  expect(second.items).toHaveLength(20);
  expect(first.items).not.toEqual(second.items);

  expect(
    new Set(
      [...first.items, ...second.items].map((item) =>
        item.type === DiscoveryKind.USER
          ? item.user.userId
          : item.hashtag.id,
      ),
    ).size,
  ).toBe(40);

  const tags = searchDiscovery(source, {
    ...request,
    kind: DiscoveryKind.HASHTAG,
    page: 50,
  });

  expect(tags.total).toBe(1000);
  expect(tags.items).toHaveLength(20);

  expect(
    searchDiscovery(source, { ...request, page: 51 }).items,
  ).toEqual([]);
});

test("search filters before pagination and keeps subscription flags on each result", () => {
  const result = searchDiscovery(
    {
      ...source,
      subscriptions: [
        {
          type: "PERSON",
          authorUserId: "user-999",
          subscriptionId: "sub-1",
        },
      ],
    },
    { ...request, query: " DEVELOPER-999 " },
  );

  expect(result.total).toBe(1);

  expect(result.items[0]).toMatchObject({
    subscribed: true,
    user: { userId: "user-999" },
  });

  expect(
    searchDiscovery(source, {
      ...request,
      kind: DiscoveryKind.HASHTAG,
      query: "tag-999",
    }).total,
  ).toBe(1);
});

test.each([
  { page: 0 },
  { page: 1.5 },
  { pageSize: 0 },
  { pageSize: 51 },
  { query: "x".repeat(101) },
  { kind: "INVALID" },
])(
  "rejects invalid paging/search parameters %j",
  (invalid) => {
    expect(() =>
      searchDiscovery(source, {
        ...request,
        ...invalid,
      } as typeof request),
    ).toThrow();
  },
);

test("typed API exposes a bounded search page including un-used registered tags", async () => {
  localStorage.clear();

  const client = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );

  const result = await client.request("searchDiscovery", {
    kind: DiscoveryKind.HASHTAG,
    query: "java",
    page: 1,
    pageSize: 1,
  });

  expect(result.total).toBe(2);
  expect(result.items).toHaveLength(1);
});

test("tag search normalizes hash prefixes and filters subscriptions before paging", async () => {
  localStorage.clear();

  const client = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );

  await client.request("subscribe", {
    type: "HASHTAG",
    hashtagId: "java",
  });

  const result = await client.request("searchDiscovery", {
    kind: DiscoveryKind.HASHTAG,
    query: " #JAVA ",
    page: 1,
    pageSize: 20,
    subscribedOnly: true,
  });

  expect(result.total).toBe(1);

  expect(result.items[0]).toMatchObject({
    hashtag: { id: "java" },
    subscribed: true,
    publicQuizCount: 0,
  });
});

test("public quiz counts exclude private, pending, deleted and inactive content", () => {
  const content = {
    revisionId: "r1",
    sourceContent: "private source",
    reviewed: true,
    title: "quiz",
    question: {
      type: "TRUE_FALSE" as const,
      prompt: "question",
    },
    answer: { type: "TRUE_FALSE" as const, value: true },
    explanation: "secret",
    hashtagIds: ["tag-0"],
  };

  const base = {
    quizId: "q1",
    ownerUserId: "author",
    status: QuizStatus.PUBLIC,
    version: 1,
    active: content,
    pending: null,
    updatedAt: "2026-01-01",
    deletedAt: null,
  };

  const result = searchDiscovery(
    {
      ...source,
      quizzes: [
        base,
        {
          ...base,
          quizId: "q2",
          status: QuizStatus.PRIVATE,
        },
        {
          ...base,
          quizId: "q3",
          status: QuizStatus.PENDING,
        },
        { ...base, quizId: "q4", deletedAt: "2026-01-02" },
        { ...base, quizId: "q5", active: null },
      ],
    },
    {
      ...request,
      kind: DiscoveryKind.HASHTAG,
      query: "tag-0",
    },
  );

  expect(result.items[0]).toEqual({
    type: DiscoveryKind.HASHTAG,
    hashtag: { id: "tag-0", name: "태그 0" },
    subscribed: false,
    publicQuizCount: 1,
  });

  expect(JSON.stringify(result)).not.toMatch(
    /secret|private source|answer/,
  );
});

test("accepts the public handle as displayed on a developer card", () => {
  expect(
    searchDiscovery(source, {
      ...request,
      query: "@developer-999",
    }).total,
  ).toBe(1);
});

test("isolates discovery and subscription changes from another user's corrupt snapshot", async () => {
  localStorage.clear();
  localStorage.setItem("bugri:mock:v1:author", "broken");

  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );

  const result = await api.request(
    "searchDiscovery",
    request,
  );

  expect(result.total).toBe(3);

  await api.request("subscribe", {
    type: "PERSON",
    authorUserId: "author",
  });

  expect(
    await api.request("subscriptions", {}),
  ).toHaveLength(1);

  expect(localStorage.getItem("bugri:mock:v1:author")).toBe(
    "broken",
  );
});

test("developer summaries count only active public quizzes and expose no solving content", async () => {
  localStorage.clear();

  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );

  const page = await api.request("searchDiscovery", {
    ...request,
    query: "@bugri-author",
  });

  const { items } = page;
  const [item] = items;

  expect(item.type).toBe("USER");

  if (item.type !== "USER")
    throw new Error("Expected developer");

  const catalog = await api.request("developerQuizzes", {
    publicId: "bugri-author",
    page: 1,
    pageSize: 20,
  });

  expect(item.summary?.publicQuizCount).toBe(catalog.total);

  expect(item.summary?.hashtags.length).toBeLessThanOrEqual(
    3,
  );

  expect(JSON.stringify(item)).not.toMatch(
    /"(answer|explanation|sourceContent|prompt)"/,
  );
});

test("public directories remain available when the selected user snapshot is damaged", async () => {
  localStorage.clear();
  localStorage.setItem("bugri:mock:v1:friend", "broken");

  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );

  expect(
    await api.request("discoverUsers", {}),
  ).toHaveLength(3);

  await expect(
    api.request("searchDiscovery", request),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_CORRUPT" },
  });

  expect(localStorage.getItem("bugri:mock:v1:friend")).toBe(
    "broken",
  );
});

test("isolating subscriptions preserves the existing learning order across authors", async () => {
  localStorage.clear();

  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );

  await api.request("subscribe", {
    type: "PERSON",
    authorUserId: "author",
  });

  await api.request("subscribe", {
    type: "PERSON",
    authorUserId: "friend",
  });

  const selection = await api.request("learningQuiz", {});

  expect(selection.quiz?.quizId).toBe("seed-quiz-1");
});

test("populated tags precede empty tags before paging without count sorting or subscription changes", () => {
  const content = {
    revisionId: "r1",
    sourceContent: "source",
    reviewed: true,
    title: "quiz",
    question: { type: "TRUE_FALSE" as const, prompt: "q" },
    answer: { type: "TRUE_FALSE" as const, value: true },
    explanation: "answer",
    hashtagIds: ["b", "d"],
  };

  const base = {
    quizId: "q1",
    ownerUserId: "author",
    status: QuizStatus.PUBLIC,
    version: 1,
    active: content,
    pending: null,
    updatedAt: "2026-01-01",
    deletedAt: null,
  };

  const input = {
    users: [],
    hashtags: ["d", "a", "c", "b"].map((id) => ({
      id,
      name: `match-${id}`,
    })),
    subscriptions: [
      {
        type: "HASHTAG" as const,
        hashtagId: "a",
        subscriptionId: "sub-a",
      },
    ],
    quizzes: [
      base,
      {
        ...base,
        quizId: "q2",
        active: { ...content, hashtagIds: ["d"] },
      },
    ],
  };

  const before = JSON.stringify(input);

  const pages = [1, 2, 3, 4].map((page) =>
    searchDiscovery(input, {
      kind: DiscoveryKind.HASHTAG,
      query: "match",
      page,
      pageSize: 1,
    }),
  );

  const items = pages.flatMap(({ items }) => items);

  expect(
    items.map(
      (item) =>
        item.type === DiscoveryKind.HASHTAG &&
        item.hashtag.id,
    ),
  ).toEqual(["b", "d", "a", "c"]);

  expect(
    items.map(
      (item) =>
        item.type === DiscoveryKind.HASHTAG &&
        item.publicQuizCount,
    ),
  ).toEqual([1, 2, 0, 0]);

  expect(items.map(({ subscribed }) => subscribed)).toEqual(
    [false, false, true, false],
  );

  expect(pages.every(({ total }) => total === 4)).toBe(
    true,
  );

  expect(JSON.stringify(input)).toBe(before);

  expect(
    searchDiscovery(input, {
      kind: DiscoveryKind.HASHTAG,
      query: "",
      page: 1,
      pageSize: 1,
      subscribedOnly: true,
    }).items,
  ).toEqual([items[2]]);
});
