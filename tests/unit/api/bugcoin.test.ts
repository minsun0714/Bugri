import {
  calculateRewards,
  REVIEW_INTERVAL_MS,
} from "@/services/bugcoin";

const base = {
  userId: "learner",
  ownerUserId: "author",
  quizId: "quiz",
  attemptId: "attempt",
  correct: true,
  quizCreatedAt: "2026-01-01T00:00:00.000Z",
  now: new Date("2026-02-01T00:00:00.000Z"),
  timeZone: "Asia/Seoul",
  previousAttempts: [],
  rewards: [],
};

test("first correct gives 100 + 100 and creator 40 BugCent", () => {
  expect(
    calculateRewards(base).map(
      ({ amountBugCent }) => amountBugCent,
    ),
  ).toEqual([100, 100, 40]);
});

test("wrong then correct retains history across dates", () => {
  const previousAttempts = [
    {
      quizId: "quiz",
      correct: false,
      completedAt: "2026-01-01T00:00:00Z",
    },
  ];

  expect(
    calculateRewards({ ...base, previousAttempts }).map(
      ({ amountBugCent }) => amountBugCent,
    ),
  ).toEqual([50, 100]);
});

test("wrong answer gives only creator reward", () => {
  expect(
    calculateRewards({ ...base, correct: false }).map(
      ({ amountBugCent }) => amountBugCent,
    ),
  ).toEqual([40]);
});

test("repeated submission and same-day new attempts do not mint again", () => {
  const rewards = calculateRewards(base);

  expect(calculateRewards({ ...base, rewards })).toEqual(
    [],
  );

  expect(
    calculateRewards({
      ...base,
      attemptId: "next",
      rewards,
    }),
  ).toEqual([]);
});

test.each([-1, 0])(
  "review boundary offset %i milliseconds",
  (offset) => {
    const rewards = calculateRewards(base);

    const result = calculateRewards({
      ...base,
      attemptId: "review",
      rewards,
      now: new Date(
        base.now.getTime() + REVIEW_INTERVAL_MS + offset,
      ),
    });

    expect(
      result
        .filter(({ reason }) => reason === "REVIEW")
        .map(({ amountBugCent }) => amountBugCent),
    ).toEqual(offset === 0 ? [20] : []);
  },
);

test("owner private/public eligibility starts at creation + 168 hours", () => {
  const own = {
    ...base,
    ownerUserId: "learner",
    quizCreatedAt: base.now.toISOString(),
  };

  expect(calculateRewards(own)).toEqual([]);

  expect(
    calculateRewards({
      ...own,
      now: new Date(
        base.now.getTime() + REVIEW_INTERVAL_MS,
      ),
    }).map(({ amountBugCent }) => amountBugCent),
  ).toEqual([20, 100]);
});

test("daily bonus does not reset problem reward clock", () => {
  const rewards = calculateRewards(base);

  rewards.push(
    ...calculateRewards({
      ...base,
      attemptId: "tomorrow",
      rewards,
      now: new Date(base.now.getTime() + 86400000),
    }),
  );

  expect(
    calculateRewards({
      ...base,
      attemptId: "review",
      rewards,
      now: new Date(
        base.now.getTime() + REVIEW_INTERVAL_MS,
      ),
    }).map(({ amountBugCent }) => amountBugCent),
  ).toEqual([20, 100]);
});

test("timezone changes compare stored calendar dates without rewriting rewards", () => {
  const rewards = calculateRewards(base);

  expect(
    calculateRewards({
      ...base,
      attemptId: "next",
      rewards,
      timeZone: "UTC",
    }),
  ).toEqual([]);

  expect(rewards[1].learningDate).toBe("2026-02-01");
});

test("review repeats after each 168 hour interval without a daily cap", () => {
  const rewards = calculateRewards(base);

  for (let week = 1; week <= 20; week++) {
    const granted = calculateRewards({
      ...base,
      rewards,
      attemptId: `week-${week}`,
      now: new Date(
        base.now.getTime() + REVIEW_INTERVAL_MS * week,
      ),
    });

    expect(
      granted.map(({ amountBugCent }) => amountBugCent),
    ).toEqual([20, 100]);

    rewards.push(...granted);
  }

  expect(
    rewards
      .filter(({ userId }) => userId === "learner")
      .reduce(
        (sum, { amountBugCent }) => sum + amountBugCent,
        0,
      ),
  ).toBe(2600);
});

test("missing legacy creation time does not invent owner eligibility", () => {
  expect(
    calculateRewards({
      ...base,
      ownerUserId: "learner",
      quizCreatedAt: undefined,
    }),
  ).toEqual([]);
});
