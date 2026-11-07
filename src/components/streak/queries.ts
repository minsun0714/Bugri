"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";

export function useLearningDay(
  userId: string,
  publicId?: string,
) {
  return useQuery({
    queryKey: publicId
      ? ["publicLearningDay", publicId]
      : ["learningDay", userId],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      return publicId
        ? api.request("publicLearningDay", { publicId })
        : api.request("learningDay", {});
    },
    retry: false,
    staleTime: 0,
    // Refresh an open page across local midnight; focus also refetches stale data.
    refetchInterval: 60_000,
  });
}
