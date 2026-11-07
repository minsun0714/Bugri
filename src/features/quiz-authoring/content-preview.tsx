import type { QuizContent } from "@/api/contracts";
import { MarkdownContent } from "@/features/quiz-authoring/markdown-content";

export function ContentPreview({
  content,
}: {
  content: QuizContent;
}) {
  const { question, answer, explanation, hashtagIds } =
    content;
  const answerText =
    answer.type === "TRUE_FALSE"
      ? answer.value
        ? "O"
        : "X"
      : answer.type === "SHORT_ANSWER"
        ? answer.text
        : "choices" in question
          ? question.choices
              .filter(({ id }) =>
                answer.type === "SINGLE_CHOICE"
                  ? answer.choiceId === id
                  : answer.choiceIds.includes(id),
              )
              .map(({ text }) => text)
              .join(", ")
          : "";

  const format = {
    SINGLE_CHOICE: "객관식 · 하나 선택",
    MULTIPLE_CHOICE: "객관식 · 모두 선택",
    TRUE_FALSE: "OX 문제",
    SHORT_ANSWER: "단답형",
  } as const;

  return (
    <div className="grid gap-5 text-foreground">
      <p className="text-xs text-muted">
        {format[question.type]}
        {hashtagIds.length > 0 ? " · " : ""}{" "}
        {hashtagIds.map((id) => `#${id}`).join(" ")}
      </p>
      <MarkdownContent>{question.prompt}</MarkdownContent>
      {"choices" in question && (
        <ol aria-label="선택지" className="grid gap-2">
          {question.choices.map(({ id, text }, index) => (
            <li
              key={id}
              className="flex items-start gap-3 rounded-xl border border-line px-4 py-3 text-sm leading-6"
            >
              <span
                aria-hidden="true"
                className="shrink-0 font-semibold text-muted"
              >
                {index + 1}.
              </span>
              <span className="whitespace-pre-wrap break-words">
                {text}
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="grid gap-4 rounded-xl bg-canvas p-4">
        <div>
          <h3 className="mb-1 text-xs font-semibold text-muted">
            정답
          </h3>
          <p className="whitespace-pre-wrap break-words text-sm font-semibold">
            {answerText}
          </p>
        </div>
        <div>
          <h3 className="mb-1 text-xs font-semibold text-muted">
            해설
          </h3>
          <MarkdownContent>{explanation}</MarkdownContent>
        </div>
      </div>
    </div>
  );
}
