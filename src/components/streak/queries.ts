"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";

export function useLearningDay(userId: string) {
  return useQuery({
    queryKey: ["learningDay", userId],
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("learningDay", {}),
    retry: false,
    staleTime: 0,
    // Refresh an open page across local midnight; focus also refetches stale data.
    refetchInterval: 60_000,
  });
}
