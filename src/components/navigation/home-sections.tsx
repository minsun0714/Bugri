"use client";
import { createQueryClient } from "@/api/query-client";
import { StreakSummary } from "@/components/streak/streak-summary";
import { EmptyState } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/use-translation";
import { QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
export function HomeSections() {
  const userId = useSearchParams().get("user");
  const [client] = useState(() => createQueryClient());
  const t = useTranslation();
  return (
    <QueryClientProvider client={client}>
      {userId ? (
        <StreakSummary key={userId} userId={userId} />
      ) : (
        <EmptyState
          description=""
          title={t("데모 사용자 선택")}
        />
      )}
    </QueryClientProvider>
  );
}
