import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { GuestConversion } from "@/components/landing/guest-conversion";

const signIn = jest.fn();

jest.mock("@/components/navigation/demo-session", () => ({
  useDemoSession: () => ({ signIn }),
}));

test("offers explicit demo selection without promising retrospective coins", () => {
  render(<GuestConversion />);
  expect(
    screen.getByText(
      "코인은 사용자 선택 후 학습부터 쌓여요. 체험 보상은 이월되지 않아요.",
    ),
  ).toBeVisible();
  expect(signIn).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "데모 사용자로 계속하기",
    }),
  );
  expect(signIn).toHaveBeenCalledTimes(1);
});
