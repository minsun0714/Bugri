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
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

test("author catalog filters explicitly and refreshes subscriptions without navigating", async () => {
  render(
    <DemoSessionProvider>
      <DeveloperScreen />
    </DemoSessionProvider>,
  );
  expect(
    await screen.findByRole("heading", {
      name: "타입 개발자의 퀴즈",
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("link", { name: "타입 선언" }),
  ).toHaveAttribute(
    "href",
    "/solve?user=friend&quiz=seed-quiz-1",
  );
  expect(
    screen.queryByRole("button", {
      name: "TypeScript 구독 메뉴",
    }),
  ).not.toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "타입 개발자 구독하기",
    }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("button", {
        name: "타입 개발자 구독하기",
      }),
    ).not.toBeInTheDocument(),
  );
  expect(
    screen.getByText("타입 개발자님을 구독했습니다."),
  ).toBeVisible();
  expect(push).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "TypeScript (1)",
    }),
  );
  const api = await createBrowserApi({
    mode: "mock",
    userId: "friend",
  });
  expect(await api.request("subscriptions", {})).toEqual([
    expect.objectContaining({
      type: "PERSON",
      authorUserId: "author",
    }),
  ]);
  fireEvent.click(
    screen.getByRole("button", {
      name: "TypeScript 태그 구독하기",
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "TypeScript 구독 메뉴",
      }),
    ).toBeEnabled(),
  );
  expect(
    screen.getByText("TypeScript 태그를 구독했습니다."),
  ).toBeVisible();
  expect(push).toHaveBeenCalledWith(
    "/developers/bugri-author/quizzes?user=friend&page=1&tagPage=1&tag=typescript",
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
    screen.getByRole("link", { name: "전체 보기 →" }),
  ).toHaveAttribute(
    "href",
    "/developers/bugri-author/quizzes?user=learner",
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "데모 사용자 선택 후 구독하기",
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
      name: "개발자 구독하기",
    }),
  );
  expect(
    await screen.findByRole("button", {
      name: "개발자 구독 해제",
    }),
  ).toBeVisible();
});
