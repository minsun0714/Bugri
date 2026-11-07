import "./mock-three";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProductTrial } from "@/components/shop/product-trial";
import { Category } from "@/api/constants";

function selectProduct(name: string) {
  const surface = screen.getByRole("img", {
    name: "3D 데스크 캔버스",
  });
  fireEvent.keyDown(surface, { key: "Home" });
  for (let i = 0; i < 5; i++) {
    if (
      screen.getByLabelText("선택 상품", { exact: true })
        .textContent === name
    )
      return surface;
    fireEvent.keyDown(surface, { key: "PageDown" });
  }
  throw new Error(`Missing product: ${name}`);
}

const product = {
  productId: "keyboard-1",
  category: Category.KEYBOARD,
  name: "새싹 키보드",
  description: "",
  price: 30,
};

test("keeps a failed placement draft after equipment succeeds and retries without losing rotation", async () => {
  const equip = jest.fn().mockResolvedValue({});
  const move = jest
    .fn()
    .mockRejectedValueOnce(new Error("storage"))
    .mockResolvedValue({});
  render(
    <ProductTrial
      product={product}
      equipment={{}}
      transforms={{}}
      owned
      pending={false}
      buy={jest.fn()}
      equip={equip}
      move={move}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "상품 이동" }),
  ).not.toBeInTheDocument();
  fireEvent.click(selectProduct("새싹 키보드"));
  expect(
    screen.queryByRole("slider", { name: "아이템 회전" }),
  ).not.toBeInTheDocument();
  for (let i = 0; i < 6; i++)
    fireEvent.keyDown(selectProduct("새싹 키보드"), {
      key: "ArrowRight",
      altKey: true,
    });
  expect(equip).not.toHaveBeenCalled();
  expect(move).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "내 데스크에 장착",
    }),
  );
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "상품은 장착됐지만 배치를 저장하지 못했어요",
    ),
  );
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("회전 90°");
  expect(move).toHaveBeenCalledWith(
    expect.objectContaining({
      productId: "keyboard-1",
      transform: expect.objectContaining({ rotationY: 90 }),
    }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "배치 다시 적용" }),
  );
  await screen.findByText("장착과 배치를 저장했어요.");
  expect(move).toHaveBeenCalledTimes(2);
  expect(
    screen.queryByRole("alert"),
  ).not.toBeInTheDocument();
});

test("does not send placement if equipping fails", async () => {
  const equip = jest
    .fn()
    .mockRejectedValue(new Error("storage"));
  const move = jest.fn();
  render(
    <ProductTrial
      product={product}
      equipment={{}}
      transforms={{}}
      owned
      pending={false}
      buy={jest.fn()}
      equip={equip}
      move={move}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "내 데스크에 장착",
    }),
  );
  await screen.findByRole("alert");
  expect(move).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "배치 다시 적용" }),
  ).toBeEnabled();
});

test("existing items are temporary and applying a same-category trial saves only the added item", async () => {
  const equip = jest.fn().mockResolvedValue({});
  const move = jest.fn().mockResolvedValue({});
  const original = {
    x: 0.4,
    y: 1.55,
    z: 0.5,
    rotationY: 0,
  };
  const props = {
    product: {
      ...product,
      productId: "keyboard-2",
      name: "라벤더 키보드",
    },
    equipment: { KEYBOARD: "keyboard-1" },
    transforms: { KEYBOARD: original },
    owned: true,
    pending: false,
    buy: jest.fn(),
    equip,
    move,
  };
  const view = render(<ProductTrial {...props} />);
  const existing = selectProduct("새싹 키보드");
  fireEvent.click(existing);
  fireEvent.keyDown(existing, { key: "ArrowRight" });
  fireEvent.keyDown(existing, { key: "Enter" });
  await waitFor(() => expect(existing).toBeEnabled());
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("X 0.50");
  const desk = selectProduct("기본 데스크");
  fireEvent.click(desk);
  fireEvent.keyDown(desk, {
    key: "ArrowRight",
    altKey: true,
  });
  fireEvent.keyDown(desk, { key: "Enter" });
  await waitFor(() => expect(desk).toBeEnabled());
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("회전 15°");
  expect(equip).not.toHaveBeenCalled();
  expect(move).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", {
      name: "기존 상품과 교체",
    }),
  );
  await screen.findByText("장착과 배치를 저장했어요.");
  expect(move).toHaveBeenCalledTimes(1);
  expect(move).toHaveBeenCalledWith({
    category: Category.KEYBOARD,
    productId: "keyboard-2",
    transform: { ...original, x: 2.1 },
  });
  expect(original).toEqual({
    x: 0.4,
    y: 1.55,
    z: 0.5,
    rotationY: 0,
  });
  view.unmount();
  render(<ProductTrial {...props} />);
  fireEvent.click(selectProduct("새싹 키보드"));
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("X 0.40");
  fireEvent.click(selectProduct("기본 데스크"));
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("회전 0°");
});

test("reset restores existing and added placement without saving or selection buttons", async () => {
  const equip = jest.fn();
  const move = jest.fn();
  render(
    <ProductTrial
      product={product}
      equipment={{ KEYBOARD: "keyboard-2" }}
      transforms={{}}
      owned={false}
      pending={false}
      buy={jest.fn()}
      equip={equip}
      move={move}
    />,
  );
  expect(
    screen.queryByRole("button", { name: /선택$/ }),
  ).not.toBeInTheDocument();
  const surface = selectProduct("새싹 키보드");
  const initial =
    screen.getByLabelText("선택 상품 배치").textContent;
  fireEvent.keyDown(surface, { key: "ArrowRight" });
  fireEvent.keyDown(surface, { key: "Enter" });
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "초기화",
      }),
    ).toBeEnabled(),
  );
  expect(
    screen.getByLabelText("선택 상품 배치").textContent,
  ).not.toBe(initial);
  selectProduct("라벤더 키보드");
  fireEvent.keyDown(surface, { key: "ArrowDown" });
  fireEvent.keyDown(surface, { key: "Enter" });
  await waitFor(() =>
    expect(
      screen.getByRole("button", {
        name: "초기화",
      }),
    ).toBeEnabled(),
  );
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Z 0.75");
  fireEvent.click(
    screen.getByRole("button", {
      name: "초기화",
    }),
  );
  selectProduct("새싹 키보드");
  expect(
    screen.getByLabelText("선택 상품 배치").textContent,
  ).toBe(initial);
  selectProduct("라벤더 키보드");
  expect(
    screen.getByLabelText("선택 상품 배치"),
  ).toHaveTextContent("Z 0.65");
  expect(equip).not.toHaveBeenCalled();
  expect(move).not.toHaveBeenCalled();
});
