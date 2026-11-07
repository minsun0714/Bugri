"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { ProfileAbout } from "@/api/contracts";

export function useProfileAbout(
  userId: string,
  publicId: string,
) {
  const client = useQueryClient();
  const queryKey = ["profileAbout", userId, publicId];
  const profile = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("profileAbout", { publicId }),
    retry: false,
  });
  const update = useMutation({
    mutationFn: async (value: ProfileAbout) =>
      (
        await createBrowserApi({ mode: "mock", userId })
      ).request("updateProfileAbout", value),
    onSuccess: async (value) => {
      client.setQueryData(queryKey, value);
      await client.invalidateQueries({
        queryKey: ["profileAbout"],
      });
    },
  });
  return { profile, update };
}
