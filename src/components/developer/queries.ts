"use client";

import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { Request } from "@/api/contracts";
import { useSubscribe } from "@/components/discovery/queries";

export function useDeveloper(
  userId: string,
  quizzesRequest: Request<"developerQuizzes">,
  tagsRequest: Request<"developerTags">,
  allTags = false,
) {
  const quizzes = useQuery({
    placeholderData: keepPreviousData,
    queryKey: ["developerQuizzes", userId, quizzesRequest],
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("developerQuizzes", quizzesRequest),
    retry: false,
  });
  const tags = useQuery({
    queryKey: [
      "developerTags",
      userId,
      tagsRequest,
      allTags,
    ],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      const first = await api.request(
        "developerTags",
        tagsRequest,
      );
      if (!allTags) return { items: first.items };

      const items = [...first.items];
      for (
        let page = tagsRequest.page + 1;
        page <=
        Math.ceil(first.total / tagsRequest.pageSize);
        page += 1
      ) {
        const next = await api.request("developerTags", {
          ...tagsRequest,
          page,
        });
        items.push(...next.items);
      }
      return {
        items: [
          ...new Map(
            items.map((item) => [item.id, item]),
          ).values(),
        ],
      };
    },
    retry: false,
  });
  const subscribe = useSubscribe(userId);

  return { quizzes, tags, subscribe };
}
