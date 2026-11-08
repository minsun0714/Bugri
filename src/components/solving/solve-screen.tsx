"use client";
import { createQueryClient } from "@/api/query-client";
import { useDemoSession } from "@/components/navigation/demo-session";
import { ErrorNotice } from "@/components/solving/error-notice";
import { QuizPanel } from "@/components/solving/quiz-panel";
import { solvingStyles } from "@/components/solving/styles";
import {
  useQuizSolving,
  type SolvingLocation,
} from "@/components/solving/use-quiz-solving";
import {
  Button,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { useTranslation } from "@/lib/i18n/use-translation";
import { QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function Session({
  location,
}: {
  location: SolvingLocation;
}) {
  const t = useTranslation();
  const flow = useQuizSolving(location);
  const { attempt, submit, busy } = flow;
  const { data } = attempt;
  return (
    <div className="space-y-6">
      <h1 className={solvingStyles.title}>
        {t("퀴즈 풀이")}
      </h1>
      {flow.error && (
        <>
          <ErrorNotice error={flow.error} />
          <div className="flex justify-end">
            <Button onClick={flow.retry}>
              {t("다시 시도")}
            </Button>
          </div>
        </>
      )}
      {submit.error && <ErrorNotice error={submit.error} />}
      {(busy ||
        (location.attemptId && attempt.isPending)) && (
        <Skeleton />
      )}
      {attempt.error && (
        <>
          <ErrorNotice error={attempt.error} />
          <div className="flex justify-end">
            <Button onClick={() => void attempt.refetch()}>
              {t("다시 불러오기")}
            </Button>
          </div>
        </>
      )}
      {data && (
        <QuizPanel
          quiz={data.quiz}
          result={data.result}
          completedAt={data.completedAt}
          correct={data.correct}
          learningDate={data.learningDate}
          focusKey={data.attemptId}
          pending={submit.isPending}
          onSubmit={(answer) => submit.mutate(answer)}
        >
          {data.quiz && data.result && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={flow.restart}
              >
                {t("다시 풀기")}
              </Button>
            </div>
          )}
        </QuizPanel>
      )}
    </div>
  );
}

export function SolveScreen() {
  const t = useTranslation();
  const params = useSearchParams();
  const userId = params.get("user");
  const { signIn } = useDemoSession();
  const [client] = useState(() => createQueryClient());
  const location = userId
    ? {
        userId,
        attemptId: params.get("attempt"),
        quizId: params.get("quiz"),
      }
    : null;
  return (
    <QueryClientProvider client={client}>
      <div className={solvingStyles.frame}>
        {location ? (
          <Session
            key={JSON.stringify(location)}
            location={location}
          />
        ) : (
          <EmptyState
            description=""
            title={t("데모 사용자 선택")}
            action={
              <Button onClick={() => signIn()}>
                {t("데모 사용자 선택")}
              </Button>
            }
          />
        )}
      </div>
    </QueryClientProvider>
  );
}
