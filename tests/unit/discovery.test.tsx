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
}: {
  onLearn: (tag: string | null) => void;
  pageSize?: number;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  );
  const [request, setRequest] = useState<DiscoveryQuery>({
    kind: DiscoveryKind.USER,
    query: "",
    page: 1,
    pageSize,
  });

  return (
    <QueryClientProvider client={client}>
      <DiscoverySearch
        key={JSON.stringify(request)}
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
  render(<Harness onLearn={learn} />);
  fireEvent.click(
    screen.getByRole("button", {
      name: "태그",
    }),
  );
  const input = screen.getByRole("searchbox", {
    name: "개발자 또는 태그 검색",
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
  fireEvent.click(
    screen.getByRole("button", {
      name: "개발자",
    }),
  );
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
  fireEvent.click(
    screen.getByRole("button", {
      name: "타입 개발자 구독하고 학습하기",
    }),
  );
  await waitFor(() =>
    expect(learn).toHaveBeenCalledWith(null),
  );
  expect(await api.request("subscriptions", {})).toEqual([
    expect.objectContaining({
      type: "PERSON",
      authorUserId: "author",
    }),
  ]);
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
