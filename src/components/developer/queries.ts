"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { Request } from "@/api/contracts";
import { useSubscribe } from "@/components/discovery/queries";

export function useDeveloper(
  userId: string,
  quizzesRequest: Request<"developerQuizzes">,
  tagsRequest: Request<"developerTags">,
) {
  const quizzes = useQuery({
    queryKey: ["developerQuizzes", userId, quizzesRequest],
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("developerQuizzes", quizzesRequest),
    retry: false,
  });
  const tags = useQuery({
    queryKey: ["developerTags", userId, tagsRequest],
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("developerTags", tagsRequest),
    retry: false,
  });
  const subscribe = useSubscribe(userId);

  return { quizzes, tags, subscribe };
}
