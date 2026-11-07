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
jest.mock("next/navigation", () => ({
  useParams: () => ({ publicId: "bugri-author" }),
  useSearchParams: () => new URLSearchParams("user=friend"),
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
});

test("author catalog filters explicitly and refreshes subscriptions without navigating", async () => {
  render(<DeveloperScreen />);
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
    screen.getByRole("button", { name: "개발자 구독하기" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("button", {
        name: "개발자 구독하기",
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

test("public profile previews quizzes without filters and requires login before subscription", async () => {
  const api = await createBrowserApi({
    mode: "mock",
    userId: "friend",
  });
  const before = await api.request("subscriptions", {});
  render(
    <DemoSessionProvider>
      <DeveloperScreen profile />
    </DemoSessionProvider>,
  );
  expect(
    await screen.findByRole("heading", {
      name: "타입 개발자",
    }),
  ).toBeVisible();
  expect(
    screen.queryByRole("searchbox"),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "전체 보기 →" }),
  ).toHaveAttribute(
    "href",
    "/developers/bugri-author/quizzes?user=friend",
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "로그인하고 구독하기",
    }),
  );
  expect(await api.request("subscriptions", {})).toEqual(
    before,
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
