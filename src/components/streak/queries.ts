"use client";

import { createBrowserApi } from "@/api/browser";
import { useQuery } from "@tanstack/react-query";

export function useLearningDay(userId: string) {
  return useQuery({
    queryKey: ["learningDay", userId],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      return api.request("learningDay", {});
    },
    retry: false,
    staleTime: 0,
    // Refresh an open page across local midnight; focus also refetches stale data.
    refetchInterval: 60_000,
  });
}
