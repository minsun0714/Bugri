import type { LearningDay } from "@/api/contracts";

export const PeriodView = {
  MONTH: "월",
  YEAR: "년",
} as const;

export type PeriodView =
  (typeof PeriodView)[keyof typeof PeriodView];

export const weekdays = [
  "일",
  "월",
  "화",
  "수",
  "목",
  "금",
  "토",
];

export function shiftDays(
  value: string,
  amount: number,
): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function monthDate(
  year: number,
  month: number,
): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;
}

export function periodRange(
  view: PeriodView,
  anchor: string,
) {
  const year = Number(anchor.slice(0, 4));
  const month = Number(anchor.slice(5, 7));
  if (view === PeriodView.YEAR)
    return {
      start: monthDate(year, 1),
      end: `${year}-12-31`,
      title: `${year}년`,
    };
  const next =
    month === 12
      ? monthDate(year + 1, 1)
      : monthDate(year, month + 1);
  return {
    start: monthDate(year, month),
    end: shiftDays(next, -1),
    title: `${year}년 ${month}월`,
  };
}

export function shiftPeriod(
  view: PeriodView,
  anchor: string,
  direction: number,
): string {
  const year = Number(anchor.slice(0, 4));
  const month = Number(anchor.slice(5, 7));
  if (view === PeriodView.YEAR)
    return monthDate(year + direction, 1);
  const index = year * 12 + month - 1 + direction;
  return monthDate(
    Math.floor(index / 12),
    (index % 12) + 1,
  );
}

export function sumCounts(
  data: LearningDay,
  start: string,
  end: string,
): number {
  return data.dailyCounts.reduce(
    (total, { learningDate, count }) =>
      learningDate >= start &&
      learningDate <= end &&
      learningDate <= data.learningDate
        ? total + count
        : total,
    0,
  );
}
