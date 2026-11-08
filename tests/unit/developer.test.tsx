import { DemoSessionProvider } from "@/components/navigation/demo-session";
import { createBrowserApi } from "@/api/browser";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DeveloperScreen } from "@/components/developer/developer-screen";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => (
    <div>{children}</div>
  ),
}));
jest.mock("rehype-highlight", () => ({
  __esModule: true,
  default: () => {},
}));
const push = jest.fn();
let mockSearch = "user=friend";
jest.mock("next/navigation", () => ({
  usePathname: () => "/users/bugri-author",
  useParams: () => ({ publicId: "bugri-author" }),
  useSearchParams: () => new URLSearchParams(mockSearch),
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  mockSearch = "user=friend";
  window.matchMedia = jest.fn().mockReturnValue({
    matches: true,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  HTMLDialogElement.prototype.show = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

test("catalog filters do not subscribe and independent panel stays open while saving", async () => {
  render(
    <DemoSessionProvider>
      <DeveloperScreen />
    </DemoSessionProvider>,
  );
  await screen.findByRole("heading", {
    name: "타입 개발자의 퀴즈",
  });
  fireEvent.click(
    await screen.findByRole("button", {
      name: "TypeScript (1)",
    }),
  );
  expect(push).toHaveBeenCalledWith(
    "/developers/bugri-author/quizzes?user=friend&page=1&tag=typescript",
    { scroll: false },
  );
  const api = await createBrowserApi({
    mode: "mock",
    userId: "friend",
  });
  expect(await api.request("subscriptions", {})).toEqual(
    [],
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "구독 설정",
    }),
  );
  const toggle = await screen.findByRole("switch", {
    name: "TypeScript 구독",
  });
  fireEvent.click(toggle);
  await waitFor(() =>
    expect(toggle).toHaveAttribute("aria-checked", "true"),
  );
  expect(
    screen.getByRole("dialog", { name: "구독 설정" }),
  ).toBeVisible();
  expect(await api.request("subscriptions", {})).toEqual([
    expect.objectContaining({
      type: "PERSON_HASHTAG",
      hashtagId: "typescript",
      authorUserId: "author",
    }),
  ]);
  fireEvent.click(toggle);
  await waitFor(() =>
    expect(toggle).toHaveAttribute("aria-checked", "false"),
  );
  expect(push).toHaveBeenCalledTimes(1);
});

test("multiple URL tags restore union and clicking a selected tag removes only that filter", async () => {
  mockSearch = "user=friend&tag=typescript&tag=web";
  render(
    <DemoSessionProvider>
      <DeveloperScreen />
    </DemoSessionProvider>,
  );
  expect(
    await screen.findByRole("link", { name: "타입 선언" }),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "블록 스코프" }),
  ).toBeVisible();
  const tag = await screen.findByRole("button", {
    name: "TypeScript (1)",
  });
  expect(tag).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(tag);
  expect(push).toHaveBeenCalledWith(
    "/developers/bugri-author/quizzes?user=friend&page=1&tag=web",
    { scroll: false },
  );
});

test("public profile requires explicit demo selection and a separate subscription action", async () => {
  mockSearch = "";
  const api = await createBrowserApi({
    mode: "mock",
    userId: "friend",
  });
  const before = await api.request("subscriptions", {});
  const { rerender } = render(
    <DemoSessionProvider>
      <DeveloperScreen profile />
    </DemoSessionProvider>,
  );
  expect(
    await screen.findByRole("heading", {
      name: "@bugri-author",
    }),
  ).toBeVisible();
  expect(
    screen.queryByRole("searchbox"),
  ).not.toBeInTheDocument();
  expect(
    await screen.findByRole("link", {
      name: "전체 보기",
    }),
  ).toHaveAttribute(
    "href",
    "/developers/bugri-author/quizzes?user=learner",
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "구독하기",
    }),
  );
  expect(await api.request("subscriptions", {})).toEqual(
    before,
  );
  fireEvent.click(
    screen.getByRole("combobox", { name: "더미 사용자" }),
  );
  fireEvent.click(
    screen.getByRole("option", {
      name: /^친구$/,
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "선택한 사용자로 시작",
    }),
  );
  expect(push).toHaveBeenCalledWith(
    "/users/bugri-author?user=friend",
  );
  expect(await api.request("subscriptions", {})).toEqual(
    before,
  );
  mockSearch = "user=friend";
  rerender(
    <DemoSessionProvider>
      <DeveloperScreen profile />
    </DemoSessionProvider>,
  );
  fireEvent.click(
    await screen.findByRole("button", {
      name: "타입 개발자 구독하기",
    }),
  );
  expect(
    await screen.findByRole("button", {
      name: "타입 개발자 구독 중 · 관리",
    }),
  ).toBeVisible();
});

test("profile subscribed control opens management before explicit unsubscribe", async () => {
  const api = await createBrowserApi({
    mode: "mock",
    userId: "friend",
  });
  await api.request("subscribe", {
    type: "PERSON",
    authorUserId: "author",
  });
  render(
    <DemoSessionProvider>
      <DeveloperScreen profile />
    </DemoSessionProvider>,
  );
  const control = await screen.findByRole("button", {
    name: "타입 개발자 구독 중 · 관리",
  });
  const before = await api.request("subscriptions", {});
  fireEvent.click(control);
  expect(control).toHaveAttribute("aria-expanded", "true");
  expect(await api.request("subscriptions", {})).toEqual(
    before,
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "타입 개발자 구독 해제",
    }),
  );
  expect(
    await screen.findByRole("button", {
      name: "타입 개발자 구독하기",
    }),
  ).toBeVisible();
  expect(
    (await api.request("subscriptions", {})).some(
      (item) =>
        item.type === "PERSON" &&
        item.authorUserId === "author",
    ),
  ).toBe(false);
});

test("all tags remain visible without search or paging even with a legacy URL", async () => {
  mockSearch =
    "user=friend&tagQuery=web&tagPage=99&tag=typescript";
  render(
    <DemoSessionProvider>
      <DeveloperScreen />
    </DemoSessionProvider>,
  );
  expect(
    await screen.findByRole("button", {
      name: "JavaScript (1)",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "TypeScript (1)" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("button", { name: "Web (1)" }),
  ).toBeVisible();
  expect(
    screen.queryByRole("searchbox"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "태그 검색" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("navigation", {
      name: "태그 페이지",
    }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "전체 퀴즈" }),
  );
  expect(push).toHaveBeenCalledWith(
    "/developers/bugri-author/quizzes?user=friend&page=1",
    { scroll: false },
  );
});
