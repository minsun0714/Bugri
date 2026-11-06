import type { QuizContent } from "@/api/contracts";
import { styles } from "@/features/quiz-authoring/styles";

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

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted">
        {question.type} ·{" "}
        {hashtagIds.map((id) => `#${id}`).join(" ")}
      </p>
      <div className={styles.prose}>{question.prompt}</div>
      {"choices" in question && (
        <ul className="grid gap-2 pl-5">
          {question.choices.map(({ id, text }) => (
            <li
              key={id}
              className="list-disc whitespace-pre-wrap break-words"
            >
              {text}
            </li>
          ))}
        </ul>
      )}
      <p className="whitespace-pre-wrap break-words">
        <strong>정답:</strong> {answerText}
      </p>
      <div>
        <h3>해설</h3>
        <div className={styles.prose}>{explanation}</div>
      </div>
    </div>
  );
}
