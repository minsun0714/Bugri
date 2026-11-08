import { StrictMode } from "react";
import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import { QuizPanel } from "@/components/solving/quiz-panel";
import type { LearningQuizView } from "@/api/contracts";
jest.mock("@/components/solving/quiz-text", () => ({
  QuizText: ({ children }: { children: string }) => (
    <div>{children}</div>
  ),
}));
const quiz: LearningQuizView = {
  quizId: "q",
  revisionId: "r",
  ownerUserId: "author",
  title: "문제 제목",
  hashtagIds: [],
  question: { type: "TRUE_FALSE", prompt: "질문" },
};
test("new question and grading results receive focus; failed submission keeps the answer", () => {
  const onSubmit = jest.fn();
  const { rerender } = render(
    <QuizPanel
      quiz={quiz}
      result={null}
      focusKey="1"
      pending={false}
      onSubmit={onSubmit}
    />,
  );
  expect(screen.getByLabelText("문제 제목")).toHaveFocus();
  fireEvent.click(screen.getByLabelText("참"));
  fireEvent.click(
    screen.getByRole("button", { name: "답 제출" }),
  );
  rerender(
    <QuizPanel
      quiz={quiz}
      result={null}
      focusKey="1"
      pending={false}
      onSubmit={onSubmit}
    />,
  );
  expect(screen.getByLabelText("참")).toBeChecked();
  rerender(
    <QuizPanel
      quiz={{ ...quiz, title: "다음 제목" }}
      result={null}
      focusKey="2"
      pending={false}
      onSubmit={onSubmit}
    />,
  );
  expect(screen.getByLabelText("다음 제목")).toHaveFocus();
  expect(screen.getByLabelText("참")).not.toBeChecked();
  rerender(
    <QuizPanel
      quiz={quiz}
      result={{
        submittedAnswer: {
          type: "TRUE_FALSE",
          value: true,
        },
        answer: { type: "TRUE_FALSE", value: true },
        correct: true,
        explanation: "해설 내용",
      }}
      focusKey="2"
      pending={false}
      onSubmit={onSubmit}
    />,
  );
  expect(screen.getByLabelText("정답입니다")).toHaveFocus();
  expect(screen.getByText("해설 내용")).toBeVisible();
});

test("a late initial quiz does not steal focus from a control the visitor is already using", () => {
  const trigger = document.createElement("button");
  trigger.textContent = "데모 사용자 선택";
  document.body.append(trigger);
  trigger.focus();
  render(
    <StrictMode>
      <QuizPanel
        quiz={quiz}
        result={null}
        focusKey="late"
        pending={false}
        onSubmit={jest.fn()}
      />
    </StrictMode>,
  );
  expect(trigger).toHaveFocus();
  trigger.remove();
});

test.each([
  [true, "축하하는 버그리"],
  [false, "응원하는 버그리"],
] as const)(
  "grading %s shows the matching Bugri reaction",
  (correct, label) => {
    render(
      <QuizPanel
        quiz={quiz}
        result={{
          submittedAnswer: {
            type: "TRUE_FALSE",
            value: correct,
          },
          answer: { type: "TRUE_FALSE", value: true },
          correct,
          explanation: "해설 내용",
        }}
        focusKey="reaction"
        pending={false}
        onSubmit={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("img", { name: label }),
    ).toBeVisible();
  },
);

test("completed member attempt displays credited coins and history link", () => {
  render(
    <QuizPanel
      quiz={quiz}
      result={null}
      completedAt="2026-02-01T00:00:00Z"
      correct={true}
      rewardBugCent={150}
      rewardHistoryHref="/coin-history?user=learner"
      focusKey="reward"
      pending={false}
      onSubmit={() => {}}
    />,
  );
  expect(screen.getByText("+1.50 BugCoin")).toBeVisible();
  expect(
    screen.getByRole("link", { name: "내역 보기" }),
  ).toHaveAttribute("href", "/coin-history?user=learner");
});
