"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { QuizReaction } from "@/api/constants";

export function useQuizReaction(
  userId: string,
  quizId: string,
) {
  const cache = useQueryClient();
  const queryKey = ["quizReaction", userId, quizId];
  const api = () =>
    createBrowserApi({ mode: "mock", userId });
  const query = useQuery({
    queryKey,
    queryFn: async () =>
      (await api()).request("quizReaction", { quizId }),
    retry: false,
  });
  const update = useMutation({
    mutationFn: async (reaction: QuizReaction | null) =>
      (await api()).request("updateQuizReaction", {
        quizId,
        reaction,
      }),
    retry: false,
    onSuccess: (data) => {
      cache.setQueryData(queryKey, data);
    },
  });

  return { query, update };
}
