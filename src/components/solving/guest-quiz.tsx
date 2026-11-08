"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { useState } from "react";
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { createBrowserApi } from "@/api/browser";
import type { Answer } from "@/api/contracts";
import {
  Button,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { QuizPanel } from "@/components/solving/quiz-panel";
import { ErrorNotice } from "@/components/solving/error-notice";

export function GuestQuiz() {
  const [round, setRound] = useState(0);
  return (
    <GuestRound
      key={round}
      round={round}
      next={() => setRound((value) => value + 1)}
    />
  );
}

function GuestRound({
  round,
  next,
}: {
  round: number;
  next: () => void;
}) {
  const t = useTranslation();

  const quiz = useQuery({
    queryKey: ["guestQuiz", round],
    queryFn: async () =>
      (
        await createBrowserApi({
          mode: "mock",
          userId: "guest",
        })
      ).request("guestQuiz", {}),
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const submit = useMutation({
    mutationFn: async (answer: Answer) =>
      (
        await createBrowserApi({
          mode: "mock",
          userId: "guest",
        })
      ).request("guestAnswer", {
        quizId: quiz.data!.quizId,
        revisionId: quiz.data!.revisionId,
        answer,
      }),
    retry: false,
  });
  if (quiz.isPending) return <Skeleton />;
  if (quiz.error)
    return (
      <div className="space-y-4">
        <ErrorNotice error={quiz.error} />
        <Button onClick={() => void quiz.refetch()}>
          {t("다시 불러오기")}
        </Button>
      </div>
    );
  if (!quiz.data)
    return (
      <EmptyState
        title={t("공개된 퀴즈가 없습니다")}
        description={t(
          "새로운 퀴즈가 공개되면 체험할 수 있어요.",
        )}
      />
    );
  return (
    <div className="space-y-4">
      {submit.error && <ErrorNotice error={submit.error} />}
      <QuizPanel
        quiz={quiz.data}
        result={submit.data ?? null}
        focusKey={`guest-${round}`}
        pending={submit.isPending}
        onSubmit={(answer) => submit.mutate(answer)}
      >
        {(submit.data || submit.error) && (
          <div className="flex justify-end">
            <Button onClick={next}>{t("다음 문제")}</Button>
          </div>
        )}
      </QuizPanel>
    </div>
  );
}
