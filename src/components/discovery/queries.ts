"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type {
  DiscoveryQuery,
  SubscriptionTarget,
} from "@/api/contracts";

export function useDiscovery(
  userId: string,
  request: DiscoveryQuery,
) {
  const discovery = useQuery({
    queryKey: ["discovery", userId, request],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });

      return api.request("searchDiscovery", request);
    },
    retry: false,
  });
  const subscribe = useSubscribe(userId);

  return { discovery, subscribe };
}

export function useSubscribe(userId: string) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (target: SubscriptionTarget) => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });

      return api.request("subscribe", target);
    },
    retry: false,
    onSuccess: async () => {
      await Promise.all(
        [
          "discovery",
          "developerQuizzes",
          "developerTags",
          "subscriptions",
          "learningTags",
          "learningQuiz",
        ].map((resource) =>
          cache.invalidateQueries({
            queryKey: [resource, userId],
          }),
        ),
      );
    },
  });
}
