"use client";

import { AttemptContext } from "@/api/constants";
import { useSolvingQueries } from "@/components/solving/queries";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export interface SolvingLocation {
  userId: string;
  attemptId: string | null;
  quizId: string | null;
}

export function solvingUrl({
  userId,
  attemptId,
}: Omit<SolvingLocation, "quizId">) {
  const params = new URLSearchParams({ user: userId });
  if (attemptId) params.set("attempt", attemptId);

  return `/solve?${params}`;
}

export function useQuizSolving(location: SolvingLocation) {
  const { userId, attemptId, quizId } = location;
  const router = useRouter();
  const { attempt, start, submit } = useSolvingQueries(
    userId,
    attemptId,
  );
  const active = useRef(false);
  const initialized = useRef(false);
  const busy = start.isPending;

  const { mutate: startMutation } = start;

  const startQuestion = useCallback(
    (id: string, replace = false) => {
      startMutation(
        {
          quizId: id,
          context: AttemptContext.DIRECT,
        },
        {
          onSuccess: (created) => {
            if (!active.current) return;
            const url = solvingUrl({
              ...location,
              attemptId: created.attemptId,
            });
            if (replace)
              router.replace(url, { scroll: false });
            else router.push(url, { scroll: false });
          },
        },
      );
    },
    [location, router, startMutation],
  );

  // Strict Mode may repeat effect setup. Only one entry mutation is issued per location.
  // An unmounted user's in-flight operation must never navigate the next user's screen.
  useEffect(() => {
    active.current = true;
    if (!initialized.current) {
      initialized.current = true;
      if (!attemptId) {
        if (quizId) startQuestion(quizId, true);
        else router.replace("/");
      }
    }
    return () => {
      active.current = false;
    };
  }, [attemptId, quizId, router, startQuestion]);

  return {
    attempt,
    submit,
    busy,
    error: start.error,
    retry: () => {
      if (start.error && start.variables) {
        startQuestion(start.variables.quizId, !attemptId);
      }
    },
    restart: () => {
      if (attempt.data) startQuestion(attempt.data.quizId);
    },
  };
}
