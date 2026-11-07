import { Category, DeskObject } from "@/api/constants";
import type { DeskTransform } from "@/api/contracts";
import {
  constrainTransform,
  tableHeight,
  type SpatialTarget,
} from "@/lib/desk-spatial";

type SurfaceTarget = Exclude<
  SpatialTarget,
  typeof Category.DESK
>;

// Half-extents of each model's supporting base in desk units, not its silhouette.
const baseSize: Record<
  SurfaceTarget,
  { x: number; z: number }
> = {
  [DeskObject.BUGRI]: { x: 0.4, z: 0.4 },
  [Category.KEYBOARD]: { x: 0.675, z: 0.26 },
  [Category.MONITOR]: { x: 0.375, z: 0.225 },
  [Category.ACCESSORY]: { x: 0.21, z: 0.21 },
};

type SurfaceDrop = {
  category: SurfaceTarget;
  /** Canvas-centred coordinates, with framing offset and pixel scale removed. */
  screen: { x: number; y: number };
  yaw: number;
  pitch: number;
  center: { x: number; z: number };
  desk: DeskTransform;
  itemFrame: DeskTransform;
  transform: DeskTransform;
  /** Test support-base overlap; direct pointer drops require the pointer inside. */
  contact?: boolean;
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
  category,
  screen,
  yaw,
  pitch,
  center,
  desk,
  itemFrame,
  transform,
  contact = false,
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

  const baseAngle = radians(
    itemFrame.rotationY +
      transform.rotationY -
      desk.rotationY,
  );
  const size = baseSize[category];
  const extent = {
    x:
      Math.abs(Math.cos(baseAngle)) * size.x +
      Math.abs(Math.sin(baseAngle)) * size.z,
    z:
      Math.abs(Math.sin(baseAngle)) * size.x +
      Math.abs(Math.cos(baseAngle)) * size.z,
  };

  if (
    Math.abs(local.x) > 2 + (contact ? extent.x : 0) ||
    Math.abs(local.z) > 1.2 + (contact ? extent.z : 0)
  )
    return null;

  // Keep the entire rotated support base on the surface at an edge.
  const x = Math.max(
    -2 + extent.x,
    Math.min(2 - extent.x, local.x),
  );
  const z = Math.max(
    -1.2 + extent.z,
    Math.min(1.2 - extent.z, local.z),
  );
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

  return constrainTransform(category, {
    ...transform,
    ...position,
    y: height - itemFrame.y,
  });
}
