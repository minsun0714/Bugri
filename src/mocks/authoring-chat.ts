import type { AuthoringMessage } from "@/api/contracts";

/** Canned local replies for conversation UX; no AI provider or code execution. */
export function mockAuthoringReply(
  messages: AuthoringMessage[],
  content: string,
) {
  const context = [
    ...messages.map((message) => message.content),
    content,
  ]
    .join("\n")
    .toLowerCase();

  if (
    context.includes("클로저") ||
    context.includes("closure")
  )
    return "클로저는 함수가 선언된 환경의 변수를 기억하는 성질이에요. 바깥 함수의 실행이 끝난 뒤에도 안쪽 함수가 그 변수에 접근할 수 있습니다.\n\n```javascript\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = counter();\nnext(); // 1\nnext(); // 2\n```\n\n각 counter() 호출은 독립적인 count를 갖습니다.";

  if (context.includes("http"))
    return "HTTP는 클라이언트가 요청을 보내고 서버가 응답하는 통신 규약이에요. 요청에는 메서드·경로·헤더가, 응답에는 상태 코드·헤더·본문이 들어갈 수 있습니다.\n\n예를 들어 `GET /quizzes`에 `200 OK`와 퀴즈 목록으로 응답할 수 있어요.";

  if (
    context.includes("타입") ||
    context.includes("typescript")
  )
    return "TypeScript는 값의 타입을 검사해 실행 전에 일부 오류를 찾도록 도와줍니다.\n\n```typescript\nconst count: number = 1;\nconst label: string = 'quiz';\n```\n\n타입 검사는 실제 실행 중 입력 검증을 대신하지 않습니다.";

  return "예시 답변입니다. 학습 내용을 개념·동작 원리·코드 예시로 나누면 이해를 확인하기 좋아요. 궁금한 부분을 더 질문하거나, 대화를 바탕으로 퀴즈를 만들어 볼 수 있습니다.";
}
