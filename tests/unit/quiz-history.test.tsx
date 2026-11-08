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
const push = jest.fn();
let search = "user=learner";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => ({ push }),
}));

const history = jest.mocked(useAttemptHistory);

beforeEach(() => {
  push.mockClear();
  search = "user=learner";
});

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

test("search submits a trimmed query to the URL, resets to page 1 and keeps the filter", () => {
  search = "user=learner&filter=CORRECT&page=3";
  history.mockReturnValue({ isPending: true } as ReturnType<
    typeof useAttemptHistory
  >);

  render(<HistoryScreen />);

  fireEvent.change(
    screen.getByRole("searchbox", {
      name: "풀이 내역 검색",
    }),
    { target: { value: "  클로저  " } },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "검색" }),
  );

  expect(push).toHaveBeenCalledTimes(1);

  const [href] = push.mock.calls[0];
  const params = new URL(href, "http://x").searchParams;

  expect(params.get("query")).toBe("클로저");
  expect(params.get("filter")).toBe("CORRECT");
  expect(params.get("page")).toBe("1");
  expect(params.get("user")).toBe("learner");
});

test("the URL query is passed to the history query and highlighted with a body excerpt", () => {
  search = "user=learner&query=identity";

  history.mockReturnValue({
    isPending: false,
    data: {
      items: [
        {
          attemptId: "a1",
          title: "제네릭 기본",
          correct: true,
          completedAt: "2026-11-06T09:12:00.000Z",
          matchedIn: "BODY",
          excerpt: "…function identity<T>(value: T)…",
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    },
  } as unknown as ReturnType<typeof useAttemptHistory>);

  render(<HistoryScreen />);

  expect(history).toHaveBeenLastCalledWith(
    "learner",
    "ALL",
    1,
    "identity",
  );

  expect(screen.getByText("identity")).toHaveProperty(
    "tagName",
    "MARK",
  );

  expect(
    screen.getByRole("link", { name: /제네릭 기본/ }),
  ).toHaveAttribute(
    "href",
    expect.stringContaining("query=identity"),
  );
});

test("no search match explains the query and clears it", () => {
  search = "user=learner&query=zzz";

  history.mockReturnValue({
    isPending: false,
    data: { items: [], page: 1, pageSize: 20, total: 0 },
  } as unknown as ReturnType<typeof useAttemptHistory>);

  render(<HistoryScreen />);

  expect(
    screen.getByText("“zzz”와 일치하는 풀이가 없어요"),
  ).toBeVisible();

  fireEvent.click(
    screen.getAllByRole("button", {
      name: "검색 초기화",
    })[1],
  );

  const [href] = push.mock.calls[0];

  expect(
    new URL(href, "http://x").searchParams.has("query"),
  ).toBe(false);
});

test("a query over 100 characters is not submitted", () => {
  history.mockReturnValue({ isPending: true } as ReturnType<
    typeof useAttemptHistory
  >);

  render(<HistoryScreen />);

  fireEvent.change(
    screen.getByRole("searchbox", {
      name: "풀이 내역 검색",
    }),
    { target: { value: "a".repeat(101) } },
  );

  expect(
    screen.getByText("검색어는 100자 이하여야 합니다."),
  ).toBeVisible();

  expect(
    screen.getByRole("button", { name: "검색" }),
  ).toBeDisabled();
});
