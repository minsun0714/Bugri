"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { useRef, useState } from "react";
import {
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ApiClientError } from "@/api/client";
import { createQueryClient } from "@/api/query-client";
import { shouldThrowQueryError } from "@/api/errors";
import { QueryBoundary } from "@/components/errors/query-boundary";

function PreviewData({
  request,
}: {
  request: () => Promise<string>;
}) {
  const t = useTranslation();

  const { data } = useQuery({
    queryKey: ["error-preview"],
    queryFn: request,
    throwOnError: shouldThrowQueryError,
  });

  return <p role="status">{data ?? t("불러오는 중…")}</p>;
}

/** Only mounted by the BUGRI_UI_PREVIEW-gated route. */
export function QueryRecoveryPreview() {
  const t = useTranslation();

  const [client] = useState(createQueryClient);
  const attempts = useRef(0);

  async function request() {
    attempts.current += 1;
    if (attempts.current === 1)
      throw new ApiClientError(503, {
        code: "SERVER_ERROR",
        message: "private preview detail",
        requestId: "preview-503",
      });

    return t("데스크를 다시 불러왔습니다");
  }

  return (
    <QueryClientProvider client={client}>
      <section
        aria-label={t("공개 데스크")}
        className="mt-6 max-w-xl rounded-3xl border border-line bg-surface p-4"
      >
        <QueryBoundary
          title={t("공개 데스크를 불러오지 못했습니다")}
        >
          <PreviewData request={request} />
        </QueryBoundary>
      </section>
      <p className="mt-4">{t("다른 프로필 영역")}</p>
    </QueryClientProvider>
  );
}
