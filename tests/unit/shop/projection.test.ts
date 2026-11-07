import * as Zdog from "zdog";
import { createSceneProjection } from "@/components/shop/zdog/projection";

it.each([0, 30, 60])(
  "projects furniture and room vertices identically at pitch %s",
  (pitch) => {
    const projection = createSceneProjection(800, pitch);
    const root = new Zdog.Anchor({ translate: { y: 70 } });
    const scene = new Zdog.Anchor({
      addTo: root,
      rotate: { x: (-pitch * Math.PI) / 180 },
    });
    const shape = new Zdog.Shape({
      addTo: scene,
      path: [
        { x: 120, y: -155, z: 220 },
        { x: -170, y: 0, z: -95 },
      ],
      stroke: 5,
    });
    root.updateGraph();
    const restore = projection.projectGraph(root, 70);
    const { pathCommands } = shape as unknown as {
      pathCommands: { renderPoints: Zdog.Vector[] }[];
    };
    for (const [index, point] of [
      { x: 120, y: -155, z: 220 },
      { x: -170, y: 0, z: -95 },
    ].entries()) {
      const expected = projection.project(point);
      const [actual] = pathCommands[index].renderPoints;
      expect(actual.x).toBeCloseTo(expected.x);
      expect(actual.y).toBeCloseTo(expected.y + 70);
    }
    restore();
    expect(shape.stroke).toBe(5);
  },
);

it.each([15, 30, 60])(
  "recovers the floor and tabletop contact from perspective at pitch %s",
  (pitch) => {
    const projection = createSceneProjection(800, pitch);
    for (const y of [0, -155]) {
      const point = { x: 175, y, z: 95 };
      const projected = projection.project(point);
      const recovered = projection.onPlane(projected, y)!;
      expect(recovered.x).toBeCloseTo(point.x);
      expect(recovered.z).toBeCloseTo(point.z);
      const vertical = projection.atDepth(
        projected,
        point.z,
      );
      expect(vertical.x).toBeCloseTo(point.x);
      expect(vertical.y).toBeCloseTo(point.y);
    }
  },
);
