import {
  addDays,
  dateDistance,
  firstReview,
  nextReview,
  reviewIntervals,
} from "@/services/review-schedule";

test("intervals follow 1 → 3 → 7 → 14 → 30 days", () => {
  expect(reviewIntervals).toEqual([1, 3, 7, 14, 30]);
});

test("the first review is the day after the memo was confirmed", () => {
  expect(
    firstReview("2026-11-08T03:00:00.000Z", "Asia/Seoul"),
  ).toEqual({ stage: 0, nextReviewDate: "2026-11-09" });
});

test("the first review date uses the learner's local date, not UTC", () => {
  // 2026-11-08 20:00 UTC is already 11-09 05:00 in Seoul but still 11-08 15:00 in New York.
  const confirmedAt = "2026-11-08T20:00:00.000Z";

  expect(firstReview(confirmedAt, "Asia/Seoul")).toEqual({
    stage: 0,
    nextReviewDate: "2026-11-10",
  });

  expect(
    firstReview(confirmedAt, "America/New_York"),
  ).toEqual({ stage: 0, nextReviewDate: "2026-11-09" });
});

test("the first review across a spring-forward day is still the next calendar day", () => {
  // New York 2026-03-08 01:30 EST; DST starts at 02:00 the same day.
  expect(
    firstReview(
      "2026-03-08T06:30:00.000Z",
      "America/New_York",
    ).nextReviewDate,
  ).toBe("2026-03-09");

  // 2026-11-01 01:30 EDT (UTC-4), DST ends at 02:00 that day.
  expect(
    firstReview(
      "2026-11-01T05:30:00.000Z",
      "America/New_York",
    ).nextReviewDate,
  ).toBe("2026-11-02");
});

test("a correct answer moves to the next step from the review date", () => {
  expect(
    nextReview({
      stage: 0,
      correct: true,
      date: "2026-11-09",
    }),
  ).toEqual({
    stage: 1,
    intervalDays: 3,
    nextReviewDate: "2026-11-12",
  });
});

test("consecutive correct answers reach 30 days and stay there", () => {
  let current = { stage: 0, date: "2026-01-01" };

  const intervals: number[] = [];

  for (let round = 0; round < 7; round++) {
    const next = nextReview({ ...current, correct: true });

    intervals.push(next.intervalDays);
    current = {
      stage: next.stage,
      date: next.nextReviewDate,
    };
  }

  expect(intervals).toEqual([3, 7, 14, 30, 30, 30, 30]);
  expect(current.stage).toBe(4);
});

test("a wrong answer brings the quiz back tomorrow and resets the interval", () => {
  expect(
    nextReview({
      stage: 3,
      correct: false,
      date: "2026-11-20",
    }),
  ).toEqual({
    stage: 0,
    intervalDays: 1,
    nextReviewDate: "2026-11-21",
  });

  // The step after a reset starts from 3 days again.
  expect(
    nextReview({
      stage: 0,
      correct: true,
      date: "2026-11-21",
    }).intervalDays,
  ).toBe(3);
});

test("month ends, year ends and leap days roll over", () => {
  expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  expect(addDays("2027-02-28", 1)).toBe("2027-03-01");

  expect(
    nextReview({
      stage: 3,
      correct: true,
      date: "2026-12-10",
    }).nextReviewDate,
  ).toBe("2027-01-09");
});

test("adding days is pure calendar arithmetic across daylight saving changes", () => {
  expect(addDays("2026-03-07", 3)).toBe("2026-03-10");
  expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
  expect(addDays("2026-11-08", 0)).toBe("2026-11-08");
});

test("a changed time zone does not rewrite a stored date", () => {
  // Dates are plain calendar strings. Moving from Seoul to New York keeps them.
  const stored = nextReview({
    stage: 1,
    correct: true,
    date: "2026-11-10",
  });

  expect(stored.nextReviewDate).toBe("2026-11-17");
  // The next calculation uses whatever date the caller supplies for the new zone.
  expect(
    nextReview({
      stage: stored.stage,
      correct: true,
      date: "2026-11-16",
    }).nextReviewDate,
  ).toBe("2026-11-30");
});

test("dateDistance counts calendar days", () => {
  expect(dateDistance("2026-11-08", "2026-11-11")).toBe(3);
  expect(dateDistance("2026-12-30", "2027-01-02")).toBe(3);
  expect(dateDistance("2026-11-08", "2026-11-08")).toBe(0);
  expect(dateDistance("2026-11-10", "2026-11-08")).toBe(-2);
});
