"use client";

import { useQuery } from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { DiscoveryQuery } from "@/api/contracts";

export function useDeveloperDiscovery(
  userId: string,
  request: DiscoveryQuery,
) {
  const directory = useQuery({
    queryKey: ["discoveryDirectory"],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      const [users, hashtags] = await Promise.all([
        api.request("discoverUsers", {}),
        api.request("discoverHashtags", {}),
      ]);
      return { users, hashtags };
    },
    retry: false,
  });
  const validUser =
    directory.data?.users.some(
      (user) => user.userId === userId,
    ) ?? false;
  const validQuery =
    Array.from(request.query).length <= 100;
  const discovery = useQuery({
    queryKey: ["discovery", userId, request],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      return api.request("searchDiscovery", request);
    },
    enabled: validUser && validQuery,
    retry: false,
  });
  return { directory, validUser, validQuery, discovery };
}

export function useSubscriptions(
  userId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: async () => {
      const api = await createBrowserApi({
        mode: "mock",
        userId,
      });
      return api.request("subscriptions", {});
    },
    enabled,
    retry: false,
  });
}
