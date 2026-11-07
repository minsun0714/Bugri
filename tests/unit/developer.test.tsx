import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DeveloperScreen } from "@/components/developer/developer-screen";

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
  expect(push).toHaveBeenCalledWith(
    "/developers/bugri-author/quizzes?user=friend&page=1&tagPage=1&tag=typescript",
    { scroll: false },
  );
});
