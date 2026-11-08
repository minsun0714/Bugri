"use client";

import { createBrowserApi } from "@/api/browser";
import type { AttemptContext } from "@/api/constants";
import { type Answer } from "@/api/contracts";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const solvingKey = (userId: string) =>
  ["solving", userId] as const;

async function apiFor(userId: string) {
  return createBrowserApi({ mode: "mock", userId });
}

export function useSolvingQueries(
  userId: string,
  attemptId: string | null,
) {
  const cache = useQueryClient();
  const key = solvingKey(userId);
  const attempt = useQuery({
    queryKey: [...key, "attempt", attemptId],
    queryFn: async () =>
      (await apiFor(userId)).request("attempt", {
        attemptId: attemptId!,
      }),
    enabled: !!attemptId,
    retry: false,
    staleTime: 0,
  });
  const start = useMutation({
    mutationFn: async ({
      quizId,
      context,
    }: {
      quizId: string;
      context: AttemptContext;
    }) =>
      (await apiFor(userId)).request("startAttempt", {
        quizId,
        context,
      }),
    retry: false,
  });
  const submit = useMutation({
    mutationFn: async (answer: Answer) =>
      (await apiFor(userId)).request("answer", {
        attemptId: attemptId!,
        answer,
      }),
    retry: false,
    onSuccess: async (data) => {
      cache.setQueryData(
        [...key, "attempt", attemptId],
        data,
      );
      await Promise.all(
        ["learningDay", "history", "review"].map(
          (resource) =>
            cache.invalidateQueries({
              queryKey: [resource, userId],
            }),
        ),
      );
    },
    onError: () => {
      void cache.invalidateQueries({
        queryKey: [...key, "attempt", attemptId],
      });
    },
  });

  return { attempt, start, submit };
}
