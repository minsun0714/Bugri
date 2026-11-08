"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { ProfileOrder } from "@/api/contracts";

export function useProfileOrder(
  userId: string,
  publicId: string,
) {
  const client = useQueryClient();
  const queryKey = ["profileOrder", userId, publicId];
  const profile = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("profileOrder", { publicId }),
    retry: false,
  });
  const update = useMutation({
    mutationFn: async (value: ProfileOrder) =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("updateProfileOrder", value),
    onSuccess: async (value) => {
      client.setQueryData(queryKey, value);
      await client.invalidateQueries({
        queryKey: ["profileOrder"],
      });
    },
  });
  return { profile, update };
}
