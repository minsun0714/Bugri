import { act, renderHook } from "@testing-library/react";
import { useDeskOrder } from "@/components/shop/use-desk-order";
import { useProductTrial } from "@/components/shop/use-product-trial";
import type { DeskOrder } from "@/api/contracts";
import {
  Category,
  DeskObject,
  LayerAction,
} from "@/api/constants";
import {
  changeOrder,
  normalizeOrder,
} from "@/lib/desk-order";

const items = [
  DeskObject.BUGRI,
  Category.DESK,
  Category.KEYBOARD,
  Category.MONITOR,
];

test("moves one layer or to either end without changing other items' relative order", () => {
  expect(
    changeOrder(
      [],
      items,
      Category.DESK,
      LayerAction.FORWARD,
    ),
  ).toEqual([
    DeskObject.BUGRI,
    Category.KEYBOARD,
    Category.DESK,
    Category.MONITOR,
  ]);
  expect(
    changeOrder(
      [],
      items,
      Category.KEYBOARD,
      LayerAction.BACKWARD,
    ),
  ).toEqual([
    DeskObject.BUGRI,
    Category.KEYBOARD,
    Category.DESK,
    Category.MONITOR,
  ]);
  expect(
    changeOrder(
      [],
      items,
      DeskObject.BUGRI,
      LayerAction.FRONT,
    ),
  ).toEqual([
    Category.DESK,
    Category.KEYBOARD,
    Category.MONITOR,
    DeskObject.BUGRI,
  ]);
  expect(
    changeOrder(
      [],
      items,
      Category.MONITOR,
      LayerAction.BACK,
    ),
  ).toEqual([
    Category.MONITOR,
    DeskObject.BUGRI,
    Category.DESK,
    Category.KEYBOARD,
  ]);
  expect(
    changeOrder(
      [],
      items,
      DeskObject.BUGRI,
      LayerAction.BACKWARD,
    ),
  ).toEqual(items);
  expect(
    changeOrder(
      [],
      items,
      Category.MONITOR,
      LayerAction.FORWARD,
    ),
  ).toEqual(items);
});

test("normalizes removals and newly equipped items without mutating saved order", () => {
  const saved = [
    Category.KEYBOARD,
    DeskObject.BUGRI,
    Category.DESK,
  ];
  expect(
    normalizeOrder(saved, [
      DeskObject.BUGRI,
      Category.DESK,
      Category.MONITOR,
    ]),
  ).toEqual([
    DeskObject.BUGRI,
    Category.DESK,
    Category.MONITOR,
  ]);
  expect(saved).toEqual([
    Category.KEYBOARD,
    DeskObject.BUGRI,
    Category.DESK,
  ]);
});


test("a failed order save keeps the visible draft and retries the same order", async () => {
  const order: DeskOrder = [];
  const save = jest
    .fn()
    .mockRejectedValueOnce(new Error("storage"))
    .mockResolvedValue({});
  const { result } = renderHook(() =>
    useDeskOrder({
      order,
      equipment: {},
      save,
      disabled: false,
    }),
  );
  await act(() =>
    result.current.reorder(
      DeskObject.BUGRI,
      LayerAction.FRONT,
    ),
  );
  expect(result.current.error).toBe(true);
  expect(result.current.effective).toEqual([
    Category.DESK,
    DeskObject.BUGRI,
  ]);
  await act(async () => {
    await result.current.retry();
  });
  expect(result.current.error).toBe(false);
  expect(result.current.effective).toEqual([
    Category.DESK,
    DeskObject.BUGRI,
  ]);
  expect(save).toHaveBeenCalledTimes(2);
  expect(save).toHaveBeenLastCalledWith({
    order: [Category.DESK, DeskObject.BUGRI],
  });
});

test("applying a trial preserves the saved relative order of existing objects", async () => {
  const equip = jest.fn().mockResolvedValue({});
  const move = jest.fn().mockResolvedValue({});
  const saveOrder = jest.fn().mockResolvedValue({});
  const order = [
    Category.DESK,
    Category.KEYBOARD,
    Category.MONITOR,
    DeskObject.BUGRI,
  ];
  const { result } = renderHook(() =>
    useProductTrial({
      product: {
        productId: "keyboard-2",
        category: Category.KEYBOARD,
        name: "라벤더 키보드",
        description: "",
        price: 45,
      },
      equipment: {
        KEYBOARD: "keyboard-1",
        MONITOR: "monitor-1",
      },
      transforms: {},
      order,
      pending: false,
      equip,
      move,
      saveOrder,
    }),
  );
  act(() =>
    result.current.reorder(
      DeskObject.BUGRI,
      LayerAction.BACK,
    ),
  );
  expect(saveOrder).not.toHaveBeenCalled();
  await act(() => result.current.apply());
  expect(saveOrder).toHaveBeenCalledWith({
    order: [
      Category.DESK,
      Category.MONITOR,
      DeskObject.BUGRI,
      Category.KEYBOARD,
    ],
  });
  expect(move).toHaveBeenCalledTimes(1);
  expect(move).toHaveBeenCalledWith(
    expect.objectContaining({ productId: "keyboard-2" }),
  );
});
