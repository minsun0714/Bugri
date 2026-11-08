import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";
import { LearningState } from "@/api/constants";

const api = (userId = "learner") =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

beforeEach(() => localStorage.clear());

test("learner demo subscriptions cover all four formats; other users remain empty", async () => {
  const client = api();

  expect(
    await client.request("subscriptions", {}),
  ).toHaveLength(3);

  const types = new Set<string>();

  for (let i = 0; i < 4; i++) {
    const selection = await client.request(
      i === 0 ? "learningQuiz" : "learningNext",
      {},
    );

    expect(selection.candidateCount).toBe(4);
    types.add(selection.quiz!.question.type);
  }

  expect(types.size).toBe(4);

  expect(
    localStorage.getItem(storageKey("author")),
  ).toBeNull();

  expect(
    localStorage.getItem(storageKey("friend")),
  ).toBeNull();

  for (const userId of ["author", "friend"]) {
    expect(
      (await api(userId).request("learningQuiz", {})).state,
    ).toBe(LearningState.EMPTY);
  }
});

test("legacy migration preserves saved records and deduplicates existing targets", async () => {
  const client = api();

  const attempt = await client.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  await client.request("answer", {
    attemptId: attempt.attemptId,
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
  });

  const [product] = await client.request("products", {});

  await client.request("purchase", {
    productId: product.productId,
    requestKey: "preserve-purchase",
  });

  const old = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  delete old.learningDemoVersion;

  old.subscriptions = [
    {
      type: "PERSON",
      authorUserId: "author",
      subscriptionId: "existing-person",
    },
  ];

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(old),
  );

  await client.request("subscriptions", {});

  const saved = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  expect(saved.learningDemoVersion).toBe(1);
  expect(saved.subscriptions).toHaveLength(3);

  expect(saved.subscriptions).toContainEqual(
    old.subscriptions[0],
  );

  expect({
    ...saved,
    subscriptions: old.subscriptions,
    learningDemoVersion: undefined,
  }).toEqual({ ...old, learningDemoVersion: undefined });

  expect(
    (
      await client.request("attempt", {
        attemptId: attempt.attemptId,
      })
    ).correct,
  ).toBe(true);
});

test("unsubscribing stays empty across requests and adapter recreation", async () => {
  const client = api();

  for (const { subscriptionId } of await client.request(
    "subscriptions",
    {},
  )) {
    await client.request("unsubscribe", { subscriptionId });
  }

  expect(
    (await api().request("learningQuiz", {})).state,
  ).toBe(LearningState.EMPTY);

  expect(await api().request("subscriptions", {})).toEqual(
    [],
  );
});

test("legacy seed save failure keeps the original snapshot and retries safely", async () => {
  const old: ReturnType<typeof initialState> & {
    learningDemoVersion?: 1;
  } = initialState("learner");

  delete old.learningDemoVersion;
  old.subscriptions = [];
  old.timeZone = "Asia/Seoul";

  const raw = JSON.stringify(old);

  localStorage.setItem(storageKey("learner"), raw);

  const write = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementationOnce(() => {
      throw new Error("full");
    });

  await expect(
    api().request("subscriptions", {}),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_UNAVAILABLE" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    raw,
  );

  write.mockRestore();

  expect(
    await api().request("subscriptions", {}),
  ).toHaveLength(3);
});

test("coin demo history spans pages without changing balance or saved purchases", async () => {
  const state = initialState("learner");

  expect(state.ledger.length).toBeGreaterThan(20);

  expect(
    state.ledger.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    ),
  ).toBe(100);

  const legacy = {
    ...state,
    coinHistoryDemoVersion: undefined,
    ledger: [
      {
        id: "seed-balance-learner",
        amount: 100,
        reason: "SEED",
        reference: "learner",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  };

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(legacy),
  );

  const client = api();
  const [product] = await client.request("products", {});

  await client.request("purchase", {
    productId: product.productId,
    requestKey: "demo-preserve",
  });

  const wallet = await client.request("wallet", {});

  expect(wallet.balance).toBe(100 - product.price);

  expect(
    wallet.ledger.filter(
      ({ reason }) => reason === "PURCHASE",
    ),
  ).toHaveLength(1);

  expect(wallet.ledger).toHaveLength(26);
  expect(await api().request("wallet", {})).toEqual(wallet);

  expect(
    localStorage.getItem(storageKey("friend")),
  ).toBeNull();
});

test("coin history migration preserves custom ledgers and failed writes", async () => {
  const state = initialState("learner");

  delete state.coinHistoryDemoVersion;

  state.ledger = [
    {
      id: "custom",
      amount: 7,
      reason: "SEED",
      reference: "custom",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  const raw = JSON.stringify(state);

  localStorage.setItem(storageKey("learner"), raw);

  const blocked = createApiClient(
    createMockTransport({
      userId: "learner",
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: () => {
          throw new Error("quota");
        },
      },
      detectTimeZone: () => "Asia/Seoul",
    }),
  );

  await expect(
    blocked.request("wallet", {}),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_UNAVAILABLE" },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    raw,
  );

  expect(await api().request("wallet", {})).toEqual({
    balance: 7,
    ledger: state.ledger,
  });
});
