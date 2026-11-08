import type {
  Answer,
  ErrorCode,
  Question,
  QuizContent,
} from "@/api/contracts";

export class ServiceError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly status = 400,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
  }
}

export function requireValue(
  condition: unknown,
  message: string,
  field = "request",
): asserts condition {
  if (!condition)
    throw new ServiceError(
      "VALIDATION_ERROR",
      message,
      400,
      {
        [field]: message,
      },
    );
}

export function object(
  value: unknown,
): asserts value is Record<string, unknown> {
  requireValue(
    value !== null &&
      typeof value === "object" &&
      !Array.isArray(value),
    "객체가 필요합니다.",
  );
}

export function keys(
  value: Record<string, unknown>,
  allowed: string[],
) {
  requireValue(
    Object.keys(value).every((key) =>
      allowed.includes(key),
    ),
    "지원하지 않는 필드입니다.",
  );
}

export function text(
  value: unknown,
  field = "text",
): asserts value is string {
  requireValue(
    typeof value === "string" && value.trim().length > 0,
    "빈 문자열은 허용하지 않습니다.",
    field,
  );
}

export function source(
  value: unknown,
): asserts value is string {
  text(value, "sourceContent");

  requireValue(
    [...value].length <= 10_000,
    "학습 내용은 최대 10,000자입니다.",
    "sourceContent",
  );
}

export function timeZoneValid(
  value: unknown,
): value is string {
  if (
    typeof value !== "string" ||
    !value ||
    /^[+-]/.test(value)
  )
    return false;

  try {
    new Intl.DateTimeFormat("en", {
      timeZone: value,
    }).format();

    return true;
  } catch {
    return false;
  }
}

export function validateAnswer(
  value: unknown,
  question: Question,
): asserts value is Answer {
  object(value);

  const {
    type,
    choiceId,
    choiceIds,
    value: booleanAnswer,
    text: answerText,
  } = value;

  requireValue(
    type === question.type,
    "문제 형식에 맞는 답안을 제출하세요.",
    "answer",
  );

  switch (question.type) {
    case "SINGLE_CHOICE": {
      keys(value, ["type", "choiceId"]);

      const { choices } = question;

      requireValue(
        choices.some(({ id }) => id === choiceId),
        "유효한 선택지가 필요합니다.",
        "answer",
      );

      break;
    }

    case "MULTIPLE_CHOICE": {
      keys(value, ["type", "choiceIds"]);

      const { choices } = question;

      requireValue(
        Array.isArray(choiceIds) &&
          choiceIds.length > 0 &&
          new Set(choiceIds).size === choiceIds.length &&
          choiceIds.every((choiceId) =>
            choices.some(({ id }) => id === choiceId),
          ),
        "중복 없는 유효한 선택지가 필요합니다.",
        "answer",
      );

      break;
    }

    case "TRUE_FALSE":
      keys(value, ["type", "value"]);

      requireValue(
        typeof booleanAnswer === "boolean",
        "OX 답안이 필요합니다.",
        "answer",
      );

      break;

    case "SHORT_ANSWER":
      keys(value, ["type", "text"]);
      text(answerText, "answer");
      break;
  }
}

export function validateContent(
  value: unknown,
  hashtagIds: string[],
): asserts value is QuizContent;

export function validateContent(
  value: unknown,
  hashtagIds: string[],
  partialHistory: boolean,
): void;

export function validateContent(
  value: unknown,
  hashtagIds: string[],
  partialHistory = false,
): void {
  object(value);

  keys(value, [
    "title",
    "question",
    "answer",
    "explanation",
    "hashtagIds",
  ]);

  const {
    title,
    explanation,
    question: q,
    answer,
    hashtagIds: contentHashtagIds,
  } = value;

  if (!partialHistory || title != null)
    text(title, "title");

  if (!partialHistory || explanation != null)
    text(explanation, "explanation");

  object(q);

  const { type, prompt, choices } = q;

  text(prompt, "question.prompt");

  requireValue(
    [
      "SINGLE_CHOICE",
      "MULTIPLE_CHOICE",
      "TRUE_FALSE",
      "SHORT_ANSWER",
    ].includes(String(type)),
    "지원하지 않는 문제 형식입니다.",
  );

  if (
    type === "SINGLE_CHOICE" ||
    type === "MULTIPLE_CHOICE"
  ) {
    keys(q, ["type", "prompt", "choices"]);

    requireValue(
      Array.isArray(choices) && choices.length >= 2,
      "선택지가 2개 이상 필요합니다.",
    );

    const ids: string[] = [],
      labels: string[] = [];

    for (const choice of choices) {
      object(choice);
      keys(choice, ["id", "text"]);

      const { id, text: choiceText } = choice;

      text(id);
      text(choiceText);
      ids.push(id);
      labels.push(choiceText.trim().normalize("NFC"));
    }

    requireValue(
      new Set(ids).size === ids.length &&
        new Set(labels).size === labels.length,
      "중복 선택지는 허용하지 않습니다.",
    );
  } else keys(q, ["type", "prompt"]);

  requireValue(
    Array.isArray(contentHashtagIds) &&
      contentHashtagIds.length <= 3 &&
      new Set(contentHashtagIds).size ===
        contentHashtagIds.length &&
      contentHashtagIds.every((id) =>
        hashtagIds.includes(id),
      ),
    "서로 다른 유효한 해시태그를 최대 3개 지정하세요.",
    "hashtagIds",
  );

  if (!partialHistory || answer != null)
    validateAnswer(answer, q as unknown as Question);
}

export function isCorrect(
  answer: Answer,
  expected: Answer,
): boolean {
  if (answer.type !== expected.type) return false;

  switch (answer.type) {
    case "SINGLE_CHOICE":
      return (
        expected.type === answer.type &&
        answer.choiceId === expected.choiceId
      );

    case "MULTIPLE_CHOICE":
      return (
        expected.type === answer.type &&
        [...answer.choiceIds].sort().join("\0") ===
          [...expected.choiceIds].sort().join("\0")
      );

    case "TRUE_FALSE":
      return (
        expected.type === answer.type &&
        answer.value === expected.value
      );

    case "SHORT_ANSWER":
      return (
        expected.type === answer.type &&
        answer.text.trim().normalize("NFC") ===
          expected.text.trim().normalize("NFC")
      );
  }
}
