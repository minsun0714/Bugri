"use client";

import { useEffect, useRef, useState } from "react";
import type { LearningDay } from "@/api/contracts";
import { Button, Tabs } from "@/components/ui";
import {
  PeriodView,
  monthDate,
  periodRange,
  shiftDays,
  shiftPeriod,
  sumCounts,
  weekdays,
} from "@/components/streak/periods";

function Bar({
  count,
  maximum,
}: {
  count: number;
  maximum: number;
}) {
  const height = (count / Math.max(1, maximum)) * 32;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 36"
      className="h-9 w-6 shrink-0"
    >
      {count > 0 ? (
        <rect
          x="4"
          y={34 - height}
          width="16"
          height={height}
          rx="3"
          className="fill-primary"
        />
      ) : (
        <path
          d="M4 34h16"
          className="stroke-line"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

export function ActivityPeriods({
  data,
}: {
  data: LearningDay;
}) {
  const root = useRef<HTMLDivElement>(null);
  const focusMonth = useRef(false);
  const [view, setView] = useState<PeriodView>(
    PeriodView.WEEK,
  );
  const [selected, setSelected] = useState<string | null>(
    null,
  );
  const {
    learningDate: today,
    dailyCounts,
    completedDates,
  } = data;
  const anchor = selected ?? today;
  const { start, end, title } = periodRange(view, anchor);
  const current = periodRange(view, today);
  const isCurrent =
    current.start === start && current.end === end;
  const next = shiftPeriod(view, anchor, 1);
  const previous = shiftPeriod(view, anchor, -1);
  const countByDate = new Map(
    dailyCounts.map(({ learningDate, count }) => [
      learningDate,
      count,
    ]),
  );
  const dayCount = (date: string) =>
    countByDate.get(date) ?? 0;
  const total = sumCounts(data, start, end);
  const week = Array.from({ length: 7 }, (_, index) =>
    shiftDays(start, index),
  );
  const monthDays = Number(end.slice(8));
  const offset = new Date(`${start}T12:00:00Z`).getUTCDay();
  const year = Number(start.slice(0, 4));
  const months = Array.from({ length: 12 }, (_, index) => {
    const value = monthDate(year, index + 1);
    const range = periodRange(PeriodView.MONTH, value);
    return {
      value,
      count: sumCounts(data, range.start, range.end),
      month: index + 1,
    };
  });
  const maximum =
    view === PeriodView.YEAR
      ? Math.max(1, ...months.map(({ count }) => count))
      : Math.max(1, ...week.map(dayCount));

  useEffect(() => {
    if (focusMonth.current && view === PeriodView.MONTH) {
      root.current
        ?.querySelector<HTMLButtonElement>(
          '[role="tab"][aria-selected="true"]',
        )
        ?.focus();
      focusMonth.current = false;
    }
  }, [view]);

  function chooseView(value: string) {
    if (
      !Object.values(PeriodView).includes(
        value as PeriodView,
      )
    )
      return;
    setView(value as PeriodView);
    setSelected(null);
  }

  function move(value: string) {
    const range = periodRange(view, value);
    setSelected(
      range.start === current.start &&
        range.end === current.end
        ? null
        : value,
    );
  }

  return (
    <div ref={root}>
      <Tabs
        items={Object.values(PeriodView)}
        value={view}
        onChange={chooseView}
        label="학습 기록 기간"
        className="[&_[role=tablist]]:gap-6 [&_[role=tab]]:min-w-12 [&_[role=tab]]:min-h-11 [&_.tab-panel]:pt-3"
        panelClassName="text-foreground"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-1">
            <Button
              variant="ghost"
              className="size-11 p-0"
              aria-label="이전 기간"
              disabled={previous < "0001-01-01"}
              onClick={() => move(previous)}
            >
              ‹
            </Button>
            <p
              className="text-center text-xs font-semibold tabular-nums sm:text-sm"
              aria-live="polite"
            >
              {title}
            </p>
            <Button
              variant="ghost"
              className="size-11 p-0"
              aria-label="다음 기간"
              disabled={
                isCurrent ||
                periodRange(view, next).start > today
              }
              onClick={() => move(next)}
            >
              ›
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-muted">
              완료한 퀴즈{" "}
              <strong className="ml-1 font-semibold text-foreground">
                총 {total.toLocaleString()}개
              </strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label="현재 기간"
              disabled={isCurrent}
              onClick={() => setSelected(null)}
            >
              {view === PeriodView.WEEK
                ? "최근 7일"
                : view === PeriodView.MONTH
                  ? "이번 달"
                  : "올해"}
            </Button>
          </div>
          {view === PeriodView.WEEK ? (
            <ol
              aria-label="7일 학습량"
              className="grid grid-cols-7 gap-2 sm:gap-3"
            >
              {week.map((date) => {
                const count = dayCount(date);
                const isToday = date === today;
                return (
                  <li
                    key={date}
                    aria-label={`${date}${isToday ? " 오늘" : ""} ${completedDates.includes(date) ? "학습 완료" : "미완료"}, ${count}개`}
                    aria-current={
                      isToday ? "date" : undefined
                    }
                    className="flex min-w-0 flex-col items-center gap-1.5"
                  >
                    <time
                      dateTime={date}
                      className={
                        isToday
                          ? "text-xs font-semibold"
                          : "text-xs text-muted"
                      }
                    >
                      {isToday
                        ? "오늘"
                        : weekdays[
                            new Date(
                              `${date}T12:00:00Z`,
                            ).getUTCDay()
                          ]}
                    </time>
                    <Bar count={count} maximum={maximum} />
                    <span className="text-xs tabular-nums">
                      {count.toLocaleString()}개
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : view === PeriodView.MONTH ? (
            <table
              aria-label={`${title} 학습 달력`}
              className="w-full table-fixed border-separate border-spacing-1 text-center"
            >
              <thead>
                <tr>
                  {weekdays.map((day) => (
                    <th
                      key={day}
                      scope="col"
                      className="pb-1 text-xs font-normal text-muted"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(
                  {
                    length: 6,
                  },
                  (_, row) => (
                    <tr key={row}>
                      {Array.from(
                        { length: 7 },
                        (_, column) => {
                          const number =
                            row * 7 + column - offset + 1;
                          if (
                            number < 1 ||
                            number > monthDays
                          )
                            return (
                              <td
                                key={column}
                                className="h-10 sm:h-12"
                              />
                            );
                          const date = shiftDays(
                            start,
                            number - 1,
                          );
                          const future = date > today;
                          const count = dayCount(date);
                          return (
                            <td
                              key={date}
                              aria-label={`${date}${date === today ? " 오늘" : ""}, ${future ? "예정" : `${count}개`}`}
                              aria-current={
                                date === today
                                  ? "date"
                                  : undefined
                              }
                              className={`h-10 rounded-lg px-0.5 py-0.5 text-xs sm:h-12 ${future ? "text-muted" : count > 0 ? "bg-primary/10 text-primary" : "bg-canvas text-muted"} ${date === today ? "ring-1 ring-inset ring-primary" : ""}`}
                            >
                              <time dateTime={date}>
                                {number}
                              </time>
                              <span className="mt-1 block font-medium tabular-nums">
                                {future
                                  ? "—"
                                  : `${count.toLocaleString()}개`}
                              </span>
                            </td>
                          );
                        },
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          ) : (
            <div
              aria-label={`${year}년 월별 학습량`}
              className="grid grid-cols-6 gap-1 sm:grid-cols-12 sm:gap-2"
            >
              {months.map(({ value, count, month }) => (
                <Button
                  key={value}
                  variant="ghost"
                  disabled={value > today}
                  aria-label={`${year}년 ${month}월, ${value > today ? "예정" : `${count}개, 월별 보기`}`}
                  className="h-auto min-w-0 flex-col gap-1 rounded-lg px-1 py-2 text-xs"
                  onClick={() => {
                    focusMonth.current = true;
                    setSelected(value);
                    setView(PeriodView.MONTH);
                  }}
                >
                  <span>{month}월</span>
                  <Bar count={count} maximum={maximum} />
                  <span className="tabular-nums">
                    {value > today
                      ? "—"
                      : `${count.toLocaleString()}개`}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
