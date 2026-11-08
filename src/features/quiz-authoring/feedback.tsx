"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { ApiClientError } from "@/api/client";
import { Alert } from "@/components/ui";

import { getErrorMessage as errorMessage } from "@/api/errors";

export { errorMessage };

export function RequestError({
  error,
}: {
  error: unknown;
}) {
  const t = useTranslation();

  if (!error) return null;

  return (
    <div role="alert">
      <Alert title={t(errorMessage(error))} tone="danger">
        {t(
          "입력은 유지됩니다. 내용을 확인하고 같은 버튼으로 다시 시도하세요.",
        )}
      </Alert>
      {error instanceof ApiClientError &&
        error.detail.code === "VERSION_CONFLICT" && (
          <p className="mt-2 text-sm text-muted">
            {t(
              "다른 탭에서 변경되었습니다. 편집 내용을 복사한 뒤 최신 내용 다시 불러오기를 선택하세요.",
            )}
          </p>
        )}
    </div>
  );
}
