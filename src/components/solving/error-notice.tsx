"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { ApiClientError } from "@/api/client";
import { getErrorMessage } from "@/api/errors";

export function ErrorNotice({ error }: { error: Error }) {
  const t = useTranslation();

  const code =
    error instanceof ApiClientError
      ? error.detail.code
      : "NETWORK_ERROR";
  const messages: Record<string, string> = {
    QUIZ_UNAVAILABLE: t(
      "이 퀴즈는 더 이상 이용할 수 없습니다.",
    ),
    FORBIDDEN: t("이 사용자로는 접근할 수 없습니다."),
    NOT_FOUND: t(
      "풀이를 찾을 수 없습니다. 사용자와 주소를 확인하세요.",
    ),
    STORAGE_UNAVAILABLE: t(
      "브라우저 저장소를 사용할 수 없습니다. 저장 공간과 설정을 확인하고 다시 시도하세요.",
    ),
    STORAGE_CORRUPT: t(
      "저장된 데이터를 읽을 수 없습니다. 기존 데이터는 유지됩니다.",
    ),
    TIMEZONE_REQUIRED: t(
      "학습 시간대를 확인할 수 없습니다. 브라우저 시간대 설정을 확인한 뒤 다시 시도하세요.",
    ),
    ALREADY_ANSWERED: t(
      "이미 제출한 풀이입니다. 저장된 결과를 다시 확인하세요.",
    ),
  };
  return (
    <p
      role="alert"
      className="rounded-xl border border-coral p-4"
    >
      {messages[code] ?? t(getErrorMessage(error))}{" "}
      {t("버그리: 다시 시도해보자.")}
    </p>
  );
}
