"use client";

import { ApiClientError } from "@/api/client";
import { Button } from "@/components/ui";
import { Tooltip } from "@/components/ui/tooltip";
import { useLearningDay } from "@/components/streak/queries";

export function StreakSummary({
  userId,
}: {
  userId: string;
}) {
  const { data, isPending, error, refetch, isFetching } =
    useLearningDay(userId);
  const timezoneRequired =
    error instanceof ApiClientError &&
    error.detail.code === "TIMEZONE_REQUIRED";

  return (
    <section
      aria-labelledby="learning-streak-heading"
      className="rounded-3xl border border-line bg-surface p-4 sm:p-6"
    >
      <h2 id="learning-streak-heading" className="sr-only">
        연속 학습
      </h2>
      {isPending ? (
        <p role="status" className="mt-4 text-muted">
          연속 학습 불러오는 중…
        </p>
      ) : error ? (
        <div className="mt-4 space-y-3">
          <p role="alert">
            {timezoneRequired
              ? "학습 시간대를 확인할 수 없어요."
              : "연속 학습을 불러오지 못했어요."}
          </p>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching}
              onClick={() => void refetch()}
            >
              다시 시도
            </Button>
          </div>
        </div>
      ) : data ? (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-center sm:gap-8">
          <div className="min-w-0" role="status">
            <div className="flex items-center gap-1 text-xs font-medium text-muted">
              <span>연속 학습</span>
              <Tooltip label="학습일 기준 안내">{`${data.timeZone} 기준 · 하루 한 문제를 완료하면 기록돼요. 정답 여부와 관계없이 인정돼요.`}</Tooltip>
            </div>
            <div className="flex items-center gap-3 sm:mt-1">
              <svg
                aria-hidden="true"
                viewBox="0 0 32 40"
                className={
                  data.streak > 0
                    ? "h-9 w-7 shrink-0 text-primary sm:h-10 sm:w-8"
                    : "h-9 w-7 shrink-0 text-muted/40 sm:h-10 sm:w-8"
                }
                fill="currentColor"
              >
                <path d="M18 1c2 9-4 10-3 16 3-1 5-4 6-7 6 6 10 12 9 18-1 7-7 11-14 11S2 35 2 27c0-7 5-12 8-16-1 6 1 8 3 9C10 12 18 8 18 1Z" />
                <path
                  d="M17 23c0 4-5 5-5 9 0 3 2 5 5 5s5-2 5-5c0-4-3-6-5-9Z"
                  className="fill-lime"
                />
              </svg>
              <strong
                className={
                  data.streak > 0
                    ? "text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                    : "text-2xl font-bold tracking-tight text-foreground"
                }
              >
                {data.streak > 0
                  ? `${data.streak}일 연속`
                  : data.completedDates.length > 0
                    ? "오늘부터 다시"
                    : "오늘부터 시작"}
              </strong>
            </div>
            <p
              className={
                data.completed
                  ? "mt-2 text-sm font-medium text-primary sm:mt-3"
                  : "mt-2 text-sm text-muted sm:mt-3"
              }
            >
              {data.completed
                ? "✓ 오늘 학습 완료"
                : data.streak > 0
                  ? "오늘 한 문제로 이어가요"
                  : data.completedDates.length > 0
                    ? "한 문제로 다시 시작해요"
                    : "한 문제 풀고 첫 기록"}
            </p>
          </div>
          <div className="min-w-0 sm:border-l sm:border-line sm:pl-8">
            <div className="mb-2 flex items-center justify-between text-xs text-muted sm:mb-3">
              <span>최근 7일</span>
              <span>
                {data.learningDate
                  .slice(5)
                  .replace("-", "/")}{" "}
                기준
              </span>
            </div>
            <ol
              aria-label="최근 7일 학습"
              className="grid grid-cols-7 gap-2 sm:gap-3"
            >
              {Array.from({ length: 7 }, (_, index) => {
                const date = new Date(
                  `${data.learningDate}T12:00:00Z`,
                );
                date.setUTCDate(
                  date.getUTCDate() - 6 + index,
                );
                const value = date
                  .toISOString()
                  .slice(0, 10);
                const completed =
                  data.completedDates.includes(value);
                const today = value === data.learningDate;
                const weekday = new Intl.DateTimeFormat(
                  "ko-KR",
                  { weekday: "short", timeZone: "UTC" },
                ).format(date);

                return (
                  <li
                    key={value}
                    aria-label={`${value}${today ? " 오늘" : ""} ${completed ? "학습 완료" : "미완료"}`}
                    aria-current={
                      today ? "date" : undefined
                    }
                    className={`relative flex h-12 min-w-0 items-center justify-center rounded-full sm:h-16 ${completed ? "bg-primary/10 text-primary" : "bg-canvas text-muted"} ${today ? "ring-2 ring-primary ring-offset-2 ring-offset-surface" : ""}`}
                  >
                    <time
                      dateTime={value}
                      className={
                        today || completed
                          ? "text-sm font-semibold"
                          : "text-sm"
                      }
                    >
                      {today ? "오늘" : weekday}
                    </time>
                    {completed && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-1 grid size-5 place-items-center rounded-full border-2 border-surface bg-primary text-xs font-bold text-white"
                      >
                        ✓
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}
