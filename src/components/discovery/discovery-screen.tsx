"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
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

export function DiscoveryScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const [navigating, startTransition] = useTransition();
  const userId = params.get("user") ?? "learner";
  const page = Number(params.get("page") ?? 1);
  const request: DiscoveryQuery = {
    kind:
      params.get("kind") === DiscoveryKind.HASHTAG
        ? DiscoveryKind.HASHTAG
        : DiscoveryKind.USER,
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
        <Link
          href={`/?user=${encodeURIComponent(userId)}`}
          className="text-primary underline"
        >
          홈에서 학습하기
        </Link>
        <h1 className="text-3xl">개발자·태그 탐색</h1>
        <DiscoverySearch
          key={`${userId}:${JSON.stringify(request)}`}
          userId={userId}
          navigating={navigating}
          request={request}
          onLearn={learn}
          onSearch={(next) => {
            const query = new URLSearchParams({
              user: userId,
              kind: next.kind,
              page: String(next.page),
            });
            if (next.query) query.set("query", next.query);
            startTransition(() =>
              router.push(`/discover?${query}`, {
                scroll: false,
              }),
            );
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
