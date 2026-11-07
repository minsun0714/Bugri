import { DeskObject } from "@/api/constants";
import type { DeskTransform } from "@/api/contracts";
import {
  constrainTransform,
  tableHeight,
} from "@/lib/desk-spatial";

type SurfaceDrop = {
  /** Canvas-centred coordinates, with framing offset and pixel scale removed. */
  screen: { x: number; y: number };
  yaw: number;
  pitch: number;
  center: { x: number; z: number };
  desk: DeskTransform;
  itemFrame: DeskTransform;
  transform: DeskTransform;
  /** Contact radius for feet; direct pointer drops have no footprint. */
  footprint?: number;
};

const radians = (degrees: number) =>
  (degrees * Math.PI) / 180;

function localPoint(
  x: number,
  z: number,
  frame: DeskTransform,
) {
  const angle = radians(frame.rotationY);
  const dx = x - frame.x;
  const dz = z - frame.z;

  return {
    x: Math.cos(angle) * dx - Math.sin(angle) * dz,
    z: Math.sin(angle) * dx + Math.cos(angle) * dz,
  };
}

/** Intersect the orthographic pointer ray with the current desk's top plane. */
export function tabletopDrop({
  screen,
  yaw,
  pitch,
  center,
  desk,
  itemFrame,
  transform,
  footprint = 0,
}: SurfaceDrop): DeskTransform | null {
  if (pitch <= 0) return null;

  const angle = radians(yaw);
  const elevation = radians(pitch);
  const height = desk.y + tableHeight;
  const depth =
    (screen.y + height * Math.cos(elevation)) /
    Math.sin(elevation);
  const worldX =
    Math.cos(angle) * screen.x +
    Math.sin(angle) * depth +
    center.x;
  const worldZ =
    -Math.sin(angle) * screen.x +
    Math.cos(angle) * depth +
    center.z;
  const local = localPoint(worldX, worldZ, desk);

  if (
    Math.abs(local.x) > 2 + footprint ||
    Math.abs(local.z) > 1.2 + footprint
  )
    return null;

  // The pointer may reach the edge; keep both feet supported by the tabletop.
  const x = Math.max(-1.6, Math.min(1.6, local.x));
  const z = Math.max(-0.8, Math.min(0.8, local.z));
  const deskAngle = radians(desk.rotationY);
  const position = localPoint(
    desk.x +
      Math.cos(deskAngle) * x +
      Math.sin(deskAngle) * z,
    desk.z -
      Math.sin(deskAngle) * x +
      Math.cos(deskAngle) * z,
    itemFrame,
  );

  return constrainTransform(DeskObject.BUGRI, {
    ...transform,
    ...position,
    y: height - itemFrame.y,
  });
}
