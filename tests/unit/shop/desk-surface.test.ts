import { tabletopDrop } from "@/lib/desk-surface";
import { defaultTransforms } from "@/lib/desk-spatial";

const desk = defaultTransforms.DESK;
const transform = defaultTransforms.BUGRI;

function drop(screen: { x: number; y: number }) {
  return tabletopDrop({
    screen,
    yaw: 0,
    pitch: 30,
    center: { x: 0, z: 0 },
    desk,
    itemFrame: desk,
    transform,
  });
}

test("dropping on the tabletop sets the base height and surface position", () => {
  expect(
    drop({
      x: 0.7,
      y: -1.55 * Math.cos(Math.PI / 6) + 0.2,
    }),
  ).toEqual({
    x: 0.7,
    y: 1.55,
    z: 0.4,
    rotationY: 0,
  });
});

test("outside drops stay free and edge drops keep Bugri's feet on the surface", () => {
  expect(
    drop({ x: 2.1, y: -1.55 * Math.cos(Math.PI / 6) }),
  ).toBeNull();
  expect(
    drop({ x: 0, y: -1.55 * Math.cos(Math.PI / 6) + 0.7 }),
  ).toBeNull();
  expect(
    drop({
      x: 1.95,
      y: -1.55 * Math.cos(Math.PI / 6) + 0.59,
    }),
  ).toMatchObject({ x: 1.6, y: 1.55, z: 0.8 });
});

test("a moved and rotated trial desk converts back into the frozen item frame", () => {
  // Desk centre (3, 2), camera yaw 90: projected X=-2, depth=3.
  // The original item frame is translated (1, 1) and rotated 90 degrees.
  expect(
    tabletopDrop({
      screen: {
        x: -2,
        y: 1.5 - 1.55 * Math.cos(Math.PI / 6),
      },
      yaw: 90,
      pitch: 30,
      center: { x: 0, z: 0 },
      desk: { x: 3, y: 0, z: 2, rotationY: 45 },
      itemFrame: { x: 1, y: 0, z: 1, rotationY: 90 },
      transform: { ...transform, rotationY: 135 },
    }),
  ).toEqual({ x: -1, y: 1.55, z: 2, rotationY: 135 });
});
