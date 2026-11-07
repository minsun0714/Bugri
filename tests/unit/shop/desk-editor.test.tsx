import "./mock-three";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DeskEditor } from "@/components/shop/desk-editor";
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
  render(<ShopApp editing />);
  const item = await screen.findByRole("button", {
    name: "새싹 키보드 선택",
  });
  fireEvent.click(item);
  expect(
    screen.queryByRole("slider", { name: "아이템 회전" }),
  ).not.toBeInTheDocument();
  fireEvent.keyDown(item, { key: "ArrowRight" });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("X -0.35");
  fireEvent.keyDown(item, { key: "Escape" });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("X -0.45");
  fireEvent.keyDown(item, {
    key: "ArrowRight",
    altKey: true,
  });
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
  render(<ShopApp editing />);
  const item = await screen.findByRole("button", {
    name: "새싹 키보드 선택",
  });
  fireEvent.click(item);
  const spy = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("quota");
    });
  for (let i = 0; i < 3; i++)
    fireEvent.keyDown(item, {
      key: "ArrowRight",
      altKey: true,
    });
  fireEvent.change(
    screen.getByRole("slider", { name: "아이템 높이" }),
    { target: { value: "0.5" } },
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
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Y 0.50");
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

test("height presets and keyboard adjustment cancel and save independently of planar position", async () => {
  render(<ShopApp editing />);
  const item = await screen.findByRole("button", {
    name: "새싹 키보드 선택",
  });
  fireEvent.click(item);
  fireEvent.click(
    screen.getByRole("button", { name: "바닥에 놓기" }),
  );
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Y 0.00");
  fireEvent.keyDown(item, {
    key: "ArrowUp",
    shiftKey: true,
  });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Y 0.10");
  fireEvent.keyDown(item, { key: "Escape" });
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Y 1.55");
  fireEvent.change(
    screen.getByRole("slider", { name: "아이템 높이" }),
    { target: { value: "0.5" } },
  );
  fireEvent.keyDown(item, { key: "Enter" });
  await screen.findByText("3D 배치를 저장했어요.");
  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });
  expect(
    (await api.request("inventory", {})).transforms
      .KEYBOARD,
  ).toEqual({ x: -0.45, y: 0.5, z: 0.65, rotationY: 0 });
  fireEvent.click(
    screen.getByRole("button", { name: "책상 위에 놓기" }),
  );
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Y 1.55");
});

test("successful height stays visible until refreshed props arrive, then accepts external changes", async () => {
  const equipment = { KEYBOARD: "keyboard-1" };
  const initial = {
    x: -0.45,
    y: 1.55,
    z: 0.65,
    rotationY: 0,
  };
  const transforms = { KEYBOARD: initial };
  const save = jest.fn(async () => undefined);
  const view = render(
    <DeskEditor
      equipment={equipment}
      transforms={transforms}
      save={save}
      saveBugri={jest.fn()}
      disabled={false}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "새싹 키보드 선택",
    }),
  );
  fireEvent.change(
    screen.getByRole("slider", { name: "아이템 높이" }),
    { target: { value: "0.7" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "배치 저장" }),
  );
  await screen.findByText("3D 배치를 저장했어요.");
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Y 0.70");
  expect(
    screen.queryByRole("button", { name: "배치 저장" }),
  ).not.toBeInTheDocument();
  view.rerender(
    <DeskEditor
      equipment={equipment}
      transforms={{ KEYBOARD: { ...initial, y: 0.3 } }}
      save={save}
      saveBugri={jest.fn()}
      disabled={false}
    />,
  );
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Y 0.30");
});
