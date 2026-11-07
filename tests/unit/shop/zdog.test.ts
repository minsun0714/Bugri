import {
  constrain,
  initialScene,
  planeDelta,
} from "@/components/shop/zdog/scene";

test("rotated keyboard stays inside the desk", () => {
  const result = constrain("keyboard", {
    x: 999,
    z: -999,
    angle: 90,
  });
  expect(result).toEqual({ x: 155, z: -41, angle: 90 });
});

test("screen motion maps to the tabletop at front and side views", () => {
  const state = initialScene();
  expect(
    planeDelta(10, 0, { ...state, yaw: 0 }, 1),
  ).toEqual({ x: 10, z: 0 });
  const side = planeDelta(10, 0, { ...state, yaw: 90 }, 1);
  expect(side.x).toBeCloseTo(0);
  expect(side.z).toBeCloseTo(-10);
});
