import { createApiClient } from "@/api/client";
import { QuizScope } from "@/api/constants";
import { createMockTransport } from "@/mocks/adapter";

const make = (userId = "learner") =>
  createApiClient(createMockTransport({ userId }));

beforeEach(() => localStorage.clear());

test("chat does not generate quizzes; explicit generation preserves conversation and unsent draft", async () => {
  const api = make();

  const empty = await api.request(
    "authoringConversation",
    {},
  );

  const conversation = await api.request(
    "sendAuthoringMessage",
    {
      content: "클로저가 뭐야?\n```js\n  const n = 1;\n```",
      expectedVersion: empty.version,
    },
  );

  expect(
    conversation.messages.map(({ role }) => role),
  ).toEqual(["USER", "ASSISTANT"]);

  expect(conversation.latestBatchId).toBeNull();

  const result = await api.request(
    "generateFromConversation",
    {
      expectedVersion: conversation.version,
      draft: "아직 보내지 않은 질문",
    },
  );

  expect(result.batch.sourceContent).toContain(
    "클로저가 뭐야?",
  );

  expect(result.batch.sourceContent).not.toContain(
    "아직 보내지 않은 질문",
  );

  expect(result.conversation.messages).toEqual(
    conversation.messages,
  );

  expect(result.conversation.draft).toBe(
    "아직 보내지 않은 질문",
  );

  expect(result.conversation.latestBatchId).toBe(
    result.batch.batchId,
  );

  expect(
    await make().request("authoringConversation", {}),
  ).toEqual(result.conversation);

  expect(
    await api.request("quizzes", { scope: QuizScope.OWN }),
  ).toHaveLength(0);

  expect(
    (
      await make("friend").request(
        "authoringConversation",
        {},
      )
    ).messages,
  ).toHaveLength(0);
});

test("failed reply and stale requests leave the conversation unchanged", async () => {
  const api = make();

  const empty = await api.request(
    "authoringConversation",
    {},
  );

  const failing = createApiClient(
    createMockTransport({
      userId: "learner",
      reply: () => {
        throw new Error("timeout");
      },
    }),
  );

  await expect(
    failing.request("sendAuthoringMessage", {
      content: "질문",
      expectedVersion: empty.version,
    }),
  ).rejects.toMatchObject({
    detail: { code: "GENERATION_FAILED" },
  });

  expect(
    await api.request("authoringConversation", {}),
  ).toEqual(empty);

  const saved = await api.request("sendAuthoringMessage", {
    content: "HTTP 설명해줘",
    expectedVersion: empty.version,
  });

  await expect(
    api.request("sendAuthoringMessage", {
      content: "오래된 탭",
      expectedVersion: empty.version,
    }),
  ).rejects.toMatchObject({
    detail: { code: "VERSION_CONFLICT" },
  });

  expect(
    await api.request("authoringConversation", {}),
  ).toEqual(saved);
});

test("empty conversation cannot generate and failed generation preserves conversation", async () => {
  const api = make();

  await expect(
    api.request("generateFromConversation", {
      expectedVersion: 0,
      draft: "",
    }),
  ).rejects.toMatchObject({
    detail: { code: "VALIDATION_ERROR" },
  });

  const conversation = await api.request(
    "sendAuthoringMessage",
    { expectedVersion: 0, content: "타입 설명" },
  );

  const failing = createApiClient(
    createMockTransport({
      userId: "learner",
      generate: () => [],
    }),
  );

  await expect(
    failing.request("generateFromConversation", {
      expectedVersion: conversation.version,
      draft: "추가 입력",
    }),
  ).rejects.toMatchObject({
    detail: { code: "GENERATION_FAILED" },
  });

  expect(
    await api.request("authoringConversation", {}),
  ).toEqual(conversation);
});
