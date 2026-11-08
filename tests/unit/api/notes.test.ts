import { createApiClient } from "@/api/client";
import { createHttpTransport } from "@/api/http";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";

let tick = 0;

const make = (
  userId = "learner",
  storage: Parameters<
    typeof createMockTransport
  >[0]["storage"] = localStorage,
) =>
  createApiClient(
    createMockTransport({
      userId,
      storage,
      detectTimeZone: () => "Asia/Seoul",
      now: () =>
        new Date(Date.UTC(2026, 10, 8, 0, 0, tick++)),
    }),
  );

/** Starts every user from an empty memo list instead of the seed. */
beforeEach(() => {
  localStorage.clear();
  tick = 0;

  for (const userId of ["learner", "author", "friend"])
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify({
        ...initialState(userId),
        notes: [],
        quizzes: [],
      }),
    );
});

const code = "```ts\nfunction a() {\n  return 1;\n}\n```";

test("creates a note that preserves code blocks, line breaks and indentation, and lists newest first", async () => {
  const api = make();

  const content = `  첫 줄\n\n${code}\n\n<script>alert(1)</script>`;

  const first = await api.request("createNote", {
    content,
  });

  const second = await api.request("createNote", {
    content: "두 번째 메모",
  });

  expect(first.content).toBe(content);
  expect(first.version).toBe(1);

  const list = await api.request("notes", {});

  expect(list.total).toBe(2);
  expect(list.page).toBe(1);
  expect(list.pageSize).toBe(20);

  expect(list.items.map(({ noteId }) => noteId)).toEqual([
    second.noteId,
    first.noteId,
  ]);

  const detail = await api.request("note", {
    noteId: first.noteId,
  });

  expect(detail.content).toBe(content);
});

test("paginates notes and returns an empty page beyond the range", async () => {
  const api = make();

  for (const index of [1, 2, 3])
    await api.request("createNote", {
      content: `메모 ${index}`,
    });

  const page1 = await api.request("notes", {
    page: 1,
    pageSize: 2,
  });

  const page2 = await api.request("notes", {
    page: 2,
    pageSize: 2,
  });

  const page3 = await api.request("notes", {
    page: 3,
    pageSize: 2,
  });

  expect(page1.items).toHaveLength(2);
  expect(page2.items).toHaveLength(1);
  expect(page3.items).toHaveLength(0);
  expect(page3.total).toBe(3);

  await expect(
    api.request("notes", { page: 0 }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  await expect(
    api.request("notes", { pageSize: 51 }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });
});

test("rejects blank and over-limit content by Unicode code points", async () => {
  const api = make();

  await expect(
    api.request("createNote", { content: " \n\t " }),
  ).rejects.toMatchObject({
    status: 400,
    detail: { code: "VALIDATION_ERROR" },
  });

  const exact = "😀".repeat(10_000);

  const saved = await api.request("createNote", {
    content: exact,
  });

  expect(saved.content).toBe(exact);

  await expect(
    api.request("createNote", { content: `${exact}a` }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  await expect(
    api.request("updateNote", {
      noteId: saved.noteId,
      content: "a".repeat(10_001),
      expectedVersion: 1,
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  await expect(
    api.request("createNote", {
      content: "x",
      extra: 1,
    } as never),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  expect((await api.request("notes", {})).total).toBe(1);
});

test("updates with a version check and keeps the stored note on conflict", async () => {
  const api = make();

  const created = await api.request("createNote", {
    content: "처음",
  });

  const updated = await api.request("updateNote", {
    noteId: created.noteId,
    content: `수정\n${code}`,
    expectedVersion: 1,
  });

  expect(updated.version).toBe(2);
  expect(updated.content).toBe(`수정\n${code}`);

  expect(updated.updatedAt >= created.updatedAt).toBe(true);

  await expect(
    api.request("updateNote", {
      noteId: created.noteId,
      content: "오래된 버전",
      expectedVersion: 1,
    }),
  ).rejects.toMatchObject({
    status: 409,
    detail: { code: "VERSION_CONFLICT" },
  });

  expect(
    (await api.request("note", { noteId: created.noteId }))
      .content,
  ).toBe(`수정\n${code}`);

  await expect(
    api.request("updateNote", {
      noteId: created.noteId,
      content: "   ",
      expectedVersion: 2,
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });
});

test("soft deletes a note and hides it from the list and detail", async () => {
  const api = make();

  const kept = await api.request("createNote", {
    content: "남길 메모",
  });

  const removed = await api.request("createNote", {
    content: "지울 메모",
  });

  expect(
    await api.request("deleteNote", {
      noteId: removed.noteId,
    }),
  ).toEqual({ deleted: true });

  expect(
    (await api.request("notes", {})).items.map(
      ({ noteId }) => noteId,
    ),
  ).toEqual([kept.noteId]);

  await expect(
    api.request("note", { noteId: removed.noteId }),
  ).rejects.toMatchObject({
    status: 404,
    detail: { code: "NOT_FOUND" },
  });

  await expect(
    api.request("updateNote", {
      noteId: removed.noteId,
      content: "되살리기",
      expectedVersion: 1,
    }),
  ).rejects.toMatchObject({ status: 404 });

  // Repeating the delete is harmless.
  expect(
    await api.request("deleteNote", {
      noteId: removed.noteId,
    }),
  ).toEqual({ deleted: true });

  const stored = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  expect(
    stored.notes.find(
      ({ noteId }: { noteId: string }) =>
        noteId === removed.noteId,
    ).deletedAt,
  ).toEqual(expect.any(String));
});

test("notes are isolated per dummy user and other users' notes are 404", async () => {
  const learner = make("learner");
  const author = make("author");

  const mine = await learner.request("createNote", {
    content: "learner 메모",
  });

  await author.request("createNote", {
    content: "author 메모",
  });

  expect(
    (await author.request("notes", {})).items.map(
      ({ excerpt }) => excerpt,
    ),
  ).toEqual(["author 메모"]);

  for (const attempt of [
    author.request("note", { noteId: mine.noteId }),
    author.request("updateNote", {
      noteId: mine.noteId,
      content: "탈취",
      expectedVersion: 1,
    }),
    author.request("deleteNote", { noteId: mine.noteId }),
  ])
    await expect(attempt).rejects.toMatchObject({
      status: 404,
      detail: { code: "NOT_FOUND" },
    });

  expect(
    (await learner.request("note", { noteId: mine.noteId }))
      .content,
  ).toBe("learner 메모");
});

test("a failed write keeps the previous stored state", async () => {
  const api = make();

  await api.request("createNote", { content: "기존" });

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  const failing = make("learner", {
    getItem: (key) => localStorage.getItem(key),
    setItem: () => {
      throw new Error("quota");
    },
  });

  await expect(
    failing.request("createNote", { content: "새 메모" }),
  ).rejects.toMatchObject({
    status: 503,
    detail: { code: "STORAGE_UNAVAILABLE" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    before,
  );

  expect((await api.request("notes", {})).total).toBe(1);
});

test("a snapshot without a notes field is reported as corrupt and preserved", async () => {
  const stored: Partial<ReturnType<typeof initialState>> =
    initialState("learner");

  delete stored.notes;

  const raw = JSON.stringify(stored);

  localStorage.setItem(storageKey("learner"), raw);

  await expect(
    make().request("notes", {}),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_CORRUPT" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    raw,
  );
});

test("a corrupt notes field is reported without overwriting", async () => {
  const api = make();

  const stored = initialState("learner");

  (stored as unknown as { notes: unknown }).notes = [
    { noteId: 1 },
  ];

  const raw = JSON.stringify(stored);

  localStorage.setItem(storageKey("learner"), raw);

  await expect(
    api.request("notes", {}),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_CORRUPT" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    raw,
  );
});

test("HTTP transport maps note operations to /notes routes", async () => {
  const fetcher = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ data: { deleted: true } }),
  });

  const client = createApiClient(
    createHttpTransport({ fetch: fetcher }),
  );

  await client.request("notes", { page: 2, pageSize: 10 });

  await client.request("createNote", { content: "a" });

  await client.request("updateNote", {
    noteId: "n/1",
    content: "b",
    expectedVersion: 3,
  });

  await client.request("deleteNote", { noteId: "n1" });

  await client.request("note", { noteId: "n1" });

  expect(
    (fetcher.mock.calls as [string, RequestInit][]).map(
      ([url, init]) => [init.method, url, init.body],
    ),
  ).toEqual([
    ["GET", "/api/v1/notes?page=2&pageSize=10", undefined],
    ["POST", "/api/v1/notes", '{"content":"a"}'],
    [
      "PUT",
      "/api/v1/notes/n%2F1",
      '{"content":"b","expectedVersion":3}',
    ],
    ["DELETE", "/api/v1/notes/n1", "{}"],
    ["GET", "/api/v1/notes/n1", undefined],
  ]);
});
