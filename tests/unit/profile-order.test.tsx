import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProfileSections } from "@/components/profile/profile-sections";
const save = jest.fn();
jest.mock("@/components/profile/use-profile-order", () => ({
  useProfileOrder: () => ({
    profile: {
      data: { order: ["DESK", "QUIZZES", "ACTIVITY"] },
    },
    update: {
      mutateAsync: save,
      reset: jest.fn(),
      isPending: false,
    },
  }),
}));
const props = {
  userId: "author",
  publicId: "bugri-author",
  owner: true,
  sections: {
    DESK: <div>desk content</div>,
    QUIZZES: <div>quiz content</div>,
    ACTIVITY: <div>activity content</div>,
  },
  onNotice: jest.fn(),
};
function order() {
  return [
    ...document.querySelectorAll("[data-profile-section]"),
  ].map((el) => el.getAttribute("data-profile-section"));
}
beforeEach(() => {
  save.mockReset();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
function draftOrder() {
  return [
    ...document.querySelectorAll("[data-order-row]"),
  ].map((el) => el.getAttribute("data-order-row"));
}
test("move, cancel, keyboard alternative and save", async () => {
  save.mockResolvedValue({
    order: ["QUIZZES", "DESK", "ACTIVITY"],
  });
  render(<ProfileSections {...props} />);
  fireEvent.click(
    screen.getByRole("button", { name: "순서 편집" }),
  );
  expect(
    screen.getByRole("button", {
      name: "내 데스크 위로 이동",
    }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "최신 공개 퀴즈 위로 이동",
    }),
  );
  expect(draftOrder()).toEqual([
    "QUIZZES",
    "DESK",
    "ACTIVITY",
  ]);
  expect(order()).toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
  expect(
    screen.getByRole("dialog", { name: "순서 편집" }),
  ).toBeVisible();
  expect(screen.getByRole("dialog")).not.toHaveTextContent(
    "desk content",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "취소" }),
  );
  expect(order()).toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "순서 편집" }),
    ).toHaveFocus(),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "순서 편집" }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "최신 공개 퀴즈 위로 이동",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "저장",
    }),
  );
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({
      order: ["QUIZZES", "DESK", "ACTIVITY"],
    }),
  );
});
test("failed save preserves draft with retry and visitor has no controls", async () => {
  save.mockRejectedValue(new Error("full"));
  const { rerender } = render(
    <ProfileSections {...props} />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "순서 편집" }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "최신 공개 퀴즈 위로 이동",
    }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "저장",
    }),
  );
  await screen.findByRole("alert");
  expect(draftOrder()).toEqual([
    "QUIZZES",
    "DESK",
    "ACTIVITY",
  ]);
  expect(order()).toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
  expect(
    screen.getByRole("dialog", { name: "순서 편집" }),
  ).toBeVisible();
  expect(screen.getByRole("dialog")).not.toHaveTextContent(
    "desk content",
  );
  expect(
    screen.getByRole("button", { name: "다시 저장" }),
  ).toBeEnabled();
  rerender(<ProfileSections {...props} owner={false} />);
  expect(
    screen.queryByRole("button", {
      name: /이동|저장|순서 편집/,
    }),
  ).not.toBeInTheDocument();
});
