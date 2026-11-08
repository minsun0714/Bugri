import { QuizStatus } from "@/api/constants";
import type {
  QuizContent,
  ReviewQuiz,
} from "@/api/contracts";

export const generatedContents: readonly QuizContent[] = [
  {
    title: "타입 선언",
    question: {
      type: "SINGLE_CHOICE",
      prompt: "TypeScript에서 숫자 타입은?",
      choices: [
        {
          id: "a",
          text: "number",
        },
        {
          id: "b",
          text: "string",
        },
      ],
    },
    answer: {
      type: "SINGLE_CHOICE",
      choiceId: "a",
    },
    explanation: "숫자 타입은 number입니다.",
    hashtagIds: ["typescript"],
  },
  {
    title: "블록 스코프",
    question: {
      type: "MULTIPLE_CHOICE",
      prompt: "블록 스코프를 갖는 선언을 모두 고르세요.",
      choices: [
        {
          id: "a",
          text: "let",
        },
        {
          id: "b",
          text: "const",
        },
        {
          id: "c",
          text: "var",
        },
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
    answer: {
      type: "TRUE_FALSE",
      value: true,
    },
    explanation: "클라이언트의 요청에 서버가 응답합니다.",
    hashtagIds: ["web"],
  },
  {
    title: "불변 선언",
    question: {
      type: "SHORT_ANSWER",
      prompt: "JavaScript에서 재할당을 막는 선언 키워드는?",
    },
    answer: {
      type: "SHORT_ANSWER",
      text: "const",
    },
    explanation: "const는 바인딩의 재할당을 금지합니다.",
    hashtagIds: ["javascript"],
  },
];

/** The demo learner's own private practice quizzes. They back the history demo without touching the public catalog, tag counts or the unsolved learning pool. */
export const historyDemoContents: readonly QuizContent[] = [
  {
    title: "제네릭 기본",
    question: {
      type: "SINGLE_CHOICE",
      prompt:
        "다음 함수에서 T의 역할은? function identity<T>(value: T): T",
      choices: [
        {
          id: "a",
          text: "호출 시점에 결정되는 타입 매개변수",
        },
        { id: "b", text: "런타임에 생성되는 클래스" },
        { id: "c", text: "any의 별칭" },
      ],
    },
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
    explanation:
      "T는 호출할 때 추론되는 타입 매개변수입니다.",
    hashtagIds: ["typescript"],
  },
  {
    title: "클로저",
    question: {
      type: "TRUE_FALSE",
      prompt:
        "클로저는 함수가 선언된 시점의 렉시컬 환경을 기억한다.",
    },
    answer: { type: "TRUE_FALSE", value: true },
    explanation:
      "내부 함수는 바깥 스코프의 변수에 계속 접근할 수 있습니다.",
    hashtagIds: ["javascript"],
  },
  {
    title: "Promise 상태",
    question: {
      type: "MULTIPLE_CHOICE",
      prompt:
        "Promise가 가질 수 있는 상태를 모두 고르세요.",
      choices: [
        { id: "a", text: "pending" },
        { id: "b", text: "fulfilled" },
        { id: "c", text: "rejected" },
        { id: "d", text: "running" },
      ],
    },
    answer: {
      type: "MULTIPLE_CHOICE",
      choiceIds: ["a", "b", "c"],
    },
    explanation: "running 같은 상태는 없습니다.",
    hashtagIds: ["javascript"],
  },
  {
    title: "CORS",
    question: {
      type: "SINGLE_CHOICE",
      prompt:
        "브라우저가 다른 출처로의 요청을 제한하는 보안 정책 이름은?",
      choices: [
        { id: "a", text: "동일 출처 정책" },
        { id: "b", text: "쿠키 정책" },
        { id: "c", text: "캐시 정책" },
      ],
    },
    answer: { type: "SINGLE_CHOICE", choiceId: "a" },
    explanation:
      "서버가 CORS 헤더로 허용 출처를 알려 줍니다.",
    hashtagIds: ["web"],
  },
  {
    title: "HTTP 메서드",
    question: {
      type: "SHORT_ANSWER",
      prompt:
        "리소스의 일부만 수정할 때 사용하는 HTTP 메서드는?",
    },
    answer: { type: "SHORT_ANSWER", text: "PATCH" },
    explanation: "PUT은 전체 교체에 사용합니다.",
    hashtagIds: ["web"],
  },
  {
    title: "String 불변성",
    question: {
      type: "TRUE_FALSE",
      prompt:
        "Java의 String 객체는 한 번 만들어지면 내용을 바꿀 수 없다.",
    },
    answer: { type: "TRUE_FALSE", value: true },
    explanation: "문자열 연산은 새 객체를 반환합니다.",
    hashtagIds: ["java"],
  },
  {
    title: "유니온 타입",
    question: {
      type: "MULTIPLE_CHOICE",
      prompt:
        "유니온 타입 string | number에 대해 옳은 설명을 모두 고르세요.",
      choices: [
        { id: "a", text: "string 값을 대입할 수 있다" },
        { id: "b", text: "number 값을 대입할 수 있다" },
        { id: "c", text: "boolean 값을 대입할 수 있다" },
      ],
    },
    answer: {
      type: "MULTIPLE_CHOICE",
      choiceIds: ["a", "b"],
    },
    explanation:
      "유니온은 나열한 타입 중 하나를 허용합니다.",
    hashtagIds: ["typescript"],
  },
  {
    title: "이벤트 루프",
    question: {
      type: "SHORT_ANSWER",
      prompt:
        "콜 스택이 비면 큐의 콜백을 실행하는 JavaScript 런타임의 구성 요소는?",
    },
    answer: { type: "SHORT_ANSWER", text: "이벤트 루프" },
    explanation: "이벤트 루프가 큐를 확인합니다.",
    hashtagIds: ["javascript"],
  },
];

const seedQuiz = (
  content: QuizContent,
  index: number,
  ownerUserId: string,
  status: QuizStatus = QuizStatus.PUBLIC,
): ReviewQuiz => ({
  quizId: `seed-quiz-${index + 1}`,
  ownerUserId,
  status,
  version: 1,
  active: {
    ...content,
    revisionId: `seed-revision-${index + 1}`,
    sourceContent: "Mock 학습 자료",
    reviewed: true,
  },
  pending: null,
  publishedAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

export const quizzes: readonly ReviewQuiz[] =
  generatedContents.map((content, index) =>
    seedQuiz(
      content,
      index,
      index < 2 ? "author" : "friend",
    ),
  );

/** Optional demo fixtures (see applyHistoryDemo): the learner's own private quizzes, kept out of the default catalog. */
export const historyDemoQuizzes: readonly ReviewQuiz[] =
  historyDemoContents.map((content, index) =>
    seedQuiz(
      content,
      generatedContents.length + index,
      "learner",
      QuizStatus.PRIVATE,
    ),
  );
