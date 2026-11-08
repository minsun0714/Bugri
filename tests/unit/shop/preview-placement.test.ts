import { initialPreviewTransform } from "@/components/shop/preview-placement";
import { Category } from "@/api/constants";

test("adds a desk beside the rotated existing desk without mutating its saved placement", () => {
  const saved = { x: 2, y: 0, z: -1, rotationY: 90 };
  expect(
    initialPreviewTransform(
      Category.DESK,
      { DESK: "desk-1" },
      { DESK: saved },
    ),
  ).toEqual({ x: 5.4, y: 0, z: -1, rotationY: 90 });
  expect(saved).toEqual({
    x: 2,
    y: 0,
    z: -1,
    rotationY: 90,
  });
});

test("adds a same-category object beside its counterpart and keeps the counterpart height and orientation", () => {
  const saved = { x: 1, y: 2, z: 3, rotationY: 45 };
  expect(
    initialPreviewTransform(
      Category.KEYBOARD,
      { KEYBOARD: "keyboard-1" },
      { KEYBOARD: saved },
    ),
  ).toEqual({ x: 2.7, y: 2, z: 3, rotationY: 45 });
  expect(
    initialPreviewTransform(Category.KEYBOARD, {}, {}),
  ).toEqual({ x: -0.45, y: 1.55, z: 0.65, rotationY: 0 });
});
