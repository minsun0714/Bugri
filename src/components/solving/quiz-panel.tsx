"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import type {
  Answer,
  AttemptResult,
  LearningQuizView,
  Question,
} from "@/api/contracts";
import { Badge, Card } from "@/components/ui";
import { ResultBugri } from "@/components/solving/result-bugri";
import { QuizText } from "@/components/solving/quiz-text";
import { AnswerForm } from "@/components/solving/answer-form";
import { solvingStyles } from "@/components/solving/styles";

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

export function QuizPanel({
  quiz,
  result,
  completedAt,
  correct,
  learningDate,
  rewardBugCent,
  rewardHistoryHref,
  focusKey,
  pending,
  onDirtyChange,
  onSubmit,
  children,
}: {
  quiz: LearningQuizView | null;
  result: AttemptResult | null;
  completedAt?: string | null;
  correct?: boolean | null;
  learningDate?: string | null;
  rewardBugCent?: number;
  rewardHistoryHref?: string;
  focusKey: string;
  pending: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmit: (answer: Answer) => void;
  children?: ReactNode;
}) {
  const start = useRef<HTMLDivElement>(null);
  const handledFocus = useRef<string | null>(null);
  const hasResult = !!result;
  const verdict = result?.correct ?? correct;
  useEffect(() => {
    const node = start.current;
    const { activeElement } = document;
    const identity = `${focusKey}:${hasResult}`;
    if (handledFocus.current === identity) return;
    const initial = handledFocus.current === null;
    handledFocus.current = identity;
    // A late response must not take focus from a header control or open dialog.
    if (
      document.querySelector("dialog[open]") ||
      (initial &&
        activeElement !== document.body &&
        activeElement !== document.documentElement &&
        !node?.contains(activeElement))
    )
      return;
    node?.focus({ preventScroll: true });
    node?.scrollIntoView?.({
      block: "nearest",
      behavior: "instant",
    });
  }, [focusKey, hasResult]);

  return (
    <Card className={solvingStyles.card}>
      <div
        ref={start}
        tabIndex={-1}
        aria-label={
          result
            ? result.correct
              ? "정답입니다"
              : "오답입니다"
            : (quiz?.title ?? "풀이 완료")
        }
        className="scroll-mt-6 outline-none"
      >
        {result || completedAt ? (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 sm:gap-4"
          >
            <ResultBugri correct={verdict} />
            <div className="min-w-0">
              <h2
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-base ${verdict ? "bg-success-soft" : "bg-coral/10"}`}
              >
                <span aria-hidden="true">
                  {verdict === true
                    ? "✓"
                    : verdict === false
                      ? "×"
                      : "•"}
                </span>
                <span>
                  {verdict === true
                    ? "정답입니다"
                    : verdict === false
                      ? "오답입니다"
                      : "풀이 완료"}
                </span>
              </h2>
              <p className="mt-1 text-xs text-muted">
                풀이 완료
                {learningDate ? ` · ${learningDate}` : ""}
              </p>
              {rewardBugCent !== undefined &&
                rewardHistoryHref && (
                  <div className="flex flex-wrap items-center gap-x-3 text-sm">
                    <span
                      className={
                        rewardBugCent > 0
                          ? "font-semibold tabular-nums text-primary"
                          : "tabular-nums text-foreground"
                      }
                    >
                      {rewardBugCent > 0 ? "+" : ""}
                      {(rewardBugCent / 100).toFixed(
                        2,
                      )}{" "}
                      BugCoin
                    </span>
                    <Link
                      href={rewardHistoryHref}
                      className={solvingStyles.supportLink}
                    >
                      내역 보기
                    </Link>
                  </div>
                )}
            </div>
          </div>
        ) : null}
        {quiz && (
          <>
            <h2 className="mb-3 [&_.ui-badge]:bg-transparent [&_.ui-badge]:p-0 [&_.ui-badge]:text-xs [&_.ui-badge]:font-medium [&_.ui-badge]:tracking-normal [&_.ui-badge]:text-muted">
              <Badge>{quiz.title}</Badge>
            </h2>
            <div className="break-keep text-xl font-semibold leading-8 tracking-tight [overflow-wrap:anywhere] sm:text-2xl sm:leading-9 [&_pre]:text-sm [&_pre]:font-normal">
              <QuizText>{quiz.question.prompt}</QuizText>
            </div>
          </>
        )}
      </div>
      {quiz ? (
        result ? (
          <section
            aria-label="제출 결과"
            className="space-y-6 border-t border-line pt-6"
          >
            <div className="grid gap-4 rounded-2xl border border-line bg-canvas/50 p-4 sm:grid-cols-2">
              <p>
                내 답:{" "}
                {answerText(
                  result.submittedAnswer,
                  quiz.question,
                )}
              </p>
              <p className="font-semibold">
                정답:{" "}
                {answerText(result.answer, quiz.question)}
              </p>
            </div>
            <div className="space-y-3 leading-7">
              <h3 className="text-xs font-medium text-muted">
                해설
              </h3>
              <QuizText>{result.explanation}</QuizText>
            </div>
          </section>
        ) : (
          !completedAt && (
            <AnswerForm
              key={focusKey}
              question={quiz.question}
              pending={pending}
              onDirtyChange={onDirtyChange}
              onSubmit={onSubmit}
            />
          )
        )
      ) : (
        <p>
          이 퀴즈는 더 이상 이용할 수 없습니다. 완료 기록과
          이미 획득한 성과는 유지됩니다.
        </p>
      )}
      {children}
    </Card>
  );
}
