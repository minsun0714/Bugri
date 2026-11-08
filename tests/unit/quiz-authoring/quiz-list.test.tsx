import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  QuizStatus,
  type QuizSummary,
} from "@/api/contracts";
import {
  QuizList,
  QuizListFilter,
  QuizListSort,
  type QuizListView,
} from "@/features/quiz-authoring/quiz-list";

const quizzes: QuizSummary[] = [
  {
    quizId: "pending",
    ownerUserId: "learner",
    title: "타입 선언",
    status: QuizStatus.PENDING,
    hashtagIds: ["typescript"],
    updatedAt: "2026-11-07T05:00:00.000Z",
    hasPendingRevision: true,
  },
  {
    quizId: "public",
    ownerUserId: "learner",
    title: "HTTP 상태 코드",
    status: QuizStatus.PUBLIC,
    hashtagIds: ["web"],
    updatedAt: "2026-11-07T04:00:00.000Z",
    hasPendingRevision: false,
  },
  {
    quizId: "private",
    ownerUserId: "learner",
    title: "블록 스코프",
    status: QuizStatus.PRIVATE,
    hashtagIds: ["javascript"],
    updatedAt: "2026-11-07T03:00:00.000Z",
    hasPendingRevision: false,
  },
];

function renderList(
  overrides: Partial<QuizListView> = {},
  items = quizzes,
) {
  const onViewChange = jest.fn();
  const onOpen = jest.fn();
  const view: QuizListView = {
    query: "",
    filter: QuizListFilter.ALL,
    sort: QuizListSort.NEWEST,
    page: 1,
    ...overrides,
  };

  render(
    <QuizList
      quizzes={items}
      view={view}
      createHref="/quizzes/authoring?user=learner"
      isFetching={false}
      busy={false}
      onViewChange={onViewChange}
      onOpen={onOpen}
      onRefresh={jest.fn()}
    />,
  );

  return { onViewChange, onOpen };
}

test("summarizes and localizes quiz states without exposing wire values", () => {
  renderList();

  expect(
    screen.getByRole("heading", { name: "내 퀴즈 3" }),
  ).toBeVisible();
  expect(
    screen.getByRole("tab", { name: "전체 3" }),
  ).toBeVisible();
  expect(
    screen.getByRole("tab", { name: "검토 필요 1" }),
  ).toBeVisible();
  expect(
    screen.getByRole("tab", { name: "공개 1" }),
  ).toBeVisible();
  expect(
    screen.getByRole("tab", { name: "나만 보기 1" }),
  ).toBeVisible();
  expect(
    screen.getByText("검토 필요", { exact: true }),
  ).toBeVisible();
  expect(
    screen.getByText("공개 중", { exact: true }),
  ).toBeVisible();
  expect(
    screen.getByText("나만 보기", { exact: true }),
  ).toBeVisible();
  expect(
    screen.queryByText("PENDING"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByText("PUBLIC"),
  ).not.toBeInTheDocument();
});

test("exposes search, status, sorting and compact row navigation", () => {
  const { onViewChange, onOpen } = renderList();

  fireEvent.change(
    screen.getByRole("searchbox", { name: "퀴즈 검색" }),
    { target: { value: "http" } },
  );
  expect(onViewChange).toHaveBeenCalledWith({
    query: "http",
    page: 1,
  });

  fireEvent.click(
    screen.getByRole("tab", { name: "검토 필요 1" }),
  );
  expect(onViewChange).toHaveBeenCalledWith({
    filter: QuizListFilter.NEEDS_REVIEW,
    page: 1,
  });

  fireEvent.click(
    screen.getByRole("combobox", { name: "정렬" }),
  );
  fireEvent.click(
    screen.getByRole("option", { name: "제목순" }),
  );
  expect(onViewChange).toHaveBeenCalledWith({
    sort: QuizListSort.TITLE,
    page: 1,
  });

  const item = screen.getByRole("article", {
    name: "타입 선언",
  });
  expect(
    within(item).getByText("#typescript"),
  ).toBeVisible();
  fireEvent.click(
    within(item).getByRole("button", {
      name: "타입 선언 검토하기",
    }),
  );
  expect(onOpen).toHaveBeenCalledWith("pending");
});

test("filters visible rows and paginates long lists", () => {
  const manyQuizzes = Array.from(
    { length: 11 },
    (_, index) => ({
      ...quizzes[1],
      quizId: `quiz-${index}`,
      title: `HTTP ${String(index + 1).padStart(2, "0")}`,
    }),
  );
  const onViewChange = jest.fn();

  render(
    <QuizList
      quizzes={manyQuizzes}
      view={{
        query: "",
        filter: QuizListFilter.ALL,
        sort: QuizListSort.NEWEST,
        page: 1,
      }}
      createHref="/quizzes/authoring"
      isFetching={false}
      busy={false}
      onViewChange={onViewChange}
      onOpen={jest.fn()}
      onRefresh={jest.fn()}
    />,
  );

  expect(screen.getAllByRole("article")).toHaveLength(10);
  expect(
    screen.getByRole("navigation", {
      name: "퀴즈 목록 페이지",
    }),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "2페이지" }),
  );
  expect(onViewChange).toHaveBeenCalledWith({ page: 2 });
});

test("shows a focused empty state for filters with no matches", () => {
  renderList({ query: "없는 제목" });

  expect(
    screen.getByText("조건에 맞는 퀴즈가 없습니다"),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: "검색과 필터 초기화",
    }),
  ).toBeVisible();
});

test.each([{ items: quizzes }, { items: [] }])(
  "keeps one creation link for populated and empty lists (%#)",
  ({ items }) => {
    renderList({}, items);

    const links = screen.getAllByRole("link", {
      name: /퀴즈 만들기/,
    });

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute(
      "href",
      "/quizzes/authoring?user=learner",
    );
  },
);

test("public management cards expose independent reaction controls", () => {
  const onOpen = jest.fn();
  render(
    <QuizList
      quizzes={quizzes}
      view={{
        query: "",
        filter: QuizListFilter.ALL,
        sort: QuizListSort.NEWEST,
        page: 1,
      }}
      createHref="/quizzes/authoring?user=learner"
      isFetching={false}
      busy={false}
      onViewChange={jest.fn()}
      onOpen={onOpen}
      onRefresh={jest.fn()}
      renderReaction={(quizId) => (
        <button aria-label={`${quizId} 좋아요`}>0</button>
      )}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "public 좋아요" }),
  );
  expect(onOpen).not.toHaveBeenCalled();
  expect(
    screen.queryByRole("button", {
      name: "pending 좋아요",
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", {
      name: "private 좋아요",
    }),
  ).not.toBeInTheDocument();
});
