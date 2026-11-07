"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LearningMode } from "@/api/contracts";
import {
  useLearningQueries,
  useSolvingQueries,
} from "@/components/solving/queries";

export interface SolvingLocation {
  userId: string;
  attemptId: string | null;
  quizId: string | null;
  hashtagId: string | null;
  mode: LearningMode;
  direct: boolean;
}

export function solvingUrl({
  userId,
  attemptId,
  hashtagId,
  mode,
  direct,
}: Omit<SolvingLocation, "quizId">) {
  const params = new URLSearchParams({ user: userId });
  if (attemptId) params.set("attempt", attemptId);
  if (!direct) {
    if (hashtagId) params.set("tag", hashtagId);
    if (mode === LearningMode.REPLAY)
      params.set("mode", mode);
  }

  return `${direct ? "/solve" : "/"}?${params}`;
}

export function useQuizSolving(location: SolvingLocation) {
  const {
    userId,
    attemptId,
    quizId,
    hashtagId,
    mode,
    direct,
  } = location;
  const router = useRouter();
  const { tags, select } = useLearningQueries(
    userId,
    !direct,
  );
  const { attempt, start, submit } = useSolvingQueries(
    userId,
    attemptId,
  );
  const active = useRef(false);
  const initialized = useRef(false);
  const busy = select.isPending || start.isPending;

  const { mutate: selectMutation } = select;
  const { mutate: startMutation } = start;

  const selectQuestion = useCallback(
    (
      next: boolean,
      nextMode = mode,
      replace = false,
      nextHashtag = hashtagId,
    ) => {
      selectMutation(
        { hashtagId: nextHashtag, mode: nextMode, next },
        {
          onSuccess: ({ attempt: created, selection }) => {
            if (!active.current) return;
            const url = solvingUrl({
              ...location,
              attemptId: created?.attemptId ?? null,
              hashtagId: selection.hashtagId,
              mode: selection.mode,
            });
            if (replace)
              router.replace(url, { scroll: false });
            else router.push(url, { scroll: false });
          },
        },
      );
    },
    [hashtagId, mode, location, router, selectMutation],
  );

  const startQuestion = useCallback(
    (id: string, replace = false) => {
      startMutation(
        {
          quizId: id,
          context: direct ? "DIRECT" : "LEARNING",
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
    [direct, location, router, startMutation],
  );

  // Strict Mode may repeat effect setup. Only one entry mutation is issued per location.
  // An unmounted user's in-flight operation must never navigate the next user's screen.
  useEffect(() => {
    active.current = true;
    if (!initialized.current) {
      initialized.current = true;
      if (!attemptId) {
        if (direct && quizId) startQuestion(quizId, true);
        else if (direct) router.replace("/");
        else selectQuestion(false, mode, true);
      }
    }
    return () => {
      active.current = false;
    };
  }, [
    attemptId,
    direct,
    quizId,
    router,
    mode,
    selectQuestion,
    startQuestion,
  ]);

  return {
    tags,
    attempt,
    submit,
    busy,
    error: select.error ?? start.error,
    empty:
      select.data?.attempt === null
        ? select.data.selection.state
        : null,
    learn: (tag: string | null) =>
      selectQuestion(
        false,
        LearningMode.UNSOLVED,
        false,
        tag,
      ),
    next: () => selectQuestion(true),
    replay: () =>
      selectQuestion(false, LearningMode.REPLAY),
    retry: () => {
      if (start.error && start.variables) {
        startQuestion(start.variables.quizId, !attemptId);
      } else {
        selectQuestion(
          select.variables?.next ?? false,
          select.variables?.mode ?? mode,
          !attemptId,
        );
      }
    },
    restart: () => {
      if (attempt.data) startQuestion(attempt.data.quizId);
    },
  };
}
