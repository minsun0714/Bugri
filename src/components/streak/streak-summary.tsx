"use client";

import { ActivityPeriods } from "@/components/streak/activity-periods";
import { ApiClientError } from "@/api/client";
import { Button } from "@/components/ui";
import { Bugri } from "@/components/ui/bugri";
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
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_minmax(0,2fr)] lg:items-start lg:gap-8">
          <div
            className="flex min-w-0 items-center gap-3 lg:self-center lg:justify-center"
            role="status"
          >
            <div
              aria-hidden="true"
              className="relative size-15 shrink-0"
            >
              <div className="absolute left-0 top-0 origin-top-left scale-[0.625]">
                <Bugri
                  small
                  mood={
                    data.completed
                      ? "complete"
                      : data.streak > 0 ||
                          data.completedDates.length > 0
                        ? "encouraging"
                        : "neutral"
                  }
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-xs font-medium text-muted">
                <span>연속 학습</span>
                <Tooltip label="학습일 기준 안내">{`${data.timeZone} 기준 · 하루 한 문제를 완료하면 기록돼요. 정답 여부와 관계없이 인정돼요. 하루에 같은 퀴즈를 다시 풀어도 개수는 늘지 않아요.`}</Tooltip>
              </div>
              <div className="flex items-center gap-3 sm:mt-1">
                <strong className="text-2xl font-bold tracking-tight text-foreground">
                  {data.streak > 0
                    ? `${data.streak}일 연속`
                    : data.completedDates.length > 0
                      ? "오늘부터 다시"
                      : "오늘부터 시작"}
                </strong>
              </div>
              <p className="mt-1 text-xs text-muted">
                {data.completed
                  ? "✓ 오늘 학습 완료"
                  : data.streak > 0
                    ? "오늘 한 문제로 이어가요"
                    : data.completedDates.length > 0
                      ? "한 문제로 다시 시작해요"
                      : "한 문제 풀고 첫 기록"}
              </p>
            </div>
          </div>
          <div className="min-w-0 lg:border-l lg:border-line lg:pl-8">
            <ActivityPeriods key={userId} data={data} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
