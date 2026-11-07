import "./mock-three";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProductTrial } from "@/components/shop/product-trial";
import { Category } from "@/api/constants";

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
    screen.getByRole("button", {
      name: "상품 이동",
    }),
  ).toHaveAttribute("aria-pressed", "true");
  fireEvent.change(screen.getByLabelText("아이템 회전"), {
    target: { value: "90" },
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
  expect(screen.getByLabelText("아이템 회전")).toHaveValue(
    "90",
  );
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
