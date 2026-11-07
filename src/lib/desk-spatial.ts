import { Category } from "@/api/constants";
import type {
  DeskTransform,
  DeskPosition,
} from "@/api/contracts";
import type { MovableCategory } from "@/lib/desk-layout";

export const tableHeight = 1.55;
export const defaultTransforms: Record<
  MovableCategory,
  DeskTransform
> = {
  KEYBOARD: {
    x: -0.45,
    y: tableHeight,
    z: 0.65,
    rotationY: 0,
  },
  MONITOR: { x: 0, y: tableHeight, z: -0.5, rotationY: 0 },
  DESK: { x: 0, y: 0, z: 0, rotationY: 0 },
  ACCESSORY: {
    x: 1.3,
    y: tableHeight,
    z: -0.35,
    rotationY: 0,
  },
};

export function constrainTransform(
  category: MovableCategory,
  input: DeskTransform,
): DeskTransform {
  const rotationY =
    ((Math.round(input.rotationY) % 360) + 360) % 360;
  const round = (value: number) =>
    Math.round(value * 1000) / 1000;
  return {
    x: round(input.x),
    y: category === Category.DESK ? 0 : tableHeight,
    z: round(input.z),
    rotationY,
  };
}

export function validTransform(
  category: MovableCategory,
  input: unknown,
): input is DeskTransform {
  if (!input || typeof input !== "object") return false;
  const value = input as Record<string, unknown>;
  if (
    Object.keys(value).length !== 4 ||
    !["x", "y", "z", "rotationY"].every(
      (key) =>
        typeof value[key] === "number" &&
        Number.isFinite(value[key]),
    )
  )
    return false;
  const transform = input as DeskTransform;
  const constrained = constrainTransform(
    category,
    transform,
  );
  return Object.entries(constrained).every(
    ([key, number]) =>
      Math.abs(number - (value[key] as number)) < 0.000001,
  );
}

export function migratePosition(
  category: MovableCategory,
  { x, y }: DeskPosition,
): DeskTransform {
  const initial = defaultTransforms[category];
  return constrainTransform(category, {
    ...initial,
    x: initial.x + x / 100,
    z: initial.z + y / 100,
  });
}
