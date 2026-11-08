"use client";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";

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
  const t = useTranslation();
  const locale = useLocale();

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
  const { start, end } = periodRange(view, anchor);
  const title =
    view === PeriodView.YEAR
      ? t("{0}년", { 0: Number(anchor.slice(0, 4)) })
      : t("{0}년 {1}월", {
          0: Number(anchor.slice(0, 4)),
          1: Number(anchor.slice(5, 7)),
        });
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
            aria-label={t("이전 기간")}
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
              aria-label={t("{0}, 월별 학습량 보기", {
                0: title,
              })}
              className="h-11 min-w-0 px-1 py-0 text-center text-xs font-semibold tabular-nums sm:text-sm"
              onClick={openHeading}
            >
              {title} <span aria-hidden="true">▾</span>
            </Button>
          ) : (
            <div className="mx-auto w-44 max-w-full">
              <Dropdown
                variant="compact"
                label={t("{0}, 연도 선택", { 0: title })}
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
                      label: t("{0}년", { 0: value }),
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
            aria-label={t("다음 기간")}
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
            {t("완료한 퀴즈")}{" "}
            <strong className="ml-1 font-semibold text-foreground">
              {t("총 {0}개", {
                0: total.toLocaleString(locale),
              })}
            </strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t("현재 기간")}
            disabled={
              isCurrent && view === PeriodView.MONTH
            }
            onClick={() => {
              setSelected(null);
              returnToMonth();
            }}
          >
            {t("이번 달")}
          </Button>
        </div>
        <div className="flex h-[292px] items-center sm:h-[340px]">
          {view === PeriodView.MONTH ? (
            <table
              aria-label={t("{0} 학습 달력", { 0: title })}
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
                      {locale === "en" && day === "월"
                        ? "Mon"
                        : t(day)}
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
                              ? "bg-lime text-bugri-ink"
                              : count >= 2
                                ? "bg-lime/70 text-bugri-ink"
                                : count > 0
                                  ? "bg-success-soft text-success-ink"
                                  : "bg-canvas text-muted";
                          return (
                            <td
                              key={date}
                              aria-label={`${date}${date === today ? t(" 오늘") : ""}${completedDates.includes(date) ? t(" 학습 완료") : ""}, ${future ? t("예정") : t("{0}개", { 0: count })}`}
                              aria-current={
                                date === today
                                  ? "date"
                                  : undefined
                              }
                              className={`h-10 overflow-hidden rounded-lg p-0 text-xs sm:h-12 ${activityTone}`}
                            >
                              <time
                                dateTime={date}
                                className={`flex h-4 items-center justify-center text-xs font-medium sm:h-5 sm:text-xs ${date === today ? "bg-primary-solid text-on-primary" : future ? "text-muted" : "border-b border-line/60 bg-line text-muted"}`}
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
                                  <span className="ml-0.5 text-xs font-medium">
                                    {locale === "ko"
                                      ? "개"
                                      : ""}
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
              aria-label={t("{0}년 월별 학습량", {
                0: year,
              })}
              className="grid w-full grid-cols-2 gap-x-3 gap-y-1 sm:gap-x-6"
            >
              {months.map(({ value, count, month }) => (
                <Button
                  key={value}
                  variant="ghost"
                  disabled={
                    value < firstMonth || value > today
                  }
                  aria-label={t("{0}년 {1}월, {2}", {
                    0: year,
                    1: month,
                    2:
                      value > today
                        ? t("예정")
                        : t("{0}개{1}", {
                            0: count,
                            1:
                              value < firstMonth
                                ? ""
                                : t(", 월별 보기"),
                          }),
                  })}
                  className="h-11 min-w-0 gap-2 rounded-lg px-1 py-2 text-xs"
                  onClick={() => {
                    focusHeading.current = true;
                    setSelected(value);
                    setView(PeriodView.MONTH);
                  }}
                >
                  <span className="w-7 shrink-0 text-left tabular-nums">
                    {locale === "ko"
                      ? `${month}월`
                      : new Intl.DateTimeFormat("en", {
                          month: "short",
                          timeZone: "UTC",
                        }).format(
                          new Date(`${value}T12:00:00Z`),
                        )}
                  </span>
                  <Bar count={count} maximum={maximum} />
                  <span className="min-w-8 shrink-0 text-right tabular-nums">
                    {value > today
                      ? "—"
                      : locale === "ko"
                        ? t("{0}개", {
                            0: count.toLocaleString(),
                          })
                        : count.toLocaleString(locale)}
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
