import type {
  Answer,
  Category,
  ErrorCode,
  QuizContent,
  Question,
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

export const categories: Category[] = [
  "KEYBOARD",
  "MONITOR",
  "DESK",
  "ACCESSORY",
  "BACKGROUND",
];

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

  requireValue(
    value.type === question.type,
    "문제 형식에 맞는 답안을 제출하세요.",
    "answer",
  );

  switch (question.type) {
    case "SINGLE_CHOICE":
      keys(value, ["type", "choiceId"]);

      requireValue(
        question.choices.some(
          (c) => c.id === value.choiceId,
        ),
        "유효한 선택지가 필요합니다.",
        "answer",
      );

      break;

    case "MULTIPLE_CHOICE":
      keys(value, ["type", "choiceIds"]);

      requireValue(
        Array.isArray(value.choiceIds) &&
          value.choiceIds.length > 0 &&
          new Set(value.choiceIds).size ===
            value.choiceIds.length &&
          value.choiceIds.every((id) =>
            question.choices.some((c) => c.id === id),
          ),
        "중복 없는 유효한 선택지가 필요합니다.",
        "answer",
      );

      break;

    case "TRUE_FALSE":
      keys(value, ["type", "value"]);

      requireValue(
        typeof value.value === "boolean",
        "OX 답안이 필요합니다.",
        "answer",
      );

      break;

    case "SHORT_ANSWER":
      keys(value, ["type", "text"]);
      text(value.text, "answer");
      break;
  }
}

export function validateContent(
  value: unknown,
  hashtagIds: string[],
): asserts value is QuizContent {
  object(value);

  keys(value, [
    "title",
    "question",
    "answer",
    "explanation",
    "hashtagIds",
  ]);

  text(value.title, "title");
  text(value.explanation, "explanation");
  object(value.question);

  const q = value.question;

  text(q.prompt, "question.prompt");

  requireValue(
    [
      "SINGLE_CHOICE",
      "MULTIPLE_CHOICE",
      "TRUE_FALSE",
      "SHORT_ANSWER",
    ].includes(String(q.type)),
    "지원하지 않는 문제 형식입니다.",
  );

  if (
    q.type === "SINGLE_CHOICE" ||
    q.type === "MULTIPLE_CHOICE"
  ) {
    keys(q, ["type", "prompt", "choices"]);

    requireValue(
      Array.isArray(q.choices) && q.choices.length >= 2,
      "선택지가 2개 이상 필요합니다.",
    );

    const ids: string[] = [],
      labels: string[] = [];

    for (const choice of q.choices) {
      object(choice);
      keys(choice, ["id", "text"]);
      text(choice.id);
      text(choice.text);
      ids.push(choice.id);
      labels.push(choice.text.trim().normalize("NFC"));
    }

    requireValue(
      new Set(ids).size === ids.length &&
        new Set(labels).size === labels.length,
      "중복 선택지는 허용하지 않습니다.",
    );
  } else keys(q, ["type", "prompt"]);

  requireValue(
    Array.isArray(value.hashtagIds) &&
      value.hashtagIds.length <= 3 &&
      new Set(value.hashtagIds).size ===
        value.hashtagIds.length &&
      value.hashtagIds.every((id) =>
        hashtagIds.includes(id),
      ),
    "서로 다른 유효한 해시태그를 최대 3개 지정하세요.",
    "hashtagIds",
  );

  validateAnswer(value.answer, q as unknown as Question);
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
