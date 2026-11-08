import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { generatedContents } from "@/mocks/quizzes";
import { initialState, storageKey } from "@/mocks/storage";

const apiFor = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

beforeEach(() => localStorage.clear());

async function generate() {
  const api = apiFor();

  const note = await api.request("createNote", {
    content:
      "TypeScript number, let, const와 HTTP 요청 응답",
  });

  const created = await api.request("generate", {
    noteId: note.noteId,
  });

  return { api, note, created };
}

test("seed gives the learner confirmed, pending and empty notes", async () => {
  const api = apiFor();

  const { items } = await api.request("notes", {});

  const counts = items.map(
    ({ confirmedCount, pendingCount }) => [
      confirmedCount,
      pendingCount,
    ],
  );

  expect(counts).toEqual(
    expect.arrayContaining([
      [8, 0],
      [0, 2],
      [0, 0],
    ]),
  );
});

test("generation stores PENDING quizzes that cannot be solved", async () => {
  const { api, note, created } = await generate();

  expect(created).toHaveLength(4);

  expect(
    created.every(
      ({ status, confirmedAt, revision }) =>
        status === "PENDING" &&
        confirmedAt === null &&
        revision.sourceContent === note.content,
    ),
  ).toBe(true);

  expect(
    await api.request("note", { noteId: note.noteId }),
  ).toMatchObject({ pendingCount: 4, confirmedCount: 0 });

  await expect(
    api.request("startAttempt", {
      quizId: created[0].quizId,
      context: "DIRECT",
    }),
  ).rejects.toMatchObject({
    detail: { code: "QUIZ_UNAVAILABLE" },
  });
});

test("single and note-wide confirmation record the time", async () => {
  const { api, note, created } = await generate();

  const saved = await api.request("confirmQuiz", {
    quizId: created[0].quizId,
    expectedVersion: created[0].version,
  });

  expect(saved.status).toBe("CONFIRMED");
  expect(saved.confirmedAt).toEqual(expect.any(String));

  const rest = await api.request("confirmNoteQuizzes", {
    noteId: note.noteId,
  });

  expect(rest).toHaveLength(3);

  expect(
    await api.request("note", { noteId: note.noteId }),
  ).toMatchObject({ confirmedCount: 4, pendingCount: 0 });

  const attempt = await api.request("startAttempt", {
    quizId: saved.quizId,
    context: "DIRECT",
  });

  expect(attempt.quiz?.quizId).toBe(saved.quizId);
});

test("generating again keeps older PENDING quizzes", async () => {
  const { api, note } = await generate();

  await api.request("generate", { noteId: note.noteId });

  expect(
    (
      await api.request("noteQuizzes", {
        noteId: note.noteId,
        status: "PENDING",
      })
    ).length,
  ).toBe(8);
});

test("PENDING quizzes can be edited, refined and deleted; refine is PENDING-only", async () => {
  const { api, note, created } = await generate();

  const [first, second] = created;

  const edited = await api.request("updateQuiz", {
    quizId: first.quizId,
    expectedVersion: first.version,
    content: {
      ...generatedContents[0],
      title: "직접 수정",
    },
  });

  expect(edited.revision.title).toBe("직접 수정");
  expect(edited.version).toBe(first.version + 1);

  await expect(
    api.request("updateQuiz", {
      quizId: first.quizId,
      expectedVersion: first.version,
      content: generatedContents[0],
    }),
  ).rejects.toMatchObject({
    detail: { code: "VERSION_CONFLICT" },
  });

  const refined = await api.request("refineQuiz", {
    quizId: second.quizId,
    expectedVersion: second.version,
    prompt: "더 쉽게",
  });

  expect(refined.history).toHaveLength(1);

  await api.request("deleteQuiz", { quizId: first.quizId });

  expect(
    await api.request("note", { noteId: note.noteId }),
  ).toMatchObject({ pendingCount: 3 });

  const [confirmed] = await api.request(
    "confirmNoteQuizzes",
    { noteId: note.noteId },
  );

  await expect(
    api.request("refineQuiz", {
      quizId: confirmed.quizId,
      expectedVersion: confirmed.version,
      prompt: "다시",
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });
});

test("a confirmed edit applies at once and leaves finished Attempts unchanged", async () => {
  const { api, note } = await generate();

  const [quiz] = await api.request("confirmNoteQuizzes", {
    noteId: note.noteId,
  });

  const [{ answer: correct }] = generatedContents;

  const attempt = await api.request("startAttempt", {
    quizId: quiz.quizId,
    context: "DIRECT",
  });

  const done = await api.request("answer", {
    attemptId: attempt.attemptId,
    answer: correct,
  });

  const started = await api.request("startAttempt", {
    quizId: quiz.quizId,
    context: "DIRECT",
  });

  await api.request("updateQuiz", {
    quizId: quiz.quizId,
    expectedVersion: quiz.version,
    content: {
      ...generatedContents[0],
      title: "수정한 제목",
      answer: { type: "SINGLE_CHOICE", choiceId: "b" },
    },
  });

  expect(
    await api.request("attempt", {
      attemptId: attempt.attemptId,
    }),
  ).toEqual(done);

  expect(
    (
      await api.request("answer", {
        attemptId: started.attemptId,
        answer: correct,
      })
    ).correct,
  ).toBe(true);

  const next = await api.request("startAttempt", {
    quizId: quiz.quizId,
    context: "DIRECT",
  });

  expect(next.quiz?.title).toBe("수정한 제목");
});

test("deleting a memo soft-deletes its quizzes but keeps history", async () => {
  const { api, note } = await generate();

  const [quiz] = await api.request("confirmNoteQuizzes", {
    noteId: note.noteId,
  });

  await api.request("generate", { noteId: note.noteId });

  const attempt = await api.request("startAttempt", {
    quizId: quiz.quizId,
    context: "DIRECT",
  });

  await api.request("answer", {
    attemptId: attempt.attemptId,
    answer: generatedContents[0].answer,
  });

  await api.request("deleteNote", { noteId: note.noteId });

  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  const linked = state.quizzes.filter(
    ({ noteId }: { noteId: string }) =>
      noteId === note.noteId,
  );

  expect(linked).toHaveLength(8);

  expect(
    linked.every(
      ({ deletedAt }: { deletedAt: string | null }) =>
        !!deletedAt,
    ),
  ).toBe(true);

  expect(
    (
      await api.request("attempt", {
        attemptId: attempt.attemptId,
      })
    ).quiz,
  ).toBeNull();

  expect(
    (await api.request("attemptHistory", {})).items.some(
      (item) => item.attemptId === attempt.attemptId,
    ),
  ).toBe(true);
});

test("other users cannot reach a memo or its quizzes", async () => {
  const { note, created } = await generate();

  const friend = apiFor("friend");

  await expect(
    friend.request("generate", { noteId: note.noteId }),
  ).rejects.toMatchObject({
    detail: { code: "NOT_FOUND" },
  });

  await expect(
    friend.request("noteQuizzes", {
      noteId: note.noteId,
      status: "PENDING",
    }),
  ).rejects.toMatchObject({
    detail: { code: "NOT_FOUND" },
  });

  await expect(
    friend.request("confirmNoteQuizzes", {
      noteId: note.noteId,
    }),
  ).rejects.toMatchObject({
    detail: { code: "NOT_FOUND" },
  });

  await expect(
    friend.request("reviewQuiz", {
      quizId: created[0].quizId,
    }),
  ).rejects.toMatchObject({
    detail: { code: "NOT_FOUND" },
  });
});

test("another schemaVersion is replaced, while a corrupt schemaVersion 2 is preserved", async () => {
  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify({ schemaVersion: 1, obsolete: true }),
  );

  await apiFor().request("notes", {});

  expect(
    JSON.parse(localStorage.getItem(storageKey("learner"))!)
      .schemaVersion,
  ).toBe(2);

  const corrupt = JSON.stringify({
    ...initialState("learner"),
    quizzes: "broken",
  });

  localStorage.setItem(storageKey("learner"), corrupt);

  await expect(
    apiFor().request("notes", {}),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_CORRUPT" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    corrupt,
  );
});
