import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";

const api = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      demoHistory: true,
      now: () => new Date("2026-11-08T12:00:00Z"),
    }),
  );

const search = (
  query: string,
  extra: Record<string, unknown> = {},
) =>
  api().request("attemptHistory", {
    query,
    ...extra,
  } as never);

beforeEach(() => localStorage.clear());

// History reads never write, so a write operation persists the seeded state first.
const persist = () =>
  api().request("learningDay", {});

test("without the demo flag history starts empty", async () => {
  const plain = createApiClient(
    createMockTransport({
      userId: "learner",
      storage: localStorage,
    }),
  );

  expect(
    (await plain.request("attemptHistory", {})).total,
  ).toBe(0);
});

test("demo history is seeded once with the fresh state and never duplicates on later writes", async () => {
  await persist();
  await persist();

  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  expect(state.attempts).toHaveLength(12);

  expect(
    new Set(
      state.attempts.map(
        (a: { attemptId: string }) => a.attemptId,
      ),
    ).size,
  ).toBe(12);
});

test("demo learner starts with seeded history; other users stay empty", async () => {
  const all = await api().request("attemptHistory", {});

  expect(all.total).toBe(12);
  expect(all.items[0].matchedIn).toBeNull();
  expect(all.items[0].excerpt).toBeNull();

  for (const userId of ["author", "friend"])
    expect(
      (await api(userId).request("attemptHistory", {}))
        .total,
    ).toBe(0);
});

test("matches titles case-insensitively and reports TITLE", async () => {
  const { items, total } = await search("promise");

  expect(total).toBe(2);

  expect(items.map(({ title }) => title)).toEqual([
    "Promise 상태",
    "Promise 상태",
  ]);

  expect(
    items.every((item) => item.matchedIn === "TITLE"),
  ).toBe(true);

  expect(items.every((item) => item.excerpt === null)).toBe(
    true,
  );
});

test("matches question bodies and choices and returns a bounded excerpt", async () => {
  const body = await search("identity");

  expect(body.total).toBe(2);

  expect(body.items[0]).toMatchObject({
    title: "제네릭 기본",
    matchedIn: "BODY",
  });

  expect(body.items[0].excerpt).toContain("identity");

  expect(body.items[0].excerpt!.length).toBeLessThanOrEqual(
    82,
  );

  const choice = await search("any의 별칭");

  expect(choice.items[0]).toMatchObject({
    title: "제네릭 기본",
    matchedIn: "BODY",
  });
});

test("every whitespace-separated word must match, in any order", async () => {
  expect((await search("lexical 클로저")).total).toBe(0);
  expect((await search("렉시컬   환경")).total).toBe(2);
  expect((await search("환경 렉시컬")).total).toBe(2);
});

test("never searches answers, submitted answers, explanations or source content", async () => {
  // explanation-only term
  expect((await search("추론되는")).total).toBe(0);
  // correct short answer text appears only in answer/explanation fields
  expect((await search("PATCH")).total).toBe(0);
  // source content is a fixed seed string
  expect((await search("Mock 학습 자료")).total).toBe(0);
});

test("search combines with filter before pagination", async () => {
  const wrong = await search("promise", {
    filter: "INCORRECT",
  });

  expect(wrong.total).toBe(1);
  expect(wrong.items[0].correct).toBe(false);

  const paged = await search("promise", {
    page: 2,
    pageSize: 1,
  });

  expect(paged.total).toBe(2);
  expect(paged.items).toHaveLength(1);

  expect(
    (await search("promise", { page: 3, pageSize: 1 }))
      .items,
  ).toEqual([]);
});

test("blank queries behave like no search and long or non-string queries are rejected", async () => {
  expect((await search("   ")).total).toBe(12);
  expect((await search("")).items[0].matchedIn).toBeNull();

  await expect(
    search("a".repeat(101)),
  ).rejects.toMatchObject({ status: 400 });

  await expect(search(1 as never)).rejects.toMatchObject({
    status: 400,
  });
});

test("records of unavailable quizzes are hidden once a query is given", async () => {
  await persist();

  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  const [{ revision }] = state.attempts.filter(
    ({
      revision: { title },
    }: {
      revision: { title: string };
    }) => title === "CORS",
  );

  state.attempts = state.attempts.map(
    (attempt: { revision: { title: string } }) =>
      attempt.revision.title === "CORS"
        ? { ...attempt, quizId: "removed-quiz" }
        : attempt,
  );

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );

  const all = await api().request("attemptHistory", {});

  expect(all.total).toBe(12);

  expect(
    all.items.filter(({ title }) => title === null),
  ).toHaveLength(1);

  expect((await search(revision.title)).total).toBe(0);
  expect((await search("출처")).total).toBe(0);
});

test("searching is read-only", async () => {
  await persist();

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  expect(before).not.toBeNull();

  await search("closure");
  await search("클로저");

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    before,
  );
});
