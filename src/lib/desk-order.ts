import {
  Category,
  DeskObject,
  LayerAction,
} from "@/api/constants";
import type { DeskItem, Equipment } from "@/api/contracts";

export function deskItems(
  equipment: Equipment,
): DeskItem[] {
  return [
    DeskObject.BUGRI,
    Category.DESK,
    ...(
      [
        Category.KEYBOARD,
        Category.MONITOR,
        Category.ACCESSORY,
      ] as const
    ).filter((category) => equipment[category]),
  ];
}

export function normalizeOrder<T extends string>(
  order: readonly T[],
  available: readonly T[],
): T[] {
  return [
    ...new Set([
      ...order.filter((target) =>
        available.includes(target),
      ),
      ...available,
    ]),
  ];
}

export function changeOrder<T extends string>(
  order: readonly T[],
  available: readonly T[],
  target: T,
  action: LayerAction,
): T[] {
  const next = normalizeOrder(order, available);
  const index = next.indexOf(target);
  if (index < 0) return next;
  const destination =
    action === LayerAction.FRONT
      ? next.length - 1
      : action === LayerAction.BACK
        ? 0
        : Math.max(
            0,
            Math.min(
              next.length - 1,
              index +
                (action === LayerAction.FORWARD ? 1 : -1),
            ),
          );
  next.splice(index, 1);
  next.splice(destination, 0, target);
  return next;
}

export function validOrder(
  order: unknown,
  available: readonly DeskItem[],
): order is DeskItem[] {
  return (
    Array.isArray(order) &&
    (order.length === 0 ||
      (order.length === available.length &&
        new Set(order).size === order.length &&
        order.every((item) => available.includes(item))))
  );
}
