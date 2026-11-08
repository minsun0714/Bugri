"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { ApiClientError } from "@/api/client";
import { HomeStreak } from "@/components/streak/home-streak";
import { useLearningDay } from "@/components/streak/queries";
import { Button } from "@/components/ui";

export function StreakSummary({
  userId,
}: {
  userId: string;
}) {
  const t = useTranslation();

  const { data, isPending, error, refetch, isFetching } =
    useLearningDay(userId);
  const timezoneRequired =
    error instanceof ApiClientError &&
    error.detail.code === "TIMEZONE_REQUIRED";

  return (
    <section
      aria-labelledby="learning-streak-heading"
      className="rounded-surface border border-line bg-surface px-4 py-3"
    >
      <h2 id="learning-streak-heading" className="sr-only">
        {t("연속 학습")}
      </h2>
      {isPending ? (
        <p role="status" className="mt-4 text-muted">
          {t("연속 학습 불러오는 중…")}
        </p>
      ) : error ? (
        <div className="mt-4 space-y-3">
          <p role="alert">
            {timezoneRequired
              ? t("학습 시간대를 확인할 수 없어요.")
              : t("연속 학습을 불러오지 못했어요.")}
          </p>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              loading={isFetching}
              onClick={() => void refetch()}
            >
              {t("다시 시도")}
            </Button>
          </div>
        </div>
      ) : data ? (
        <HomeStreak key={userId} data={data} />
      ) : null}
    </section>
  );
}
