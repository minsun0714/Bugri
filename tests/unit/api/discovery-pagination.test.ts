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
