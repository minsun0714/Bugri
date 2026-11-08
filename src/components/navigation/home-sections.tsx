"use client";
import { createQueryClient } from "@/api/query-client";
import { QuickNote } from "@/components/notes/quick-note";
import { TodayReview } from "@/components/review/today-review";
import { useTodayReview } from "@/components/review/queries";
import { StreakSummary } from "@/components/streak/streak-summary";
import { useDemoSession } from "@/components/navigation/demo-session";
import { Button, EmptyState } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/use-translation";
import { QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
function Home({ userId }: { userId: string }) {
  const today = useTodayReview(userId);

  return (
    <div className="space-y-5">
      <QuickNote
        userId={userId}
        emphasized={today.data?.totalCount === 0}
      />
      <TodayReview userId={userId} today={today} />
      <StreakSummary userId={userId} />
    </div>
  );
}

export function HomeSections() {
  const userId = useSearchParams().get("user");
  const [client] = useState(() => createQueryClient());
  const t = useTranslation();
  const { signIn } = useDemoSession();
  return (
    <QueryClientProvider client={client}>
      {userId ? (
        <Home key={userId} userId={userId} />
      ) : (
        <EmptyState
          description=""
          title={t("데모 사용자를 선택해 주세요")}
          action={
            <Button onClick={() => signIn()}>
              {t("데모 사용자 선택")}
            </Button>
          }
        />
      )}
    </QueryClientProvider>
  );
}
