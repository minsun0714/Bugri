"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { SubscriptionTarget } from "@/api/contracts";

export function useDiscovery(userId: string) {
  const cache = useQueryClient();
  const discovery = useQuery({
    queryKey: ["discovery", userId],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      const [users, tags, subscriptions] =
        await Promise.all([
          api.request("discoverUsers", {}),
          api.request("discoverHashtags", {}),
          api.request("subscriptions", {}),
        ]);

      return { users, tags, subscriptions };
    },
    retry: false,
  });
  const subscribe = useMutation({
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

  return { discovery, subscribe };
}
