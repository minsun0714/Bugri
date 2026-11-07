import "./mock-three";
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

test("keyboard movement cancels with Escape and commits rotation with Enter", async () => {
  render(<ShopApp />);
  const item = await screen.findByRole("button", {
    name: "새싹 키보드 선택",
  });
  fireEvent.click(item);
  fireEvent.keyDown(item, { key: "ArrowRight" });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("X -0.35");
  fireEvent.keyDown(item, { key: "Escape" });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("X -0.45");
  fireEvent.click(
    screen.getByRole("button", {
      name: "상품 회전",
    }),
  );
  fireEvent.keyDown(item, { key: "ArrowRight" });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("회전 15°");
  fireEvent.keyDown(item, { key: "Enter" });
  expect(
    await screen.findByText("3D 배치를 저장했어요."),
  ).toBeInTheDocument();
  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });
  expect(
    (await api.request("inventory", {})).transforms
      .KEYBOARD,
  ).toEqual({ x: -0.45, y: 1.55, z: 0.65, rotationY: 15 });
});

test("failed placement retains the spatial draft and rotation for retry", async () => {
  render(<ShopApp />);
  const item = await screen.findByRole("button", {
    name: "새싹 키보드 선택",
  });
  fireEvent.click(item);
  const spy = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("quota");
    });
  fireEvent.change(
    screen.getByRole("slider", { name: "아이템 회전" }),
    { target: { value: "45" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "배치 저장" }),
  );
  await screen.findByRole("button", {
    name: "배치 다시 저장",
  });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("회전 45°");
  spy.mockRestore();
  fireEvent.click(
    screen.getByRole("button", { name: "배치 다시 저장" }),
  );
  await waitFor(() =>
    expect(
      screen.getByText("3D 배치를 저장했어요."),
    ).toBeInTheDocument(),
  );
});
