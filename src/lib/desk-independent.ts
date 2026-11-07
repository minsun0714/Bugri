import { Category } from "@/api/constants";
import type {
  DeskTransform,
  DeskTransforms,
  Equipment,
} from "@/api/contracts";
import { deskItems } from "@/lib/desk-order";
import {
  constrainTransform,
  defaultTransforms,
} from "@/lib/desk-spatial";

/** Rebase local coordinates so moving the desk leaves every other object in place. */
export function moveDeskIndependently(
  equipment: Equipment,
  transforms: DeskTransforms,
  desk: DeskTransform,
): DeskTransforms {
  const previous =
    transforms.DESK ?? defaultTransforms.DESK;
  const before = (previous.rotationY * Math.PI) / 180;
  const after = (desk.rotationY * Math.PI) / 180;
  const next: DeskTransforms = {
    ...transforms,
    DESK: desk,
  };

  for (const category of deskItems(equipment)) {
    if (category === Category.DESK) continue;

    const current =
      transforms[category] ?? defaultTransforms[category];
    const x =
      previous.x +
      Math.cos(before) * current.x +
      Math.sin(before) * current.z -
      desk.x;
    const z =
      previous.z -
      Math.sin(before) * current.x +
      Math.cos(before) * current.z -
      desk.z;

    next[category] = constrainTransform(category, {
      x: Math.cos(after) * x - Math.sin(after) * z,
      y: current.y,
      z: Math.sin(after) * x + Math.cos(after) * z,
      rotationY:
        current.rotationY +
        previous.rotationY -
        desk.rotationY,
    });
  }

  return next;
}
