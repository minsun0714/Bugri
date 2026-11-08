import { QuizScope } from "@/api/constants";
import { createApiClient } from "@/api/client";
import type {
  Answer,
  QuizContent,
  ReviewQuiz,
} from "@/api/contracts";
import {
  createMockTransport,
  type MockOptions,
} from "@/mocks/adapter";
import { generatedContents } from "@/mocks/quizzes";
import { storageKey } from "@/mocks/storage";
import { localDate, streak } from "@/services/learning";

const api = (
  userId = "learner",
  options: Partial<MockOptions> = {},
) =>
  createApiClient(
    createMockTransport({
      userId,
      storage: localStorage,
      detectTimeZone: () => "Asia/Seoul",
      ...options,
    }),
  );

const plain = ({
  pending,
  active,
}: ReviewQuiz): QuizContent => {
  const {
    title,
    question,
    answer,
    explanation,
    hashtagIds,
  } = pending ?? active!;

  return {
    title,
    question,
    answer,
    explanation,
    hashtagIds,
  };
};

async function approve({
  quizId,
  ownerUserId,
  version,
}: ReviewQuiz) {
  const owner = api(ownerUserId);

  const { version: reviewedVersion } = await owner.request(
    "updatePending",
    {
      quizId,
      expectedVersion: version,
      action: "MARK_REVIEWED",
    },
  );

  return owner.request("approve", {
    quizId,
    expectedVersion: reviewedVersion,
  });
}

beforeEach(() => localStorage.clear());

test.each(["", "   ", "😀".repeat(10_001)])(
  "rejects invalid source length/blank",
  async (sourceContent) => {
    await expect(
      api().request("generate", {
        sourceContent,
      }),
    ).rejects.toMatchObject({
      detail: {
        code: "VALIDATION_ERROR",
      },
    });
  },
);

test("10,000 unicode code points and code formatting are preserved", async () => {
  const sourceContent = "😀".repeat(10_000);

  expect(
    (
      await api().request("generate", {
        sourceContent,
      })
    ).sourceContent,
  ).toBe(sourceContent);

  const code =
    '설명\n```ts\n  const x = "<script>";\n```\n```java\n  int y = 1;\n```';

  const b = await api().request("generate", {
    sourceContent: code,
  });

  const [q] = await api().request("saveBatch", {
    batchId: b.batchId,
    mode: "SINGLE",
    candidateId: b.candidates[0].candidateId,
  });

  expect(q.pending!.sourceContent).toBe(code);
});

test.each(
  [
    [],
    Array(6).fill(generatedContents[0]),
    [
      {
        ...generatedContents[0],
        hashtagIds: [
          "typescript",
          "javascript",
          "web",
          "java",
        ],
      },
    ],
    [
      {
        ...generatedContents[0],
        answer: {
          type: "SINGLE_CHOICE",
          choiceId: "missing",
        },
      },
    ],
  ].map((output) => ({
    output,
  })),
)(
  "rejects malformed generator output atomically",
  async ({ output }) => {
    await expect(
      api("learner", {
        generate: () => output,
      }).request("generate", {
        sourceContent: "test",
      }),
    ).rejects.toMatchObject({
      detail: {
        code: "GENERATION_FAILED",
      },
    });

    expect(
      localStorage.getItem(storageKey("learner")),
    ).toBeNull();
  },
);

test.each(
  generatedContents.map(
    (content) => [content.question.type, content] as const,
  ),
)(
  "grades %s and protects repeated submissions",
  async (_, content) => {
    const client = api("learner", {
      generate: () => [content],
    });

    const batch = await client.request("generate", {
      sourceContent: "학습",
    });

    const [pending] = await client.request("saveBatch", {
      batchId: batch.batchId,
      mode: "ALL",
    });

    await expect(
      client.request("startAttempt", {
        quizId: pending.quizId,
        context: "DIRECT",
      }),
    ).rejects.toMatchObject({
      detail: {
        code: "QUIZ_UNAVAILABLE",
      },
    });

    await expect(
      client.request("approve", {
        quizId: pending.quizId,
        expectedVersion: pending.version,
      }),
    ).rejects.toMatchObject({
      detail: {
        code: "NOT_REVIEWED",
      },
    });

    const q = await approve(pending);

    const attempt = await client.request("startAttempt", {
      quizId: q.quizId,
      context: "DIRECT",
    });

    const answer: Answer =
      content.answer.type === "MULTIPLE_CHOICE"
        ? {
            ...content.answer,
            choiceIds: [
              ...content.answer.choiceIds,
            ].reverse(),
          }
        : content.answer.type === "SHORT_ANSWER"
          ? {
              ...content.answer,
              text: ` ${content.answer.text} `,
            }
          : content.answer;

    const result = await client.request("answer", {
      attemptId: attempt.attemptId,
      answer,
    });

    expect(result.correct).toBe(true);

    expect(
      await client.request("answer", {
        attemptId: attempt.attemptId,
        answer,
      }),
    ).toEqual(result);

    expect(
      await api().request("attempt", {
        attemptId: attempt.attemptId,
      }),
    ).toEqual(result);

    await expect(
      api("friend").request("attempt", {
        attemptId: attempt.attemptId,
      }),
    ).rejects.toMatchObject({
      status: 404,
    });
  },
);

test("review state resets, stale versions fail, active revision remains and old attempts grade original answer", async () => {
  const owner = api("author"),
    learner = api();

  const attempt = await learner.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  const old = await owner.request("reviewQuiz", {
    quizId: "seed-quiz-1",
  });

  const edited = await owner.request("updatePending", {
    quizId: old.quizId,
    expectedVersion: old.version,
    action: "EDIT",
    sourceContent: "changed",
    content: {
      ...plain(old),
      answer: {
        type: "SINGLE_CHOICE",
        choiceId: "b",
      },
    },
  });

  expect(edited.active).toEqual(old.active);
  expect(edited.pending!.reviewed).toBe(false);

  await expect(
    owner.request("approve", {
      quizId: old.quizId,
      expectedVersion: old.version,
    }),
  ).rejects.toMatchObject({
    detail: {
      code: "VERSION_CONFLICT",
    },
  });

  const approved = await approve(edited);

  expect(approved.active!.answer).toEqual({
    type: "SINGLE_CHOICE",
    choiceId: "b",
  });

  const result = await learner.request("answer", {
    attemptId: attempt.attemptId,
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: "a",
    },
  });

  expect(result.correct).toBe(true);

  await expect(
    learner.request("answer", {
      attemptId: attempt.attemptId,
      answer: {
        type: "SINGLE_CHOICE",
        choiceId: "b",
      },
    }),
  ).rejects.toMatchObject({
    detail: {
      code: "ALREADY_ANSWERED",
    },
  });

  await expect(
    learner.request("reviewQuiz", {
      quizId: old.quizId,
    }),
  ).rejects.toMatchObject({
    status: 403,
  });
});

test("regeneration failure leaves old pending content and successful prompt intact", async () => {
  const owner = api("author");

  const first = await owner.request("regenerate", {
    quizId: "seed-quiz-1",
    expectedVersion: 1,
    prompt: "코드를 추가",
  });

  const before = localStorage.getItem(storageKey("author"));

  await expect(
    api("author", {
      generate: () => {
        throw new Error("timeout");
      },
    }).request("regenerate", {
      quizId: first.quizId,
      expectedVersion: first.version,
      prompt: "새 요청",
    }),
  ).rejects.toMatchObject({
    detail: {
      code: "GENERATION_FAILED",
    },
  });

  expect(localStorage.getItem(storageKey("author"))).toBe(
    before,
  );

  expect(
    (
      await owner.request("reviewQuiz", {
        quizId: first.quizId,
      })
    ).pending!.followUpPrompt,
  ).toBe("코드를 추가");
});

test("deleting a quiz blocks pending submissions, preserves completion and hides content", async () => {
  const learner = api("learner");

  const done = await learner.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  const pending = await learner.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  await learner.request("answer", {
    attemptId: done.attemptId,
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: "a",
    },
  });

  const day = await learner.request("learningDay", {});

  await api("author").request("deleteQuiz", {
    quizId: "seed-quiz-1",
  });

  await expect(
    learner.request("answer", {
      attemptId: pending.attemptId,
      answer: {
        type: "SINGLE_CHOICE",
        choiceId: "a",
      },
    }),
  ).rejects.toMatchObject({
    status: 409,
    detail: {
      code: "QUIZ_UNAVAILABLE",
    },
  });

  const retained = await learner.request("attempt", {
    attemptId: done.attemptId,
  });

  expect(retained.correct).toBe(true);
  expect(retained.quiz).toBeNull();
  expect(retained.result).toBeNull();

  expect(await learner.request("learningDay", {})).toEqual(
    day,
  );

  await expect(
    learner.request("startAttempt", {
      quizId: "seed-quiz-1",
      context: "DIRECT",
    }),
  ).rejects.toMatchObject({
    detail: {
      code: "QUIZ_UNAVAILABLE",
    },
  });
});

test("owner can solve; deleting twice is safe and blocks owner submission", async () => {
  const owner = api("author");

  const a = await owner.request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  await owner.request("deleteQuiz", {
    quizId: "seed-quiz-1",
  });

  await owner.request("deleteQuiz", {
    quizId: "seed-quiz-1",
  });

  await expect(
    owner.request("answer", {
      attemptId: a.attemptId,
      answer: {
        type: "SINGLE_CHOICE",
        choiceId: "a",
      },
    }),
  ).rejects.toMatchObject({
    detail: {
      code: "QUIZ_UNAVAILABLE",
    },
  });

  expect(
    (
      await owner.request("quizzes", {
        scope: QuizScope.OWN,
      })
    ).map((q) => q.quizId),
  ).not.toContain("seed-quiz-1");
});

test("unknown fields and wrong answer shapes are rejected", async () => {
  await expect(
    api().request("startAttempt", {
      quizId: "seed-quiz-1",
      context: "DIRECT",
      unknown: true,
    } as never),
  ).rejects.toMatchObject({
    detail: {
      code: "VALIDATION_ERROR",
    },
  });

  const a = await api().request("startAttempt", {
    quizId: "seed-quiz-1",
    context: "DIRECT",
  });

  await expect(
    api().request("answer", {
      attemptId: a.attemptId,
      answer: {
        type: "TRUE_FALSE",
        value: true,
      },
    }),
  ).rejects.toMatchObject({
    detail: {
      code: "VALIDATION_ERROR",
    },
  });
});

test("storage failure rolls back and corrupt state is not overwritten", async () => {
  const client = api();

  await client.request("learningDay", {});

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  const broken = api("learner", {
    storage: {
      getItem: (key) => localStorage.getItem(key),
      setItem: () => {
        throw new Error("quota");
      },
    },
  });

  await expect(
    broken.request("startAttempt", {
      quizId: "seed-quiz-1",
      context: "DIRECT",
    }),
  ).rejects.toMatchObject({
    detail: {
      code: "STORAGE_UNAVAILABLE",
    },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    before,
  );

  localStorage.setItem(storageKey("learner"), "{broken");

  await expect(
    client.request("learningDay", {}),
  ).rejects.toMatchObject({
    detail: {
      code: "STORAGE_CORRUPT",
    },
  });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    "{broken",
  );

  localStorage.clear();

  expect(
    (await client.request("learningDay", {})).completed,
  ).toBe(false);
});

test("timezone detection, explicit fallback and saved detection; no implicit fallback", async () => {
  const client = api("learner", {
    detectTimeZone: () => undefined,
  });

  expect(
    (await client.request("learningTimezone", {})).timeZone,
  ).toBeNull();

  await expect(
    client.request("learningDay", {}),
  ).rejects.toMatchObject({
    detail: {
      code: "TIMEZONE_REQUIRED",
    },
  });

  expect(
    (
      await api("learner", {
        detectTimeZone: () => undefined,
        fallbackTimeZone: "UTC",
      }).request("learningTimezone", {})
    ).timeZone,
  ).toBe("UTC");

  localStorage.clear();

  expect(
    (
      await api("learner", {
        detectTimeZone: () => "America/New_York",
      }).request("learningTimezone", {})
    ).timeZone,
  ).toBe("America/New_York");

  // The first detection is saved; a later device zone does not rewrite it.
  expect(
    (
      await api("learner", {
        detectTimeZone: () => "Asia/Seoul",
      }).request("learningTimezone", {})
    ).timeZone,
  ).toBe("America/New_York");
});

function changeStoredTimeZone(timeZone: string) {
  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  state.timeZone = timeZone;

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );
}

test("daily completion/replay count once, midnight, and timezone changes preserve past attribution", async () => {
  let now = new Date("2026-03-07T14:59:00Z");

  const client = api("learner", {
    now: () => now,
  });

  async function complete() {
    const a = await client.request("startAttempt", {
      quizId: "seed-quiz-1",
      context: "DIRECT",
    });

    return client.request("answer", {
      attemptId: a.attemptId,
      answer: {
        type: "SINGLE_CHOICE",
        choiceId: "b",
      },
    });
  }

  const first = await complete();

  await complete();

  expect(
    (await client.request("learningDay", {})).dailyCounts,
  ).toEqual([{ learningDate: "2026-03-07", count: 1 }]);

  now = new Date("2026-03-07T15:01:00Z");
  await complete();

  expect(
    (await client.request("learningDay", {})).streak,
  ).toBe(2);

  changeStoredTimeZone("America/New_York");

  expect(
    await client.request("attempt", {
      attemptId: first.attemptId,
    }),
  ).toEqual(first);

  await complete();

  expect(
    (
      await client.request("learningDay", {})
    ).dailyCounts.slice(0, 2),
  ).toEqual([
    { learningDate: "2026-03-07", count: 1 },
    { learningDate: "2026-03-08", count: 1 },
  ]);
});

test("timezone local dates across DST and stale streaks", () => {
  expect(
    localDate(
      new Date("2026-03-08T04:59:00Z"),
      "America/New_York",
    ),
  ).toBe("2026-03-07");

  expect(
    localDate(
      new Date("2026-03-08T07:01:00Z"),
      "America/New_York",
    ),
  ).toBe("2026-03-08");

  expect(
    localDate(
      new Date("2026-03-08T04:59:00Z"),
      "Asia/Seoul",
    ),
  ).toBe("2026-03-08");

  expect(
    localDate(
      new Date("2026-11-01T06:01:00Z"),
      "America/New_York",
    ),
  ).toBe("2026-11-01");

  expect(
    streak(["2026-03-06", "2026-03-07"], "2026-03-08"),
  ).toBe(2);

  expect(
    streak(["2026-03-06", "2026-03-07"], "2026-03-09"),
  ).toBe(0);
});

test("learning volume counts distinct quizzes per stored local date, retaining wrong answers and deleted content", async () => {
  let now = new Date("2026-03-07T14:59:00Z");
  const client = api("learner", { now: () => now });

  async function complete(quizId: string, answer: Answer) {
    const { attemptId } = await client.request(
      "startAttempt",
      { quizId, context: "DIRECT" },
    );

    await client.request("answer", { attemptId, answer });
  }

  const wrong: Answer = {
    type: "SINGLE_CHOICE",
    choiceId: "a",
  };

  await complete("seed-quiz-1", wrong);
  await complete("seed-quiz-1", wrong);

  await complete("seed-quiz-2", {
    type: "MULTIPLE_CHOICE",
    choiceIds: ["a"],
  });

  await client.request("startAttempt", {
    quizId: "seed-quiz-3",
    context: "DIRECT",
  });

  expect(
    (await client.request("learningDay", {})).dailyCounts,
  ).toEqual([{ learningDate: "2026-03-07", count: 2 }]);

  now = new Date("2026-03-07T15:01:00Z");
  await complete("seed-quiz-1", wrong);

  changeStoredTimeZone("America/New_York");

  const owner = api("author");

  await owner.request("deleteQuiz", {
    quizId: "seed-quiz-1",
  });

  expect(
    (await client.request("learningDay", {})).dailyCounts,
  ).toEqual([
    { learningDate: "2026-03-07", count: 2 },
    { learningDate: "2026-03-08", count: 1 },
  ]);

  expect(
    (await api("friend").request("learningDay", {}))
      .dailyCounts,
  ).toEqual([]);
});
