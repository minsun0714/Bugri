"use client";
import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { Request } from "@/api/contracts";

export function useTagQuizzes(
  userId: string,
  request: Request<"tagQuizzes">,
) {
  return useQuery({
    queryKey: ["tagQuizzes", userId, request],
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("tagQuizzes", request),
    retry: false,
  });
}
