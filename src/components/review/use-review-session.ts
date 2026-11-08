"use client";

import { useCallback } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AttemptContext } from "@/api/constants";
import { useSolvingQueries } from "@/components/solving/queries";

const attemptParam = "review";

/**
 * One review at a time on the home screen. The open attempt lives in the URL (`review`), so a reload
 * restores the question being solved or its result.
 */
export function useReviewSession(userId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const attemptId = params.get(attemptParam);

  const { attempt, start, submit } = useSolvingQueries(
    userId,
    attemptId,
  );

  const show = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(params);

      if (id) next.set(attemptParam, id);
      else next.delete(attemptParam);

      router.replace(`${pathname}?${next}`, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  const { mutate } = start;

  const begin = useCallback(
    (quizId: string) =>
      mutate(
        { quizId, context: AttemptContext.REVIEW },
        { onSuccess: ({ attemptId: id }) => show(id) },
      ),
    [mutate, show],
  );

  return {
    attemptId,
    attempt,
    start,
    submit,
    begin,
    close: () => show(null),
  };
}
