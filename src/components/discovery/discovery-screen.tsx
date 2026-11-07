"use client";

import { useState, useTransition } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DiscoveryKind } from "@/api/constants";
import type { DiscoveryQuery } from "@/api/contracts";
import { DiscoverySearch } from "@/components/discovery/search-results";
import { useDemoSession } from "@/components/navigation/demo-session";
import { FeatureSectionShell } from "@/components/navigation/feature-section-shell";

export function DiscoveryScreen({
  kind,
}: {
  kind: DiscoveryQuery["kind"];
}) {
  const params = useSearchParams();
  const { signedIn } = useDemoSession();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const userId = params.get("user") ?? "learner";
  const page = Number(params.get("page") ?? 1);
  const request: DiscoveryQuery = {
    kind,
    query: params.get("query") ?? "",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    pageSize: 20,
  };
  const [client] = useState(() => new QueryClient());
  const learn = (tag: string | null) => {
    const next = new URLSearchParams({ user: userId });
    if (tag) next.set("tag", tag);
    startTransition(() => router.push(`/?${next}`));
  };

  return (
    <QueryClientProvider client={client}>
      <div className="space-y-6">
        <h1 className="text-3xl">
          {kind === DiscoveryKind.USER
            ? "개발자 탐색"
            : "태그 탐색"}
        </h1>
        {signedIn && (
          <FeatureSectionShell
            id="subscriptions"
            title="내 구독"
          />
        )}
        <DiscoverySearch
          key={userId}
          userId={userId}
          navigating={navigating}
          request={request}
          onLearn={learn}
          onSearch={(next) => {
            const query = new URLSearchParams({
              user: userId,
              page: String(next.page),
            });
            if (next.query) query.set("query", next.query);
            startTransition(() =>
              router.push(
                `/discover/${kind === DiscoveryKind.USER ? "developers" : "tags"}?${query}`,
                {
                  scroll: false,
                },
              ),
            );
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
