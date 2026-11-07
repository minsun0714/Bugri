"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type {
  DiscoveryQuery,
  Subscription,
  SubscriptionTarget,
} from "@/api/contracts";

function isSameTarget(
  subscription: Subscription,
  target: SubscriptionTarget,
) {
  if (subscription.type !== target.type) return false;

  if (target.type === "HASHTAG") {
    return (
      subscription.type === "HASHTAG" &&
      subscription.hashtagId === target.hashtagId
    );
  }

  if (target.type === "PERSON") {
    return (
      subscription.type === "PERSON" &&
      subscription.authorUserId === target.authorUserId
    );
  }

  return (
    subscription.type === "PERSON_HASHTAG" &&
    subscription.authorUserId === target.authorUserId &&
    subscription.hashtagId === target.hashtagId
  );
}

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
    mutationFn: async ({
      target,
      subscribed,
    }: {
      target: SubscriptionTarget;
      subscribed: boolean;
    }) => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });

      if (!subscribed) {
        return api.request("subscribe", target);
      }

      const subscriptions = await api.request(
        "subscriptions",
        {},
      );
      const subscription = subscriptions.find((item) =>
        isSameTarget(item, target),
      );

      return subscription
        ? api.request("unsubscribe", {
            subscriptionId: subscription.subscriptionId,
          })
        : { deleted: true as const };
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
