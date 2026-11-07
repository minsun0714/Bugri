import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { SubscriptionControl } from "@/components/discovery/subscription-control";
import { useDiscovery } from "@/components/discovery/queries";
import { DiscoveryKind } from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

function Harness({
  signedIn = true,
  login = jest.fn(),
}: {
  signedIn?: boolean;
  login?: (trigger: HTMLElement) => void;
}) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Control signedIn={signedIn} login={login} />
    </QueryClientProvider>
  );
}

function Control({
  signedIn,
  login,
}: {
  signedIn: boolean;
  login: (trigger: HTMLElement) => void;
}) {
  const { discovery } = useDiscovery("friend", {
    kind: DiscoveryKind.USER,
    query: "author",
    page: 1,
    pageSize: 20,
  });
  const [item] = discovery.data?.items ?? [];
  if (!item) return null;
  return (
    <SubscriptionControl
      name="타입 개발자"
      userId="friend"
      target={{ type: "PERSON", authorUserId: "author" }}
      subscribed={item.subscribed}
      signedIn={signedIn}
      onLogin={login}
      onSuccess={() => {}}
    />
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

it("requests login without writing a guest subscription", async () => {
  const login = jest.fn();
  render(<Harness signedIn={false} login={login} />);
  const button = await screen.findByRole("button", {
    name: "타입 개발자 구독하기",
  });
  fireEvent.click(button);
  expect(login).toHaveBeenCalledWith(button);
  const api = createApiClient(
    createMockTransport({
      userId: "friend",
      storage: localStorage,
    }),
  );
  expect(await api.request("subscriptions", {})).toEqual(
    [],
  );
});

it("preserves the subscription on failed save and allows retry", async () => {
  render(<Harness />);
  const button = await screen.findByRole("button", {
    name: "타입 개발자 구독하기",
  });
  const write = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("quota");
    });
  fireEvent.click(button);
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("기존 상태는 유지됩니다");
  expect(button).toHaveAccessibleName(
    "타입 개발자 구독하기",
  );
  write.mockRestore();
  fireEvent.click(button);
  await waitFor(() =>
    expect(button).toHaveAccessibleName(
      "타입 개발자 구독 중 · 관리",
    ),
  );
  fireEvent.click(button);
  const remove = screen.getByRole("button", {
    name: "타입 개발자 구독 해제",
  });
  remove.focus();
  fireEvent.click(remove);
  await waitFor(() =>
    expect(button).toHaveAccessibleName(
      "타입 개발자 구독하기",
    ),
  );
  await waitFor(() => expect(button).toHaveFocus());
});
