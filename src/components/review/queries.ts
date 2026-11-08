"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";

/** Every submit invalidates this prefix, so the count and the next quiz stay in step. */
export const reviewKey = (userId: string) =>
  ["review", userId] as const;

export function useTodayReview(userId: string) {
  return useQuery({
    queryKey: [...reviewKey(userId), "today"],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });

      return api.request("todayReview", {});
    },
    retry: false,
    staleTime: 0,
    // An open page crosses local midnight; focus also refetches stale data.
    refetchInterval: 60_000,
  });
}
