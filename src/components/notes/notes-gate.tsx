"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/api/query-client";
import { useDemoSession } from "@/components/navigation/demo-session";
import { Button, EmptyState } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Visitors are guided to pick a demo user; members get their own data under a per-user remount. */
export function NotesGate({
  children,
}: {
  children: (userId: string) => ReactNode;
}) {
  const t = useTranslation();

  const userId = useSearchParams().get("user");
  const { signIn } = useDemoSession();
  const [client] = useState(createQueryClient);

  if (!userId)
    return (
      <EmptyState
        description=""
        title={t("데모 사용자를 선택해 주세요")}
        action={
          <Button onClick={() => signIn()}>
            {t("데모 사용자 선택")}
          </Button>
        }
      />
    );

  return (
    <QueryClientProvider client={client}>
      <div key={userId}>{children(userId)}</div>
    </QueryClientProvider>
  );
}
