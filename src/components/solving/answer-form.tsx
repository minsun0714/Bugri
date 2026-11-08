"use client";

import { useEffect, useState, type ReactNode } from "react";
import { solvingStyles } from "@/components/solving/styles";
import type { Answer, Question } from "@/api/contracts";
import {
  Button,
  Checkbox,
  Choice,
  TextField,
} from "@/components/ui";

export function AnswerForm({
  question,
  onSubmit,
  onDirtyChange,
  pending,
  reaction,
}: {
  question: Question;
  onSubmit: (answer: Answer) => void;
  onDirtyChange?: (dirty: boolean) => void;
  pending: boolean;
  reaction?: ReactNode;
}) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const dirty = answer
    ? answer.type === "MULTIPLE_CHOICE"
      ? answer.choiceIds.length > 0
      : answer.type === "SHORT_ANSWER"
        ? answer.text.length > 0
        : true
    : false;
  const valid =
    answer &&
    (answer.type === "SHORT_ANSWER"
      ? !!answer.text.trim()
      : answer.type === "MULTIPLE_CHOICE"
        ? answer.choiceIds.length > 0
        : true);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (valid && !pending) onSubmit(answer);
      }}
      className={solvingStyles.answerForm}
    >
      <fieldset disabled={pending} className="space-y-3">
        <legend className="mb-3 text-xs font-medium text-muted">
          {question.type === "MULTIPLE_CHOICE"
            ? "정답을 모두 선택하세요"
            : question.type === "SHORT_ANSWER"
              ? "답안 입력"
              : "답안 선택"}
        </legend>
        {question.type === "SINGLE_CHOICE" &&
          question.choices.map(({ id, text }) => (
            <Choice
              key={id}
              name="answer"
              value={id}
              label={text}
              checked={
                answer?.type === "SINGLE_CHOICE" &&
                answer.choiceId === id
              }
              onChange={() =>
                setAnswer({
                  type: "SINGLE_CHOICE",
                  choiceId: id,
                })
              }
            />
          ))}
        {question.type === "MULTIPLE_CHOICE" && (
          <>
            {question.choices.map(({ id, text }) => (
              <Checkbox
                key={id}
                variant="choice"
                label={text}
                checked={
                  answer?.type === "MULTIPLE_CHOICE" &&
                  answer.choiceIds.includes(id)
                }
                onChange={(event) => {
                  const ids =
                    answer?.type === "MULTIPLE_CHOICE"
                      ? answer.choiceIds
                      : [];
                  setAnswer({
                    type: "MULTIPLE_CHOICE",
                    choiceIds: event.target.checked
                      ? [...ids, id]
                      : ids.filter((value) => value !== id),
                  });
                }}
              />
            ))}
          </>
        )}
        {question.type === "TRUE_FALSE" &&
          [true, false].map((value) => (
            <Choice
              key={String(value)}
              name="answer"
              value={String(value)}
              label={value ? "참" : "거짓"}
              checked={
                answer?.type === "TRUE_FALSE" &&
                answer.value === value
              }
              onChange={() =>
                setAnswer({ type: "TRUE_FALSE", value })
              }
            />
          ))}
        {question.type === "SHORT_ANSWER" && (
          <TextField
            label="답안"
            value={
              answer?.type === "SHORT_ANSWER"
                ? answer.text
                : ""
            }
            onChange={(event) =>
              setAnswer({
                type: "SHORT_ANSWER",
                text: event.target.value,
              })
            }
            hint="앞뒤 공백을 제외하고 대소문자를 구분합니다."
          />
        )}
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {reaction}
        <Button
          className={
            reaction
              ? "ml-auto shrink-0 sm:min-w-36"
              : "w-full sm:w-auto sm:min-w-36"
          }
          type="submit"
          disabled={!valid}
          loading={pending}
        >
          답 제출
        </Button>
      </div>
    </form>
  );
}
