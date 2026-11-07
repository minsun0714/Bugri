"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";

export const walletKey = (userId: string) =>
  ["wallet", userId] as const;

export function useWallet(userId: string) {
  return useQuery({
    queryKey: walletKey(userId),
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("wallet", {}),
    retry: false,
    staleTime: 0,
  });
}
