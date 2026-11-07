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
  fireEvent.click(
    await screen.findByRole("button", {
      name: "타입 개발자의 TypeScript 구독하기",
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "타입 개발자의 TypeScript 구독 중",
      }),
    ).toBeDisabled(),
  );
  expect(push).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "개발자 구독하기" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "개발자 구독 중",
      }),
    ).toBeDisabled(),
  );
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
