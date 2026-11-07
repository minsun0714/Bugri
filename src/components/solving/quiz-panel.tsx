"use client";
import { useEffect, useRef, type ReactNode } from "react";
import type {
  Answer,
  AttemptResult,
  LearningQuizView,
  Question,
} from "@/api/contracts";
import { Card } from "@/components/ui";
import { QuizText } from "@/components/solving/quiz-text";
import { AnswerForm } from "@/components/solving/answer-form";

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
  focusKey: string;
  pending: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  onSubmit: (answer: Answer) => void;
  children?: ReactNode;
}) {
  const start = useRef<HTMLDivElement>(null);
  const hasResult = !!result;
  const verdict = result?.correct ?? correct;
  useEffect(() => {
    const node = start.current;
    node?.focus({ preventScroll: true });
    node?.scrollIntoView?.({
      block: "nearest",
      behavior: "instant",
    });
  }, [focusKey, hasResult]);

  return (
    <Card className="space-y-5 sm:space-y-6">
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
        className="scroll-mt-6 rounded outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {result || completedAt ? (
          <div
            role="status"
            className={`mb-5 rounded-xl p-4 ${verdict ? "bg-lime/30" : "bg-coral/10"}`}
          >
            <h2 className="text-2xl">
              {verdict === true
                ? "정답입니다"
                : verdict === false
                  ? "오답입니다"
                  : "풀이 완료"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              풀이 완료
              {learningDate ? ` · ${learningDate}` : ""}
            </p>
          </div>
        ) : null}
        {quiz && (
          <>
            <h2 className="mb-3 text-sm font-medium text-muted">
              {quiz.title}
            </h2>
            <div className="text-xl font-semibold leading-relaxed sm:text-2xl [&_pre]:text-sm">
              <QuizText>{quiz.question.prompt}</QuizText>
            </div>
          </>
        )}
      </div>
      {quiz ? (
        result ? (
          <section
            aria-label="제출 결과"
            className="space-y-4 border-t border-line pt-5"
          >
            <div className="space-y-2">
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
            <h3 className="text-base">해설</h3>
            <QuizText>{result.explanation}</QuizText>
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
