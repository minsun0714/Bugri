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
import { DiscoverySearch } from "@/components/solving/discovery-search";
import { Bugri } from "@/components/ui/bugri";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

beforeEach(() => localStorage.clear());

it("finds developers and all registered tags without subscribing on search", async () => {
  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );
  const learn = jest.fn();
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false } },
        })
      }
    >
      <DiscoverySearch userId="friend" onLearn={learn} />
    </QueryClientProvider>,
  );
  const input = screen.getByRole("searchbox", {
    name: "개발자 또는 태그 검색",
  });
  fireEvent.change(input, { target: { value: "JAVA" } });
  expect(
    await screen.findByText("Java", { exact: true }),
  ).toBeVisible();
  expect(await api.request("subscriptions", {})).toEqual(
    [],
  );
  fireEvent.change(input, {
    target: { value: "타입 개발자" },
  });
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
