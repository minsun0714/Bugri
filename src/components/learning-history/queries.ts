"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { AttemptHistoryFilter } from "@/api/constants";

export function useAttemptHistory(
  userId: string,
  filter: AttemptHistoryFilter,
  page: number,
  query = "",
) {
  return useQuery({
    queryKey: ["history", userId, filter, query, page],
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("attemptHistory", {
        filter,
        page,
        pageSize: 20,
        ...(query ? { query } : {}),
      }),
    retry: false,
    staleTime: 0,
  });
}
