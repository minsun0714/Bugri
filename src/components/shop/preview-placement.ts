import { Category } from "@/api/constants";
import type {
  DeskTransform,
  DeskTransforms,
  Equipment,
} from "@/api/contracts";
import type { MovableCategory } from "@/lib/desk-layout";
import {
  constrainTransform,
  defaultTransforms,
} from "@/lib/desk-spatial";

/** A preview is a separate object beside its existing counterpart, in the same space. */
export function initialPreviewTransform(
  category: MovableCategory,
  equipment: Equipment,
  transforms: DeskTransforms,
): DeskTransform {
  const existing =
    transforms[category] ?? defaultTransforms[category];
  if (category !== Category.DESK && !equipment[category])
    return { ...defaultTransforms[category] };
  const angle = (existing.rotationY * Math.PI) / 180;
  const spacing =
    category === Category.DESK
      ? 4 * Math.abs(Math.cos(angle)) +
        2.4 * Math.abs(Math.sin(angle)) +
        1
      : category === Category.KEYBOARD
        ? 1.7
        : category === Category.MONITOR
          ? 2
          : 1;
  return constrainTransform(category, {
    ...existing,
    x: existing.x + spacing,
  });
}
