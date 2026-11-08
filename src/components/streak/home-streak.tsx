"use client";

import { useId, useState } from "react";
import type { LearningDay } from "@/api/contracts";
import { ActivityPeriods } from "@/components/streak/activity-periods";
import { Button } from "@/components/ui";
import { Bugri } from "@/components/ui/bugri";
import { Tooltip } from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/i18n/use-translation";

export function HomeStreak({
  data,
}: {
  data: LearningDay;
}) {
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const calendarId = useId();
  const { streak, completed, completedDates, timeZone } =
    data;
  const hasHistory = completedDates.length > 0;

  return (
    <>
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="relative size-10 shrink-0"
        >
          <div className="absolute left-0 top-0 origin-top-left scale-[0.416667]">
            <Bugri
              small
              mood={
                completed
                  ? "complete"
                  : streak > 0 || hasHistory
                    ? "encouraging"
                    : "neutral"
              }
            />
          </div>
        </div>
        <div
          role="status"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5"
        >
          <strong className="break-keep text-sm font-semibold text-foreground sm:text-base">
            {streak > 0
              ? t("{0}일 연속 학습", { 0: streak })
              : hasHistory
                ? t("다시 시작해요")
                : t("첫 학습을 시작해요")}
          </strong>
          {(completed || hasHistory || streak > 0) && (
            <span
              className={`text-xs ${completed ? "text-success-ink" : "text-muted"}`}
            >
              {completed
                ? t("오늘 완료 ✓")
                : t("오늘 미완료")}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5"
          aria-expanded={expanded}
          aria-controls={calendarId}
          onClick={() => setExpanded(!expanded)}
        >
          {t("학습 기록")}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`size-4 shrink-0 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </Button>
      </div>
      <div id={calendarId} hidden={!expanded}>
        {expanded && (
          <div className="mt-3 border-t border-line pt-3">
            <div className="mb-2 flex justify-end">
              <Tooltip label={t("학습일 기준 안내")}>
                {t(
                  "{0} 기준 · 하루 한 문제를 완료하면 기록돼요. 정답 여부와 관계없이 인정돼요. 하루에 같은 퀴즈를 다시 풀어도 개수는 늘지 않아요.",
                  { 0: timeZone },
                )}
              </Tooltip>
            </div>
            <ActivityPeriods data={data} />
          </div>
        )}
      </div>
    </>
  );
}
