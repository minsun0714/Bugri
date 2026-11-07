import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { DiscoverySearch } from "@/components/discovery/search-results";
import { useState } from "react";
import { DiscoveryKind } from "@/api/constants";
import type { DiscoveryQuery } from "@/api/contracts";
import { Bugri } from "@/components/ui/bugri";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

function Harness({
  onLearn,
  pageSize = 20,
  kind = DiscoveryKind.USER,
}: {
  onLearn: (tag: string | null) => void;
  pageSize?: number;
  kind?: DiscoveryQuery["kind"];
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  );
  const [request, setRequest] = useState<DiscoveryQuery>({
    kind,
    query: "",
    page: 1,
    pageSize,
  });

  return (
    <QueryClientProvider client={client}>
      <DiscoverySearch
        userId="friend"
        request={request}
        onSearch={setRequest}
        onLearn={onLearn}
      />
    </QueryClientProvider>
  );
}

beforeEach(() => localStorage.clear());

it("finds developers and all registered tags without subscribing on search", async () => {
  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );
  const learn = jest.fn();
  const { rerender } = render(
    <Harness
      kind={DiscoveryKind.HASHTAG}
      onLearn={learn}
    />,
  );
  const input = screen.getByRole("searchbox", {
    name: "태그 검색",
  });
  fireEvent.change(input, { target: { value: "JAVA" } });
  fireEvent.click(
    screen.getByRole("button", {
      name: "검색",
    }),
  );
  expect(
    await screen.findByText("Java", { exact: true }),
  ).toBeVisible();
  expect(await api.request("subscriptions", {})).toEqual(
    [],
  );
  rerender(<Harness key="developers" onLearn={learn} />);
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "타입 개발자" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: "검색",
    }),
  );
  expect(
    await screen.findByText("타입 개발자", { exact: true }),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "타입 개발자" }),
  ).toHaveAttribute(
    "href",
    "/developers/bugri-author/quizzes?user=friend",
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "타입 개발자 구독하기",
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "타입 개발자 구독 메뉴",
      }),
    ).toBeEnabled(),
  );
  expect(
    screen.queryByRole("button", {
      name: "타입 개발자 구독 해제",
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByText("타입 개발자님을 구독했습니다."),
  ).toBeVisible();
  expect(learn).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "타입 개발자 학습하기",
    }),
  );
  expect(learn).toHaveBeenCalledWith(null);
  expect(await api.request("subscriptions", {})).toEqual([
    expect.objectContaining({
      type: "PERSON",
      authorUserId: "author",
    }),
  ]);
  fireEvent.click(
    screen.getByRole("button", {
      name: "타입 개발자 구독 메뉴",
    }),
  );
  fireEvent.click(
    screen.getByRole("menuitem", {
      name: "구독 해제",
    }),
  );
  await waitFor(async () =>
    expect(await api.request("subscriptions", {})).toEqual(
      [],
    ),
  );
  expect(
    screen.getByText("타입 개발자님 구독을 취소했습니다."),
  ).toBeVisible();
});

it("displays a character with distinct happy and encouraging expressions", () => {
  const { rerender } = render(<Bugri mood="happy" />);
  expect(
    screen.getByRole("img", { name: "기쁜 버그리" }),
  ).toBeVisible();
  rerender(<Bugri mood="encouraging" />);
  expect(
    screen.getByRole("img", { name: "응원하는 버그리" }),
  ).toBeVisible();
});

it("renders only one requested page and navigates with bounded controls", async () => {
  render(<Harness onLearn={jest.fn()} pageSize={1} />);
  expect(
    await screen.findByText("타입 개발자", { exact: true }),
  ).toBeVisible();
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(
    screen.getByRole("button", { name: "이전 페이지" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "다음 페이지" }),
  );
  expect(
    await screen.findByText("웹 개발자", { exact: true }),
  ).toBeVisible();
  expect(
    screen.queryByText("타입 개발자", { exact: true }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("button", { name: "다음 페이지" }),
  );
  expect(
    await screen.findByText("학습자", { exact: true }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "다음 페이지" }),
  ).toBeDisabled();
});

it("hides pagination when all results fit on one page", async () => {
  render(<Harness onLearn={jest.fn()} />);

  expect(
    await screen.findByText("타입 개발자", { exact: true }),
  ).toBeVisible();
  expect(
    screen.queryByRole("navigation", {
      name: "검색 결과 페이지",
    }),
  ).not.toBeInTheDocument();
});

it("adds multiple tags without navigating or losing the current search", async () => {
  const learn = jest.fn();
  render(
    <Harness
      kind={DiscoveryKind.HASHTAG}
      onLearn={learn}
    />,
  );
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "Java" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "검색" }),
  );
  fireEvent.click(
    await screen.findByRole("button", {
      name: "Java 구독하기",
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "Java 구독 메뉴",
      }),
    ).toBeEnabled(),
  );
  expect(
    screen.getByText("Java 태그를 구독했습니다."),
  ).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", {
      name: "JavaScript 구독하기",
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "JavaScript 구독 메뉴",
      }),
    ).toBeEnabled(),
  );
  expect(screen.getByRole("searchbox")).toHaveValue("Java");
  expect(learn).not.toHaveBeenCalled();
  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );
  expect(
    await api.request("subscriptions", {}),
  ).toHaveLength(2);
});

it("shows only the requested search kind without internal tabs", async () => {
  render(
    <Harness
      kind={DiscoveryKind.HASHTAG}
      onLearn={jest.fn()}
    />,
  );
  expect(
    await screen.findByRole("region", {
      name: "태그 검색 결과",
    }),
  ).toBeVisible();
  expect(
    screen.queryByRole("tablist"),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("searchbox", { name: "태그 검색" }),
  ).toBeVisible();
});
