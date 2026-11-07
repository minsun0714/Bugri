"use client";

import { useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  LearningMode,
  LearningState,
  type Answer,
  type Question,
} from "@/api/contracts";
import { ApiClientError } from "@/api/client";
import {
  Button,
  Card,
  EmptyState,
  Skeleton,
} from "@/components/ui";
import { AnswerForm } from "@/components/solving/answer-form";
import { QuizText } from "@/components/solving/quiz-text";
import {
  solvingUrl,
  useQuizSolving,
  type SolvingLocation,
} from "@/components/solving/use-quiz-solving";

import { Bugri } from "@/components/ui/bugri";

function answerText(
  answer: Answer,
  question: Question,
): string {
  const choices =
    "choices" in question ? question.choices : [];
  const label = (id: string) =>
    choices.find((choice) => choice.id === id)?.text ?? id;
  switch (answer.type) {
    case "SINGLE_CHOICE":
      return label(answer.choiceId);
    case "MULTIPLE_CHOICE":
      return answer.choiceIds.map(label).join(", ");
    case "TRUE_FALSE":
      return answer.value ? "참" : "거짓";
    case "SHORT_ANSWER":
      return answer.text;
  }
}

function ErrorNotice({ error }: { error: Error }) {
  const code =
    error instanceof ApiClientError
      ? error.detail.code
      : "NETWORK_ERROR";
  const messages: Record<string, string> = {
    QUIZ_UNAVAILABLE:
      "이 퀴즈는 더 이상 이용할 수 없습니다.",
    FORBIDDEN: "이 사용자로는 접근할 수 없습니다.",
    NOT_FOUND:
      "풀이를 찾을 수 없습니다. 사용자와 주소를 확인하세요.",
    STORAGE_UNAVAILABLE:
      "브라우저 저장소를 사용할 수 없습니다. 저장 공간과 설정을 확인하고 다시 시도하세요.",
    STORAGE_CORRUPT:
      "저장된 데이터를 읽을 수 없습니다. 기존 데이터는 유지됩니다.",
    TIMEZONE_REQUIRED:
      "학습 시간대를 확인할 수 없습니다. 브라우저 시간대 설정을 확인한 뒤 다시 시도하세요.",
    ALREADY_ANSWERED:
      "이미 제출한 풀이입니다. 저장된 결과를 다시 확인하세요.",
  };
  return (
    <p
      role="alert"
      className="rounded-xl border border-coral p-4"
    >
      {messages[code] ??
        "요청에 실패했습니다. 다시 시도하세요."}{" "}
      버그리: 다시 시도해보자.
    </p>
  );
}

function Session({
  location,
}: {
  location: SolvingLocation;
}) {
  const router = useRouter();
  const { userId, attemptId, hashtagId, mode, direct } =
    location;
  const flow = useQuizSolving(location);
  const { attempt, submit, tags, busy, empty } = flow;
  const [celebrate, setCelebrate] = useState(false);
  const data = attempt.data;

  return (
    <div className="space-y-6">
      {!direct && (
        <label className="flex flex-wrap items-center gap-3">
          학습 태그
          <select
            aria-label="학습 태그"
            className="rounded-lg border border-line bg-surface p-2"
            value={hashtagId ?? ""}
            disabled={busy || submit.isPending}
            onChange={(event) =>
              router.push(
                solvingUrl({
                  ...location,
                  attemptId: null,
                  hashtagId: event.target.value || null,
                  mode: LearningMode.UNSOLVED,
                }),
                { scroll: false },
              )
            }
          >
            <option value="">전체</option>
            {hashtagId &&
              !tags.data?.some(
                ({ id }) => id === hashtagId,
              ) && (
                <option value={hashtagId}>
                  {hashtagId}
                </option>
              )}
            {tags.data?.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      )}
      {tags.error && (
        <>
          <ErrorNotice error={tags.error} />
          <Button onClick={() => void tags.refetch()}>
            태그 다시 불러오기
          </Button>
        </>
      )}
      {flow.error && (
        <>
          <ErrorNotice error={flow.error} />
          <Button onClick={flow.retry}>다시 시도</Button>
        </>
      )}
      {submit.error && <ErrorNotice error={submit.error} />}
      {busy ? (
        <Skeleton />
      ) : empty ? (
        <EmptyState
          title={
            empty === LearningState.EXHAUSTED
              ? "이 태그의 문제를 모두 풀었어요"
              : empty === LearningState.NO_REPLAY
                ? "아직 다시 풀 문제가 없습니다"
                : "학습할 퀴즈가 없습니다"
          }
          description={
            empty === LearningState.EMPTY
              ? "다른 태그를 선택하거나 개발자·태그를 탐색하고 구독해 보세요."
              : "다른 태그를 선택해 학습을 이어가세요."
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {empty === LearningState.EXHAUSTED && (
                <Button onClick={flow.replay}>
                  다시 풀기
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() =>
                  router.push(
                    `/discover?user=${encodeURIComponent(userId)}`,
                  )
                }
              >
                다른 태그 선택
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
              <Button
                onClick={() => void attempt.refetch()}
              >
                다시 불러오기
              </Button>
            </>
          )}
          {data && (
            <Card className="space-y-6">
              {data.completedAt && (
                <div role="status">
                  <h2 className="text-xl">
                    {data.correct
                      ? "정답입니다"
                      : "오답입니다"}
                  </h2>
                  <p>풀이 완료 · {data.learningDate}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-6 rounded-xl bg-primary/5 p-5">
                    <Bugri
                      mood={
                        celebrate
                          ? "complete"
                          : data.correct
                            ? "happy"
                            : "encouraging"
                      }
                    />
                    <p className="text-lg font-bold">
                      {celebrate
                        ? "끝까지 풀었어!"
                        : data.correct
                          ? "잘했어!"
                          : "해설을 읽고 다시 도전해보자."}
                    </p>
                  </div>
                  {!celebrate && (
                    <Button
                      variant="ghost"
                      onClick={() => setCelebrate(true)}
                    >
                      완료 확인
                    </Button>
                  )}
                </div>
              )}
              {data.quiz ? (
                <>
                  <h2 className="text-2xl">
                    {data.quiz.title}
                  </h2>
                  <QuizText>
                    {data.quiz.question.prompt}
                  </QuizText>
                  {data.result ? (
                    <section
                      className="space-y-4"
                      aria-label="제출 결과"
                    >
                      <p>
                        내 답:{" "}
                        {answerText(
                          data.result.submittedAnswer,
                          data.quiz.question,
                        )}
                      </p>
                      <p>
                        정답:{" "}
                        {answerText(
                          data.result.answer,
                          data.quiz.question,
                        )}
                      </p>
                      <h3>해설</h3>
                      <QuizText>
                        {data.result.explanation}
                      </QuizText>
                      <Button onClick={flow.restart}>
                        다시 풀기
                      </Button>
                    </section>
                  ) : (
                    !data.completedAt && (
                      <AnswerForm
                        question={data.quiz.question}
                        pending={submit.isPending}
                        onSubmit={(answer) =>
                          submit.mutate(answer)
                        }
                      />
                    )
                  )}
                </>
              ) : (
                <p>
                  이 퀴즈는 더 이상 이용할 수 없습니다. 완료
                  기록과 이미 획득한 성과는 유지됩니다.
                </p>
              )}
              {!direct &&
                (data.completedAt || !data.quiz) && (
                  <Button onClick={flow.next}>
                    다음 문제
                  </Button>
                )}
            </Card>
          )}
        </>
      )}
      {mode === LearningMode.REPLAY && !direct && (
        <p className="text-sm text-muted">
          완료한 문제를 다시 풀고 있어요.
        </p>
      )}
      {direct && (
        <a
          className="inline-block text-primary underline"
          href={`/?user=${encodeURIComponent(userId)}`}
        >
          홈에서 학습하기
        </a>
      )}
    </div>
  );
}

export function SolveScreen({
  direct = false,
}: {
  direct?: boolean;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const userId = params.get("user") ?? "learner";
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
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <div className="space-y-6">
        <h1 className="text-3xl">
          {direct ? "퀴즈 풀이" : "오늘의 퀴즈"}
        </h1>
        <Session
          key={JSON.stringify(location)}
          location={location}
        />
        <details className="border-t border-line pt-4 text-sm text-muted">
          <summary className="cursor-pointer">
            프로토타입 안내 · 사용자 전환
          </summary>
          <label className="my-4 flex flex-wrap items-center gap-3">
            더미 사용자
            <select
              className="rounded-lg border border-line bg-surface p-2"
              aria-label="더미 사용자"
              value={userId}
              onChange={(event) =>
                router.push(
                  `/?user=${encodeURIComponent(event.target.value)}`,
                )
              }
            >
              <option value="learner">학습자</option>
              <option value="author">작성자</option>
              <option value="friend">친구</option>
            </select>
          </label>
          <p>
            브라우저에 저장되는 프로토타입입니다. 브라우저
            데이터를 삭제하면 풀이 기록이 사라질 수 있어요.
          </p>
        </details>
      </div>
    </QueryClientProvider>
  );
}
