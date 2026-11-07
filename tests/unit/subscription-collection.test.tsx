import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  SubscriptionCollection,
  type SubscriptionEntry,
} from "@/components/discovery/subscription-collection";

jest.mock(
  "@/components/discovery/subscription-control",
  () => ({
    SubscriptionControl: () => <button>구독 관리</button>,
  }),
);

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

const entries: SubscriptionEntry[] = Array.from(
  { length: 1000 },
  (_, index) => ({
    subscription: {
      type: "PERSON",
      subscriptionId: `sub-${index}`,
      authorUserId: `user-${index}`,
    },
    name: `개발자 ${index}`,
    searchText: `개발자 ${index} handle-${index}`,
    href: `/users/handle-${index}?user=learner`,
  }),
);

function show(items = entries) {
  return render(
    <SubscriptionCollection
      entries={items}
      userId="learner"
      onSuccess={() => {}}
      onPreviewRemoved={() => {}}
    />,
  );
}

it("limits 1000 subscriptions to three previews and twenty modal rows; filters and resets pagination", () => {
  show();
  expect(screen.getAllByRole("link")).toHaveLength(3);
  fireEvent.click(
    screen.getByRole("button", { name: "전체 보기" }),
  );
  const dialog = within(
    screen.getByRole("dialog", { name: "내 구독" }),
  );
  expect(dialog.getAllByRole("link")).toHaveLength(20);
  expect(dialog.getByText("1 / 50")).toBeInTheDocument();
  fireEvent.click(
    dialog.getByRole("button", { name: "다음" }),
  );
  expect(
    dialog.getByRole("link", {
      name: "개발자 20",
    }),
  ).toBeInTheDocument();
  fireEvent.change(
    dialog.getByRole("searchbox", { name: "내 구독 검색" }),
    { target: { value: "@handle-999" } },
  );
  expect(dialog.getAllByRole("link")).toHaveLength(1);
  expect(
    dialog.getByRole("link", { name: "개발자 999" }),
  ).toBeInTheDocument();
  expect(dialog.getByText("1 / 1")).toBeInTheDocument();
  fireEvent.click(
    dialog.getByRole("button", {
      name: "태그",
    }),
  );
  expect(
    dialog.getByText("검색 조건에 맞는 구독이 없습니다."),
  ).toBeInTheDocument();
  fireEvent.click(
    dialog.getByRole("button", { name: "조건 초기화" }),
  );
  expect(dialog.getAllByRole("link")).toHaveLength(20);
});

it("clamps the page when the last subscription on it is removed", () => {
  const view = show(entries.slice(0, 21));
  fireEvent.click(
    screen.getByRole("button", { name: "전체 보기" }),
  );
  const dialog = within(
    screen.getByRole("dialog", { name: "내 구독" }),
  );
  fireEvent.click(
    dialog.getByRole("button", { name: "다음" }),
  );
  view.rerender(
    <SubscriptionCollection
      entries={entries.slice(0, 20)}
      userId="learner"
      onSuccess={() => {}}
      onPreviewRemoved={() => {}}
    />,
  );
  expect(dialog.getByText("1 / 1")).toBeInTheDocument();
  expect(dialog.getAllByRole("link")).toHaveLength(20);
});
