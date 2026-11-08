"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import {
  LearningState,
  type Answer,
  type LearningQuery,
} from "@/api/contracts";

export const solvingKey = (userId: string) =>
  ["solving", userId] as const;

async function apiFor(userId: string) {
  return createBrowserApi({ mode: "mock", userId });
}

export function useLearningQueries(
  userId: string,
  enabled: boolean,
) {
  const tags = useQuery({
    queryKey: ["learningTags", userId],
    queryFn: async () =>
      (await apiFor(userId)).request("learningTags", {}),
    enabled,
    retry: false,
  });
  // Selection and Attempt creation write state, so neither runs as an auto-refetch query.
  const select = useMutation({
    mutationFn: async ({
      next,
      ...filter
    }: LearningQuery & { next: boolean }) => {
      const api = await apiFor(userId);
      const selection = await api.request(
        next ? "learningNext" : "learningQuiz",
        filter,
      );
      const attempt =
        selection.state === LearningState.AVAILABLE &&
        selection.quiz
          ? await api.request("startAttempt", {
              quizId: selection.quiz.quizId,
              context: "LEARNING",
            })
          : null;

      return { selection, attempt };
    },
    retry: false,
  });

  return { tags, select };
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
      context: "DIRECT" | "LEARNING";
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
        [
          "learningDay",
          "learningQuiz",
          "wallet",
          "history",
        ].map((resource) =>
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
