"use client";

import { useState } from "react";
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
  pending,
}: {
  question: Question;
  onSubmit: (answer: Answer) => void;
  pending: boolean;
}) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const valid =
    answer &&
    (answer.type === "SHORT_ANSWER"
      ? !!answer.text.trim()
      : answer.type === "MULTIPLE_CHOICE"
        ? answer.choiceIds.length > 0
        : true);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (valid && !pending) onSubmit(answer);
      }}
      className="space-y-5"
    >
      <fieldset disabled={pending} className="space-y-3">
        <legend className="mb-3 font-bold">
          답안 선택
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
            <p className="text-sm text-muted">
              해당하는 답을 모두 선택하세요.
            </p>
            {question.choices.map(({ id, text }) => (
              <Checkbox
                key={id}
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
      <Button
        type="submit"
        disabled={!valid}
        loading={pending}
      >
        답 제출
      </Button>
    </form>
  );
}
