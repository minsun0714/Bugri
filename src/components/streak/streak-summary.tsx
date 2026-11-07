"use client";

import { ApiClientError } from "@/api/client";
import { Button } from "@/components/ui";
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
      className="rounded-3xl border border-line bg-surface p-5 sm:p-6"
    >
      <h2
        id="learning-streak-heading"
        className="text-xl font-semibold"
      >
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
        <div className="mt-4 space-y-4">
          <div
            className="flex flex-wrap items-baseline justify-between gap-2"
            role="status"
          >
            <strong className="text-2xl text-primary">
              {data.streak}일 연속
            </strong>
            <span>
              {data.completed
                ? "✓ 오늘 학습 완료"
                : "오늘 아직 미완료"}
            </span>
          </div>
          <ol
            aria-label="최근 7일 학습"
            className="grid grid-cols-7 gap-1 sm:gap-3"
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

              return (
                <li
                  key={value}
                  aria-label={`${value}${today ? " 오늘" : ""} ${completed ? "학습 완료" : "미완료"}`}
                  aria-current={today ? "date" : undefined}
                  className="flex min-w-0 flex-col items-center gap-2 text-xs sm:text-sm"
                >
                  <time dateTime={value}>
                    {value.slice(5).replace("-", "/")}
                  </time>
                  <span
                    aria-hidden="true"
                    className={
                      completed
                        ? "grid size-8 place-items-center rounded-full bg-primary text-white"
                        : "grid size-8 place-items-center rounded-full border border-line text-muted"
                    }
                  >
                    {completed ? "✓" : "–"}
                  </span>
                  <span>
                    {today
                      ? "오늘"
                      : completed
                        ? "완료"
                        : "미완료"}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="break-words text-xs text-muted">
            {data.timeZone} 기준
          </p>
        </div>
      ) : null}
    </section>
  );
}
