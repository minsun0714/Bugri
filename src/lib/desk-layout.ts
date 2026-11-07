import { Category } from "@/api/constants";
import type { DeskPosition } from "@/api/contracts";

/** Artwork bounds in the shared 600 × 380 scene, including shadows. */
export const deskBounds = {
  [Category.KEYBOARD]: {
    x: 175,
    y: 245,
    width: 215,
    height: 60,
  },
  [Category.MONITOR]: {
    x: 199,
    y: 88,
    width: 212,
    height: 166,
  },
  [Category.DESK]: {
    x: 75,
    y: 209,
    width: 450,
    height: 161,
  },
  [Category.ACCESSORY]: {
    x: 412,
    y: 137,
    width: 72,
    height: 114,
  },
} as const;

export type MovableCategory = keyof typeof deskBounds;

export function isMovable(
  category: unknown,
): category is MovableCategory {
  return (
    typeof category === "string" &&
    Object.hasOwn(deskBounds, category)
  );
}

export function clampPosition(
  category: MovableCategory,
  { x, y }: DeskPosition,
): DeskPosition {
  const {
    x: left,
    y: top,
    width,
    height,
  } = deskBounds[category];
  return {
    x: Math.round(
      Math.max(10 - left, Math.min(590 - left - width, x)),
    ),
    y: Math.round(
      Math.max(10 - top, Math.min(370 - top - height, y)),
    ),
  };
}

export function validPosition(
  category: MovableCategory,
  value: unknown,
): value is DeskPosition {
  if (
    !value ||
    typeof value !== "object" ||
    !("x" in value) ||
    !("y" in value)
  )
    return false;
  const { x, y } = value;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    Object.keys(value).some(
      (key) => key !== "x" && key !== "y",
    )
  )
    return false;
  const clamped = clampPosition(category, { x, y });
  return x === clamped.x && y === clamped.y;
}
