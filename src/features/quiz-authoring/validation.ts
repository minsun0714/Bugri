import type {
  Hashtag,
  QuizContent,
  Revision,
} from "@/api/contracts";

export function editableContent({
  title,
  question,
  answer,
  explanation,
  hashtagIds,
}: Revision): QuizContent {
  return {
    title,
    question,
    answer,
    explanation,
    hashtagIds,
  };
}

export function validateEditor(
  content: QuizContent,
  source: string,
  tags: Hashtag[],
) {
  const errors: Record<string, string> = {};
  const {
    title,
    question,
    answer,
    explanation,
    hashtagIds,
  } = content;

  if (!title.trim()) errors.title = "제목을 입력하세요.";
  if (!source.trim() || [...source].length > 10000)
    errors.source =
      "학습 내용은 공백이 아닌 1~10,000자여야 합니다.";
  if (!question.prompt.trim())
    errors.prompt = "문제를 입력하세요.";
  if (!explanation.trim())
    errors.explanation = "해설을 입력하세요.";
  if (
    hashtagIds.length > 3 ||
    new Set(hashtagIds).size !== hashtagIds.length ||
    hashtagIds.some(
      (id) => !tags.some((tag) => tag.id === id),
    )
  )
    errors.tags =
      "등록된 해시태그를 중복 없이 최대 3개 선택하세요.";
  if ("choices" in question) {
    const labels = question.choices.map(({ text }) =>
      text.trim().normalize("NFC"),
    );
    if (
      labels.length < 2 ||
      labels.some((text) => !text) ||
      new Set(labels).size !== labels.length
    )
      errors.choices =
        "선택지는 비어 있거나 중복될 수 없습니다. 최소 2개를 입력하세요.";
    const ids = question.choices.map(({ id }) => id);
    if (
      answer.type === "SINGLE_CHOICE" &&
      !ids.includes(answer.choiceId)
    )
      errors.answer = "정답 선택지를 선택하세요.";
    if (
      answer.type === "MULTIPLE_CHOICE" &&
      (!answer.choiceIds.length ||
        answer.choiceIds.some((id) => !ids.includes(id)))
    )
      errors.answer = "정답 선택지를 하나 이상 선택하세요.";
  }
  if (answer.type === "SHORT_ANSWER" && !answer.text.trim())
    errors.answer = "단답 정답을 입력하세요.";

  return errors;
}
