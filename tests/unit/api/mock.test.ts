import {
  QuizScope,
  QuizStatus,
  LearningState,
} from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

const make = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

beforeEach(() => localStorage.clear());

test("generation is owner-only; individual then bulk save does not duplicate candidates", async () => {
  const api = make();

  const batch = await api.request("generate", {
    sourceContent: "배운 내용\n```ts\nconst x = 1;\n```",
  });

  expect(batch.candidates.length).toBeGreaterThanOrEqual(1);
  expect(batch.candidates.length).toBeLessThanOrEqual(5);

  expect(
    await api.request("quizzes", {
      scope: QuizScope.OWN,
    }),
  ).toHaveLength(0);

  const [first] = await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "SINGLE",
    candidateId: batch.candidates[0].candidateId,
  });

  expect(first.status).toBe(QuizStatus.PENDING);

  await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "ALL",
  });

  await api.request("saveBatch", {
    batchId: batch.batchId,
    mode: "ALL",
  });

  expect(
    await make().request("quizzes", {
      scope: QuizScope.OWN,
    }),
  ).toHaveLength(batch.candidates.length);

  await expect(
    make("author").request("generationBatch", {
      batchId: batch.batchId,
    }),
  ).rejects.toMatchObject({
    status: 404,
  });
});

test("learning never exposes answers; wrong answers and replays count once per day", async () => {
  const api = make();

  await api.request("subscribe", {
    type: "PERSON",
    authorUserId: "author",
  });

  const selection = await api.request("learningQuiz", {
    hashtagId: "typescript",
  });

  expect(selection.state).toBe(LearningState.AVAILABLE);

  expect(JSON.stringify(selection)).not.toMatch(
    /"answer"|"explanation"|"sourceContent"/,
  );

  const attempt = await api.request("startAttempt", {
    quizId: selection.quiz!.quizId,
    context: "LEARNING",
  });

  expect(attempt.result).toBeNull();

  const result = await api.request("answer", {
    attemptId: attempt.attemptId,
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: "b",
    },
  });

  expect(result.correct).toBe(false);

  expect(
    (await api.request("learningDay", {})).completed,
  ).toBe(true);

  expect(
    (await api.request("learningNext", {})).hashtagId,
  ).toBe("typescript");

  const replay = await api.request("startAttempt", {
    quizId: selection.quiz!.quizId,
    context: "LEARNING",
  });

  await api.request("answer", {
    attemptId: replay.attemptId,
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: "a",
    },
  });

  expect(
    (await api.request("learningDay", {})).completedDates,
  ).toHaveLength(1);
});

test("purchase retry deducts once, equipment requires ownership, state survives reload and is isolated", async () => {
  const api = make();

  const { balance: before } = await api.request(
    "wallet",
    {},
  );

  const [product] = await api.request("products", {});

  const purchase = await api.request("purchase", {
    productId: product.productId,
    requestKey: "buy-1",
  });

  expect(
    await api.request("purchase", {
      productId: product.productId,
      requestKey: "buy-1",
    }),
  ).toEqual(purchase);

  expect((await make().request("wallet", {})).balance).toBe(
    before - product.price,
  );

  await api.request("equip", {
    category: product.category,
    productId: product.productId,
  });

  expect(
    (await make().request("inventory", {})).equipment[
      product.category
    ],
  ).toBe(product.productId);

  expect(
    (await make("author").request("inventory", {}))
      .products,
  ).toHaveLength(0);
});

test("public desk exposes only the user and equipment, never wallet or inventory", async () => {
  const owner = make();
  const [product] = await owner.request("products", {});

  await owner.request("purchase", {
    productId: product.productId,
    requestKey: "public-desk-purchase",
  });

  await owner.request("equip", {
    category: product.category,
    productId: product.productId,
  });

  const profile = await make("friend").request(
    "publicProfile",
    {
      publicId: "bugri-learner",
    },
  );

  expect(profile).toEqual({
    user: {
      userId: "learner",
      publicId: "bugri-learner",
      displayName: "학습자",
    },
    equipment: {
      [product.category]: product.productId,
    },
    positions: {},
  });
});
