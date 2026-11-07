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
      className="rounded-2xl border border-line bg-surface px-5 py-4 sm:px-6"
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0" role="status">
            <div className="flex items-center gap-1 text-xs font-medium text-muted">
              <span>연속 학습</span>
              <Tooltip label="학습일 기준 안내">{`${data.timeZone} 기준 · 하루 한 문제를 완료하면 기록돼요. 정답 여부와 관계없이 인정돼요.`}</Tooltip>
            </div>
            <strong className="block text-2xl font-bold tracking-tight text-foreground">
              {data.streak > 0
                ? `${data.streak}일 연속`
                : data.completedDates.length > 0
                  ? "오늘부터 다시"
                  : "오늘부터 시작"}
            </strong>
            <p
              className={
                data.completed
                  ? "mt-1 text-sm font-medium text-primary"
                  : "mt-1 text-sm text-muted"
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
          <ol
            aria-label="최근 7일 학습"
            className="grid grid-cols-7 gap-2 sm:w-80 sm:shrink-0 sm:gap-3"
          >
            {Array.from({ length: 7 }, (_, index) => {
              const date = new Date(
                `${data.learningDate}T12:00:00Z`,
              );
              date.setUTCDate(
                date.getUTCDate() - 6 + index,
              );
              const value = date.toISOString().slice(0, 10);
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
                  aria-current={today ? "date" : undefined}
                  className="flex min-w-0 flex-col items-center gap-2"
                >
                  <time
                    dateTime={value}
                    className={
                      today
                        ? "text-xs font-semibold text-primary"
                        : "text-xs text-muted"
                    }
                  >
                    {today ? "오늘" : weekday}
                  </time>
                  <span
                    aria-hidden="true"
                    className={`grid size-8 place-items-center rounded-xl text-sm ${completed ? "bg-primary font-bold text-white" : today ? "border-2 border-primary bg-primary/5 text-primary" : "bg-canvas text-line"}`}
                  >
                    {completed ? (
                      "✓"
                    ) : today ? (
                      <span className="size-1.5 rounded-full bg-primary" />
                    ) : (
                      <span className="size-1 rounded-full bg-line" />
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
