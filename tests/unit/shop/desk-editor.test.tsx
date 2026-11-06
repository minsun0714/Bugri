import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ShopApp } from "@/components/shop/shop-app";
import { createBrowserApi } from "@/api/browser";
import { Category } from "@/api/constants";

beforeEach(async () => {
  localStorage.clear();
  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });
  await api.request("purchase", {
    productId: "keyboard-1",
    requestKey: "keyboard",
  });
  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: "keyboard-1",
  });
});

test("keyboard arrows preview placement, Escape cancels, Enter saves", async () => {
  render(<ShopApp />);
  const item = await screen.findByRole("button", {
    name: "새싹 키보드 이동",
  });
  fireEvent.keyDown(item, { key: "ArrowRight" });
  expect(item).toHaveAttribute(
    "transform",
    "translate(10 0)",
  );
  fireEvent.keyDown(item, { key: "Escape" });
  expect(item).toHaveAttribute(
    "transform",
    "translate(0 0)",
  );
  fireEvent.keyDown(item, { key: "ArrowRight" });
  fireEvent.keyDown(item, { key: "Enter" });
  expect(
    await screen.findByText("배치를 저장했어요."),
  ).toBeInTheDocument();
  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });
  expect(
    (await api.request("inventory", {})).positions.KEYBOARD,
  ).toEqual({ x: 10, y: 0 });
});

test("failed placement keeps the draft and allows retry without losing the saved layout", async () => {
  render(<ShopApp />);
  const item = await screen.findByRole("button", {
    name: "새싹 키보드 이동",
  });
  const spy = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("quota");
    });
  fireEvent.keyDown(item, { key: "ArrowLeft" });
  fireEvent.keyDown(item, { key: "Enter" });
  await screen.findByRole("button", {
    name: "배치 다시 저장",
  });
  expect(item).toHaveAttribute(
    "transform",
    "translate(-10 0)",
  );
  spy.mockRestore();
  fireEvent.click(
    screen.getByRole("button", { name: "배치 다시 저장" }),
  );
  await waitFor(() =>
    expect(
      screen.getByText("배치를 저장했어요."),
    ).toBeInTheDocument(),
  );
});
