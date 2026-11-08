import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";

let tick = 0;
let contents: unknown[] = [];

const make = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
      now: () =>
        new Date(Date.UTC(2026, 10, 8, 0, 0, tick++)),
      generate: () => contents,
    }),
  );

const quiz = (
  title: string,
  prompt: string,
  hashtagIds: string[],
  extra: Record<string, unknown> = {},
) => ({
  title,
  question: {
    type: "SINGLE_CHOICE",
    prompt,
    choices: [
      { id: "a", text: "선택지 알파" },
      { id: "b", text: "선택지 베타" },
    ],
  },
  answer: { type: "SINGLE_CHOICE", choiceId: "a" },
  explanation: "해설 비밀단어",
  hashtagIds,
  ...extra,
});

/** Creates a note and, when quizzes are given, generates and optionally confirms them. */
async function addNote(
  content: string,
  quizzes: ReturnType<typeof quiz>[] = [],
  { confirm = true, userId = "learner" } = {},
) {
  const api = make(userId);

  const note = await api.request("createNote", {
    content,
  });

  if (quizzes.length) {
    contents = quizzes;

    await api.request("generate", { noteId: note.noteId });

    if (confirm)
      await api.request("confirmNoteQuizzes", {
        noteId: note.noteId,
      });
  }

  return note;
}

const ids = async (
  request: Record<string, unknown> = {},
  userId = "learner",
) =>
  (
    await make(userId).request("notes", request as never)
  ).items.map(({ noteId }) => noteId);

beforeEach(() => {
  localStorage.clear();
  tick = 0;
  contents = [];

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

describe("query", () => {
  test("keeps working without search fields and returns no match info", async () => {
    const a = await addNote("첫 메모");

    const { items, total } = await make().request(
      "notes",
      {},
    );

    expect(total).toBe(1);

    expect(items[0]).toMatchObject({
      noteId: a.noteId,
      matchedIn: null,
      matchedQuizTitle: null,
      matchedExcerpt: null,
    });
  });

  test("blank query means no search", async () => {
    const a = await addNote("첫 메모");

    expect(await ids({ query: "   " })).toEqual([a.noteId]);
  });

  test("matches the body, ignoring case and word order", async () => {
    const a = await addNote("React Hooks 정리");

    await addNote("다른 내용");

    expect(await ids({ query: "  hooks   react " })).toEqual([
      a.noteId,
    ]);

    const { items } = await make().request("notes", {
      query: "hooks",
    });

    expect(items[0]).toMatchObject({
      matchedIn: "BODY",
      matchedQuizTitle: null,
      matchedExcerpt: null,
    });
  });

  test("requires every word", async () => {
    await addNote("React Hooks 정리");

    expect(await ids({ query: "react vue" })).toEqual([]);
  });

  test("matches a CONFIRMED quiz title, prompt and choice text", async () => {
    const note = await addNote("본문에는 없는 내용", [
      quiz("클로저 제목", "스코프 체인이란?", ["javascript"]),
    ]);

    expect(await ids({ query: "클로저" })).toEqual([
      note.noteId,
    ]);

    expect(await ids({ query: "스코프" })).toEqual([
      note.noteId,
    ]);

    expect(await ids({ query: "알파" })).toEqual([
      note.noteId,
    ]);
  });

  test("reports the quiz title for a title hit and an excerpt for a prompt or choice hit", async () => {
    await addNote("본문에는 없는 내용", [
      quiz("클로저 제목", "스코프 체인이란?", ["javascript"]),
    ]);

    const api = make();

    const {
      items: [byTitle],
    } = await api.request("notes", { query: "클로저" });

    expect(byTitle).toMatchObject({
      matchedIn: "QUIZ",
      matchedQuizTitle: "클로저 제목",
      matchedExcerpt: null,
    });

    const {
      items: [byPrompt],
    } = await api.request("notes", { query: "체인" });

    expect(byPrompt).toMatchObject({
      matchedIn: "QUIZ",
      matchedQuizTitle: "클로저 제목",
    });

    expect(byPrompt.matchedExcerpt).toContain("체인");

    const {
      items: [byChoice],
    } = await api.request("notes", { query: "베타" });

    expect(byChoice.matchedExcerpt).toContain("베타");
  });

  test("a body hit wins over a quiz hit", async () => {
    await addNote("클로저 메모", [
      quiz("클로저 제목", "문제", ["javascript"]),
    ]);

    const { items } = await make().request("notes", {
      query: "클로저",
    });

    expect(items[0]).toMatchObject({
      matchedIn: "BODY",
      matchedQuizTitle: null,
      matchedExcerpt: null,
    });
  });

  test("words may be split between the body and a quiz", async () => {
    const note = await addNote("스택 구조", [
      quiz("클로저 제목", "문제", ["javascript"]),
    ]);

    const { items } = await make().request("notes", {
      query: "스택 클로저",
    });

    expect(items.map(({ noteId }) => noteId)).toEqual([
      note.noteId,
    ]);

    expect(items[0].matchedIn).toBe("QUIZ");
  });

  test("does not search answers, explanations or source snapshots", async () => {
    await addNote("본문", [
      quiz("제목", "문제", ["web"]),
    ]);

    expect(await ids({ query: "비밀단어" })).toEqual([]);
    expect(await ids({ query: "choiceId" })).toEqual([]);
  });

  test("does not search PENDING quizzes", async () => {
    const note = await addNote(
      "본문",
      [quiz("대기 제목", "대기 문제", ["web"])],
      { confirm: false },
    );

    expect(await ids({ query: "대기" })).toEqual([]);

    expect(await ids({})).toEqual([note.noteId]);
  });

  test("does not search deleted quizzes or deleted notes", async () => {
    const note = await addNote("본문", [
      quiz("삭제될 제목", "문제", ["web"]),
    ]);

    const api = make();

    const [{ quizId }] = await api.request("noteQuizzes", {
      noteId: note.noteId,
      status: "CONFIRMED",
    });

    await api.request("deleteQuiz", { quizId });

    expect(await ids({ query: "삭제될" })).toEqual([]);

    const gone = await addNote("지워질 메모");

    await api.request("deleteNote", { noteId: gone.noteId });

    expect(await ids({ query: "지워질" })).toEqual([]);
  });

  test("rejects a query longer than 100 characters but allows exactly 100", async () => {
    const api = make();

    await expect(
      api.request("notes", { query: "가".repeat(101) }),
    ).rejects.toMatchObject({
      detail: { code: "VALIDATION_ERROR" },
    });

    await expect(
      api.request("notes", {
        query: ` ${"가".repeat(100)} `,
      }),
    ).resolves.toMatchObject({ total: 0 });

    await expect(
      api.request("notes", { query: 1 as never }),
    ).rejects.toMatchObject({
      detail: { code: "VALIDATION_ERROR" },
    });
  });
});

describe("tag filter", () => {
  async function seed() {
    const ts = await addNote("TS 메모", [
      quiz("타입", "문제", ["typescript"]),
    ]);

    const jsWeb = await addNote("JS 메모", [
      quiz("스코프", "문제", ["javascript", "web"]),
    ]);

    const web = await addNote("웹 메모", [
      quiz("HTTP", "문제", ["web"]),
    ]);

    const none = await addNote("퀴즈 없는 메모");

    const pending = await addNote(
      "대기만 있는 메모",
      [quiz("대기", "문제", ["java"])],
      { confirm: false },
    );

    return { ts, jsWeb, web, none, pending };
  }

  test("one tag", async () => {
    const { web, jsWeb } = await seed();

    expect(await ids({ tagIds: ["web"] })).toEqual([
      web.noteId,
      jsWeb.noteId,
    ]);
  });

  test("several tags are OR", async () => {
    const { ts, jsWeb, web } = await seed();

    expect(
      await ids({ tagIds: ["typescript", "javascript"] }),
    ).toEqual([jsWeb.noteId, ts.noteId]);

    expect(
      await ids({ tagIds: ["typescript", "web"] }),
    ).toEqual([web.noteId, jsWeb.noteId, ts.noteId]);
  });

  test("a PENDING quiz tag does not tag its note", async () => {
    await seed();

    expect(await ids({ tagIds: ["java"] })).toEqual([]);
  });

  test("untagged gathers notes without tags", async () => {
    const { none, pending } = await seed();

    expect(await ids({ untagged: true })).toEqual([
      pending.noteId,
      none.noteId,
    ]);
  });

  test("untagged together with tags is OR", async () => {
    const { ts, none, pending } = await seed();

    expect(
      await ids({
        untagged: true,
        tagIds: ["typescript"],
      }),
    ).toEqual([pending.noteId, none.noteId, ts.noteId]);
  });

  test("untagged false and an empty tag list filter nothing", async () => {
    const { ts, jsWeb, web, none, pending } = await seed();

    expect(await ids({ untagged: false, tagIds: [] })).toEqual([
      pending.noteId,
      none.noteId,
      web.noteId,
      jsWeb.noteId,
      ts.noteId,
    ]);
  });

  test("duplicate tag ids are fine; unknown or malformed ones are rejected", async () => {
    const { web, jsWeb } = await seed();

    expect(
      await ids({ tagIds: ["web", "web"] }),
    ).toEqual([web.noteId, jsWeb.noteId]);

    const api = make();

    for (const bad of [["nope"], "web", [1], [""]])
      await expect(
        api.request("notes", { tagIds: bad as never }),
      ).rejects.toMatchObject({
        detail: { code: "VALIDATION_ERROR" },
      });

    await expect(
      api.request("notes", { untagged: "yes" as never }),
    ).rejects.toMatchObject({
      detail: { code: "VALIDATION_ERROR" },
    });
  });

  test("search and tags must both match (AND)", async () => {
    const { web } = await seed();

    expect(
      await ids({ query: "http", tagIds: ["web"] }),
    ).toEqual([web.noteId]);

    expect(
      await ids({ query: "http", tagIds: ["typescript"] }),
    ).toEqual([]);

    expect(
      await ids({ query: "퀴즈 없는", untagged: true }),
    ).toHaveLength(1);

    expect(
      await ids({ query: "http", untagged: true }),
    ).toEqual([]);
  });
});

describe("paging and isolation", () => {
  test("total counts after filtering and the page is applied last, newest first", async () => {
    const created: string[] = [];

    for (const index of [1, 2, 3, 4, 5])
      created.push(
        (await addNote(`검색 대상 ${index}`)).noteId,
      );

    await addNote("관계 없음");

    const api = make();

    const page2 = await api.request("notes", {
      query: "검색 대상",
      pageSize: 2,
      page: 2,
    });

    expect(page2.total).toBe(5);

    expect(page2.items.map(({ noteId }) => noteId)).toEqual([
      created[2],
      created[1],
    ]);

    const beyond = await api.request("notes", {
      query: "검색 대상",
      pageSize: 2,
      page: 9,
    });

    expect(beyond).toMatchObject({ items: [], total: 5 });
  });

  test("never mixes another user's notes, quizzes or tags", async () => {
    await addNote(
      "친구 비밀",
      [quiz("친구 퀴즈", "문제", ["java"])],
      { userId: "friend" },
    );

    const mine = await addNote("내 메모");

    expect(await ids({ query: "친구" })).toEqual([]);
    expect(await ids({ tagIds: ["java"] })).toEqual([]);

    expect(await ids({ untagged: true })).toEqual([
      mine.noteId,
    ]);

    expect(await make().request("noteTags", {})).toEqual({
      tags: [],
      untaggedCount: 1,
    });
  });
});

describe("noteTags", () => {
  test("lists the tags of the user's live notes with counts and the untagged count", async () => {
    await addNote("a", [
      quiz("1", "문제", ["javascript", "web"]),
    ]);

    await addNote("b", [quiz("2", "문제", ["web"])]);
    await addNote("c");

    await addNote("d", [quiz("3", "문제", ["java"])], {
      confirm: false,
    });

    const gone = await addNote("e", [
      quiz("4", "문제", ["typescript"]),
    ]);

    await make().request("deleteNote", {
      noteId: gone.noteId,
    });

    expect(await make().request("noteTags", {})).toEqual({
      tags: [
        { hashtagId: "javascript", count: 1 },
        { hashtagId: "web", count: 2 },
      ],
      untaggedCount: 2,
    });
  });

  test("is empty without notes and rejects fields", async () => {
    const api = make();

    expect(await api.request("noteTags", {})).toEqual({
      tags: [],
      untaggedCount: 0,
    });

    await expect(
      api.request("noteTags", { page: 1 } as never),
    ).rejects.toMatchObject({
      detail: { code: "VALIDATION_ERROR" },
    });
  });
});
