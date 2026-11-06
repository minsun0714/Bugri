import type {
  QuizContent,
  ReviewQuiz,
} from "../api/contracts";
export const generatedContents: readonly QuizContent[] = [
  {
    title: "타입 선언",
    question: {
      type: "SINGLE_CHOICE",
      prompt: "TypeScript에서 숫자 타입은?",
      choices: [
        { id: "a", text: "number" },
        { id: "b", text: "string" },
      ],
    },
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
    explanation: "숫자 타입은 number입니다.",
    hashtagIds: ["typescript"],
  },
  {
    title: "블록 스코프",
    question: {
      type: "MULTIPLE_CHOICE",
      prompt: "블록 스코프를 갖는 선언을 모두 고르세요.",
      choices: [
        { id: "a", text: "let" },
        { id: "b", text: "const" },
        { id: "c", text: "var" },
      ],
    },
    answer: {
      type: "MULTIPLE_CHOICE",
      choiceIds: ["a", "b"],
    },
    explanation: "let과 const는 블록 스코프를 가집니다.",
    hashtagIds: ["javascript", "web"],
  },
  {
    title: "HTTP",
    question: {
      type: "TRUE_FALSE",
      prompt: "HTTP는 요청과 응답을 사용한다.",
    },
    answer: { type: "TRUE_FALSE", value: true },
    explanation: "클라이언트의 요청에 서버가 응답합니다.",
    hashtagIds: ["web"],
  },
  {
    title: "불변 선언",
    question: {
      type: "SHORT_ANSWER",
      prompt: "JavaScript에서 재할당을 막는 선언 키워드는?",
    },
    answer: { type: "SHORT_ANSWER", text: "const" },
    explanation: "const는 바인딩의 재할당을 금지합니다.",
    hashtagIds: ["javascript"],
  },
];
export const quizzes: readonly ReviewQuiz[] =
  generatedContents.map((content, index) => ({
    quizId: `seed-quiz-${index + 1}`,
    ownerUserId: index < 2 ? "author" : "friend",
    status: "PUBLIC",
    version: 1,
    active: {
      ...content,
      revisionId: `seed-revision-${index + 1}`,
      sourceContent: "Mock 학습 자료",
      reviewed: true,
    },
    pending: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
  }));
