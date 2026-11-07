import { searchDiscovery } from "@/services/discovery";
import { DiscoveryKind } from "@/api/constants";
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
