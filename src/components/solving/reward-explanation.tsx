"use client";

import { RewardNonPaymentReason } from "@/api/constants";
import type { RewardOutcome } from "@/api/contracts";
import { Tooltip } from "@/components/ui/tooltip";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";

export function RewardExplanation({
  outcome,
}: {
  outcome?: RewardOutcome;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const eligibleAt = outcome?.eligibleAt
    ? new Intl.DateTimeFormat(locale, {
        timeZone: outcome.timeZone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      }).format(new Date(outcome.eligibleAt))
    : "";
  const reasons = outcome?.reasonCodes.map((reason) => {
    switch (reason) {
      case RewardNonPaymentReason.INCORRECT:
        return t(
          "이번 답안은 오답으로 풀이 보상이 지급되지 않았어요.",
        );
      case RewardNonPaymentReason.REVIEW_WAIT:
        return t(
          "제출 당시 기준, 복습 보상은 {time} 이후 다시 풀어 정답을 제출하면 받을 수 있어요.",
          { time: eligibleAt },
        );
      case RewardNonPaymentReason.OWNER_WAIT:
        return t(
          "직접 만든 문제는 생성 후 168시간이 지나야 보상 대상이에요. 제출 당시 기준, {time} 이후 정답 제출부터 대상이 돼요.",
          { time: eligibleAt },
        );
      case RewardNonPaymentReason.CREATION_UNKNOWN:
        return t(
          "이전 문제의 생성 시각이 없어 보상 대상 여부를 확인할 수 없어요.",
        );
      case RewardNonPaymentReason.LEGACY_CORRECT:
        return t(
          "이전 정답 이력에 최초 정답 지급 기록이 없어 신규·복습 보상은 소급 지급되지 않아요.",
        );
      case RewardNonPaymentReason.DAILY_ALREADY_PAID:
        return t(
          "{date} 학습일의 일일 보너스는 이미 받았어요.",
          { date: outcome!.learningDate },
        );
    }
  });

  return (
    <Tooltip label={t("보상이 없는 이유")}>
      {reasons?.length
        ? reasons.join(" ")
        : t("이 풀이에는 지급된 BugCoin이 없어요.")}
    </Tooltip>
  );
}
