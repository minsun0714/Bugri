"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { createQueryClient } from "@/api/query-client";

import { useState } from "react";
import { StreakSummary } from "@/components/streak/streak-summary";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  LearningMode,
  LearningState,
} from "@/api/contracts";
import { ErrorNotice } from "@/components/solving/error-notice";
import {
  Button,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import {
  solvingUrl,
  useQuizSolving,
  type SolvingLocation,
} from "@/components/solving/use-quiz-solving";

import { QuizReactionControl } from "@/components/solving/quiz-reaction";
import { QuizPanel } from "@/components/solving/quiz-panel";
import { GuestQuiz } from "@/components/solving/guest-quiz";
import { Dropdown } from "@/components/ui/dropdown";
import { solvingStyles } from "@/components/solving/styles";

function Session({
  location,
}: {
  location: SolvingLocation;
}) {
  const t = useTranslation();

  const router = useRouter();
  const selectedUser = useSearchParams().get("user");
  const { userId, attemptId, hashtagId, mode, direct } =
    location;
  const flow = useQuizSolving(location);
  const { attempt, submit, tags, busy, empty } = flow;
  const [answerDirty, setAnswerDirty] = useState(false);
  const data = attempt.data;

  function changeLearningTag(value: string) {
    if (
      answerDirty &&
      !window.confirm(
        t(
          "작성 중인 답안이 사라집니다. 학습 태그를 바꿀까요?",
        ),
      )
    ) {
      return;
    }

    setAnswerDirty(false);
    router.push(
      solvingUrl({
        ...location,
        attemptId: null,
        hashtagId: value || null,
        mode: LearningMode.UNSOLVED,
      }),
      { scroll: false },
    );
  }

  function exploreTags() {
    router.push(
      `/discover/tags?user=${encodeURIComponent(userId)}`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className={solvingStyles.title}>
          {direct ? t("퀴즈 풀이") : t("오늘의 퀴즈")}
        </h1>
        {!direct && (
          <div className={solvingStyles.tagFilter}>
            <Dropdown
              label={t("학습 태그")}
              value={hashtagId ?? ""}
              disabled={busy || submit.isPending}
              options={[
                { value: "", label: t("전체") },
                ...(hashtagId &&
                !tags.data?.some(
                  ({ id }) => id === hashtagId,
                )
                  ? [{ value: hashtagId, label: hashtagId }]
                  : []),
                ...(tags.data?.map(({ id, name }) => ({
                  value: id,
                  label: name,
                })) ?? []),
              ]}
              onValueChange={changeLearningTag}
            />
          </div>
        )}
      </div>
      {tags.error && (
        <>
          <ErrorNotice error={tags.error} />
          <div className="flex justify-end">
            <Button onClick={() => void tags.refetch()}>
              {t("태그 다시 불러오기")}
            </Button>
          </div>
        </>
      )}
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
      {busy ? (
        <Skeleton />
      ) : empty ? (
        <EmptyState
          title={
            empty === LearningState.EXHAUSTED
              ? t("이 태그의 문제를 모두 풀었어요")
              : empty === LearningState.NO_REPLAY
                ? t("아직 다시 풀 문제가 없습니다")
                : t("학습할 퀴즈가 없습니다")
          }
          description={
            empty === LearningState.EMPTY
              ? t(
                  "다른 태그를 선택하거나 개발자·태그를 탐색하고 구독해 보세요.",
                )
              : t("다른 태그를 선택해 학습을 이어가세요.")
          }
          action={
            <div className="flex flex-wrap justify-end gap-3">
              <Button onClick={exploreTags}>
                {t("태그 탐색")}
              </Button>
            </div>
          }
        />
      ) : (
        <>
          {attemptId && attempt.isPending && <Skeleton />}
          {attempt.error && (
            <>
              <ErrorNotice error={attempt.error} />
              <div className="flex justify-end">
                <Button
                  onClick={() => void attempt.refetch()}
                >
                  {t("다시 불러오기")}
                </Button>
              </div>
            </>
          )}
          {data && (
            <QuizPanel
              reaction={
                data.quiz && (
                  <QuizReactionControl
                    align="left"
                    key={`${selectedUser}:${data.quizId}`}
                    userId={selectedUser}
                    quizId={data.quizId}
                  />
                )
              }
              quiz={data.quiz}
              result={data.result}
              completedAt={data.completedAt}
              rewardBugCent={data.rewardBugCent}
              rewardOutcome={data.rewardOutcome}
              rewardHistoryHref={`/coin-history?user=${encodeURIComponent(userId)}`}
              correct={data.correct}
              learningDate={data.learningDate}
              focusKey={data.attemptId}
              pending={submit.isPending}
              onDirtyChange={setAnswerDirty}
              onSubmit={(answer) =>
                submit.mutate(answer, {
                  onSuccess: () => setAnswerDirty(false),
                })
              }
            >
              {(data.quiz && data.result) ||
              (!direct &&
                (data.completedAt || !data.quiz)) ? (
                <div className="flex flex-wrap items-center justify-end gap-3 [&>button]:min-w-28">
                  {data.quiz && data.result && (
                    <Button
                      variant="secondary"
                      onClick={flow.restart}
                    >
                      {t("다시 풀기")}
                    </Button>
                  )}
                  {!direct &&
                    (data.completedAt || !data.quiz) && (
                      <Button onClick={flow.next}>
                        {t("다음 문제")}
                      </Button>
                    )}
                </div>
              ) : null}
            </QuizPanel>
          )}
        </>
      )}
      {mode === LearningMode.REPLAY && !direct && (
        <p className="text-sm text-muted">
          {t("완료한 문제를 다시 풀고 있어요.")}
        </p>
      )}
    </div>
  );
}

export function SolveScreen({
  direct = false,
  showStreak = false,
}: {
  direct?: boolean;
  showStreak?: boolean;
}) {
  const t = useTranslation();

  const params = useSearchParams();
  const selectedUser = params.get("user");
  const userId = selectedUser ?? "learner";
  const location: SolvingLocation = {
    userId,
    attemptId: params.get("attempt"),
    quizId: direct ? params.get("quiz") : null,
    hashtagId: direct ? null : params.get("tag"),
    mode:
      params.get("mode") === LearningMode.REPLAY
        ? LearningMode.REPLAY
        : LearningMode.UNSOLVED,
    direct,
  };
  const [client] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={client}>
      <div className={solvingStyles.frame}>
        {showStreak && <StreakSummary userId={userId} />}
        {selectedUser || direct ? (
          <Session
            key={JSON.stringify(location)}
            location={location}
          />
        ) : (
          <>
            <h1 className={solvingStyles.title}>
              {t("오늘의 퀴즈")}
            </h1>
            <GuestQuiz />
          </>
        )}
        <div className="grid items-start gap-3 text-[13px] text-muted sm:grid-cols-[1fr_auto]">
          <details>
            <summary className="w-fit cursor-pointer rounded py-2 focus-visible:outline-2 focus-visible:outline-primary">
              {t("프로토타입 안내")}
            </summary>
            <p className="mt-3">
              {selectedUser
                ? t(
                    "데모 학습 기록은 이 브라우저에 저장됩니다. 브라우저 데이터를 삭제하면 기록이 사라질 수 있어요.",
                  )
                : t(
                    "방문자 체험은 일시적이며 학습 기록과 보상이 저장되지 않습니다.",
                  )}
            </p>
          </details>
          <a
            href={
              direct
                ? `/?user=${encodeURIComponent(userId)}`
                : "/shop"
            }
            className={solvingStyles.supportLink}
          >
            {direct
              ? t("홈에서 학습하기 →")
              : t("BugCoin 상점 둘러보기 →")}
          </a>
        </div>
      </div>
    </QueryClientProvider>
  );
}
