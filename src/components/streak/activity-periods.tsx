"use client";

import { useEffect, useRef, useState } from "react";
import type { LearningDay } from "@/api/contracts";
import { Button } from "@/components/ui";
import { Dropdown } from "@/components/ui/dropdown";
import {
  PeriodView,
  firstLearningDate,
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
  const width = (count / Math.max(1, maximum)) * 100;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      className="h-2 min-w-0 flex-1 overflow-hidden rounded-full"
    >
      <rect width="100" height="8" className="fill-line" />
      <rect
        width={width}
        height="8"
        className="fill-primary"
      />
    </svg>
  );
}

export function ActivityPeriods({
  data,
}: {
  data: LearningDay;
}) {
  const root = useRef<HTMLDivElement>(null);
  const focusHeading = useRef(false);
  const [view, setView] = useState<PeriodView>(
    PeriodView.MONTH,
  );
  const [selected, setSelected] = useState<string | null>(
    null,
  );
  const {
    learningDate: today,
    dailyCounts,
    completedDates,
  } = data;
  const firstDate = firstLearningDate(data);
  const firstMonth = periodRange(
    PeriodView.MONTH,
    firstDate,
  ).start;
  const earliest = periodRange(view, firstDate).start;
  const requested = selected ?? today;
  const anchor =
    requested < firstDate ? firstDate : requested;
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
  const maximum = Math.max(
    1,
    ...months.map(({ count }) => count),
  );

  useEffect(() => {
    if (focusHeading.current) {
      root.current
        ?.querySelector<HTMLButtonElement>(
          '[data-period-heading], [role="combobox"]',
        )
        ?.focus();
      focusHeading.current = false;
    }
  }, [view]);

  function openHeading() {
    focusHeading.current = true;
    setView(PeriodView.YEAR);
  }

  function returnToMonth() {
    focusHeading.current = true;
    setView(PeriodView.MONTH);
  }

  function move(value: string) {
    const range = periodRange(view, value);
    if (
      range.start < earliest ||
      range.start > current.start
    )
      return;
    setSelected(
      range.start === current.start &&
        range.end === current.end
        ? null
        : value,
    );
  }

  return (
    <div
      ref={root}
      onKeyDown={(event) => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented
        )
          return;
        event.stopPropagation();
        focusHeading.current = true;
        returnToMonth();
      }}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-1">
          <Button
            variant="ghost"
            className="size-11 p-0"
            aria-label="이전 기간"
            disabled={
              periodRange(view, previous).start < earliest
            }
            onClick={() => move(previous)}
          >
            ‹
          </Button>
          {view === PeriodView.MONTH ? (
            <Button
              variant="ghost"
              data-period-heading
              aria-label={`${title}, 월별 학습량 보기`}
              className="h-11 min-w-0 px-1 py-0 text-center text-xs font-semibold tabular-nums sm:text-sm"
              onClick={openHeading}
            >
              {title} <span aria-hidden="true">▾</span>
            </Button>
          ) : (
            <div className="mx-auto w-44 max-w-full">
              <Dropdown
                variant="compact"
                label={`${title}, 연도 선택`}
                value={String(year)}
                options={Array.from(
                  {
                    length:
                      Number(today.slice(0, 4)) -
                      Number(firstDate.slice(0, 4)) +
                      1,
                  },
                  (_, index) => {
                    const value =
                      Number(today.slice(0, 4)) - index;
                    return {
                      value: String(value),
                      label: `${value}년`,
                    };
                  },
                )}
                onValueChange={(value) =>
                  setSelected(monthDate(Number(value), 1))
                }
              />
            </div>
          )}
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
            disabled={
              isCurrent && view === PeriodView.MONTH
            }
            onClick={() => {
              setSelected(null);
              returnToMonth();
            }}
          >
            이번 달
          </Button>
        </div>
        <div className="flex h-[292px] items-center sm:h-[340px]">
          {view === PeriodView.MONTH ? (
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
                          const activityTone = future
                            ? "text-muted"
                            : count >= 5
                              ? "bg-lime text-foreground"
                              : count >= 2
                                ? "bg-lime/70 text-foreground"
                                : count > 0
                                  ? "bg-lime/40 text-foreground"
                                  : "bg-canvas text-muted";
                          return (
                            <td
                              key={date}
                              aria-label={`${date}${date === today ? " 오늘" : ""}${completedDates.includes(date) ? " 학습 완료" : ""}, ${future ? "예정" : `${count}개`}`}
                              aria-current={
                                date === today
                                  ? "date"
                                  : undefined
                              }
                              className={`h-10 overflow-hidden rounded-lg p-0 text-xs sm:h-12 ${activityTone}`}
                            >
                              <time
                                dateTime={date}
                                className={`flex h-4 items-center justify-center text-[10px] font-medium sm:h-5 sm:text-xs ${date === today ? "bg-primary text-surface" : future ? "text-muted" : "border-b border-line/60 bg-line text-muted"}`}
                              >
                                {number}
                              </time>
                              {future ? (
                                <span
                                  aria-hidden="true"
                                  className="block h-6 sm:h-7"
                                />
                              ) : (
                                <span
                                  className={
                                    count > 0
                                      ? "flex h-6 items-center justify-center text-base font-bold leading-none tabular-nums sm:h-7 sm:text-lg"
                                      : "flex h-6 items-center justify-center text-xs leading-none tabular-nums sm:h-7"
                                  }
                                >
                                  {count.toLocaleString()}
                                  <span className="ml-0.5 text-[10px] font-medium">
                                    개
                                  </span>
                                </span>
                              )}
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
              className="grid w-full grid-cols-2 gap-x-3 gap-y-1 sm:gap-x-6"
            >
              {months.map(({ value, count, month }) => (
                <Button
                  key={value}
                  variant="ghost"
                  disabled={
                    value < firstMonth || value > today
                  }
                  aria-label={`${year}년 ${month}월, ${value > today ? "예정" : `${count}개${value < firstMonth ? "" : ", 월별 보기"}`}`}
                  className="h-11 min-w-0 gap-2 rounded-lg px-1 py-2 text-xs"
                  onClick={() => {
                    focusHeading.current = true;
                    setSelected(value);
                    setView(PeriodView.MONTH);
                  }}
                >
                  <span className="w-7 shrink-0 text-left tabular-nums">
                    {month}월
                  </span>
                  <Bar count={count} maximum={maximum} />
                  <span className="min-w-8 shrink-0 text-right tabular-nums">
                    {value > today
                      ? "—"
                      : `${count.toLocaleString()}개`}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
