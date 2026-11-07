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

/** Conservative footprints include the complete model, not only the stand. */
const footprints: Record<
  MovableCategory,
  [number, number]
> = {
  KEYBOARD: [1.35, 0.52],
  MONITOR: [1.7, 0.5],
  ACCESSORY: [0.62, 0.62],
  DESK: [4, 2.4],
};

export function constrainTransform(
  category: MovableCategory,
  input: DeskTransform,
): DeskTransform {
  const rotationY =
    ((Math.round(input.rotationY) % 360) + 360) % 360;
  const angle = (rotationY * Math.PI) / 180;
  const [width, depth] = footprints[category];
  const extentX =
    (Math.abs(Math.cos(angle)) * width +
      Math.abs(Math.sin(angle)) * depth) /
    2;
  const extentZ =
    (Math.abs(Math.sin(angle)) * width +
      Math.abs(Math.cos(angle)) * depth) /
    2;
  const limitX =
    Math.floor(
      ((category === Category.DESK ? 4 : 2) - extentX) *
        1000,
    ) / 1000;
  const limitZ =
    Math.floor(
      ((category === Category.DESK ? 4 : 1.2) - extentZ) *
        1000,
    ) / 1000;
  const round = (v: number, limit: number) =>
    Math.max(
      -limit,
      Math.min(limit, Math.round(v * 1000) / 1000),
    );
  return {
    x: round(input.x, limitX),
    y: category === Category.DESK ? 0 : tableHeight,
    z: round(input.z, limitZ),
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
