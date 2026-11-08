import { Category, DeskObject } from "@/api/constants";
import { tabletopDrop } from "@/lib/desk-surface";
import { defaultTransforms } from "@/lib/desk-spatial";

const desk = defaultTransforms.DESK;
const transform = defaultTransforms.BUGRI;

function drop(screen: { x: number; y: number }) {
  return tabletopDrop({
    category: DeskObject.BUGRI,
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
      category: DeskObject.BUGRI,
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

test("a camera at or below the tabletop cannot snap onto its hidden upper face", () => {
  for (const pitch of [0, -30, -85]) {
    expect(
      tabletopDrop({
        category: DeskObject.BUGRI,
        screen: { x: 0, y: 0 },
        yaw: 45,
        pitch,
        center: { x: 0, z: 0 },
        desk,
        itemFrame: desk,
        transform,
      }),
    ).toBeNull();
  }
});

test("feet touching the edge are supported while a pointer outside remains free", () => {
  const request = {
    category: DeskObject.BUGRI,
    screen: { x: 2.2, y: -1.55 * Math.cos(Math.PI / 6) },
    yaw: 0,
    pitch: 30,
    center: { x: 0, z: 0 },
    desk,
    itemFrame: desk,
    transform,
  };

  expect(tabletopDrop(request)).toBeNull();
  expect(
    tabletopDrop({
      ...request,
      contact: true,
    }),
  ).toMatchObject({ x: 1.6, y: 1.55, z: 0 });
  expect(
    tabletopDrop({
      ...request,
      contact: true,
      screen: { ...request.screen, x: 2.5 },
    }),
  ).toBeNull();
});

test.each([
  [Category.KEYBOARD, 0, 1.325, 0.94],
  [Category.KEYBOARD, 90, 1.74, 0.525],
  [Category.MONITOR, 0, 1.625, 0.975],
  [Category.ACCESSORY, 0, 1.79, 0.99],
] as const)(
  "%s at %s degrees keeps its actual base inside the tabletop",
  (category, rotationY, x, z) => {
    const request = {
      category,
      screen: {
        x: 1.95,
        y: -1.55 * Math.cos(Math.PI / 6) + 0.59,
      },
      yaw: 0,
      pitch: 30,
      center: { x: 0, z: 0 },
      desk,
      itemFrame: desk,
      transform: {
        ...defaultTransforms[category],
        y: 0,
        rotationY,
      },
    };

    expect(tabletopDrop(request)).toEqual({
      x,
      y: 1.55,
      z,
      rotationY,
    });
  },
);
