import type { SubscriptionTarget } from "@/api/contracts";

/** Demo learning conditions, not a recommendation fallback. Other users start empty. */
export const subscriptions: Readonly<
  Record<string, readonly SubscriptionTarget[]>
> = {
  learner: [
    {
      type: "PERSON",
      authorUserId: "author",
    },
    {
      type: "HASHTAG",
      hashtagId: "web",
    },
    {
      type: "PERSON_HASHTAG",
      authorUserId: "friend",
      hashtagId: "javascript",
    },
  ],
};
