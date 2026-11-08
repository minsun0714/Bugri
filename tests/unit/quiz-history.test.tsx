import type { ReactNode } from "react";
jest.mock("@/components/solving/quiz-text", () => ({
  QuizText: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { HistoryScreen } from "@/components/learning-history/history-screen";
import { QuizPanel } from "@/components/solving/quiz-panel";
import { useAttemptHistory } from "@/components/learning-history/queries";

jest.mock("@/components/learning-history/queries", () => ({
  useAttemptHistory: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams("user=learner"),
  useRouter: () => ({ push: jest.fn() }),
}));

const history = jest.mocked(useAttemptHistory);

test("pending history shows common loading state and no invented records", () => {
  history.mockReturnValue({ isPending: true } as ReturnType<
    typeof useAttemptHistory
  >);
  render(<HistoryScreen />);
  expect(
    screen.getByRole("status", { name: "불러오는 중" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("list", { name: "풀이 내역" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "풀이 내역" }),
  ).toBeVisible();
});

test("query failure offers explicit retry", () => {
  const refetch = jest.fn();
  history.mockReturnValue({
    isPending: false,
    error: new Error("offline"),
    refetch,
  } as unknown as ReturnType<typeof useAttemptHistory>);
  render(<HistoryScreen />);
  expect(screen.getByRole("alert")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "다시 시도" }),
  );
  expect(refetch).toHaveBeenCalledTimes(1);
});

test("legacy result displays missing fields without a submission form", () => {
  render(
    <QuizPanel
      quiz={{
        quizId: "q",
        ownerUserId: "author",
        revisionId: "r",
        title: "",
        question: {
          type: "TRUE_FALSE",
          prompt: "Saved question",
        },
        hashtagIds: [],
      }}
      result={{
        correct: true,
        answer: null,
        explanation: null,
        submittedAnswer: null,
      }}
      completedAt="2026-11-08T12:00:00Z"
      correct
      focusKey="old"
      pending={false}
      onSubmit={jest.fn()}
    />,
  );
  expect(screen.getAllByText(/기록 없음/)).toHaveLength(3);
  expect(
    screen.getByText("이용할 수 없는 퀴즈"),
  ).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "답 제출" }),
  ).not.toBeInTheDocument();
});
