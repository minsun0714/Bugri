import * as Zdog from "zdog";

type Point = { x: number; y: number; z: number };

/** Shared room/furnishing camera, before pixel scale and viewport translation. */
export function createSceneProjection(
  distance: number,
  pitch: number,
) {
  const angle = (pitch * Math.PI) / 180;
  const sine = Math.sin(angle);
  const cosine = Math.cos(angle);
  const factor = (depth: number) =>
    distance / Math.max(distance * 0.02, distance - depth);
  return {
    project({ x, y, z }: Point) {
      const scale = factor(z);
      return {
        x: x * scale,
        y: (y * cosine + z * sine) * scale,
      };
    },
    /** Recover yaw-space x/depth at a horizontal surface of known y. */
    onPlane(
      { x, y }: { x: number; y: number },
      height: number,
    ) {
      const denominator = y + distance * sine;
      if (Math.abs(denominator) < 0.000001) return null;
      const z =
        (distance * (y - height * cosine)) / denominator;
      if (z >= distance * 0.98) return null;
      const scale = factor(z);
      return { x: x / scale, y: height, z };
    },
    /** Drag vertically without changing camera depth. */
    atDepth({ x, y }: { x: number; y: number }, z: number) {
      const scale = factor(z);
      return {
        x: x / scale,
        y: (y / scale - z * sine) / cosine,
        z,
      };
    },
    projectGraph(root: Zdog.Anchor, offset: number) {
      const restore: (() => void)[] = [];
      function visit(node: Zdog.Anchor) {
        const shape = node as Zdog.Anchor & {
          renderOrigin: Zdog.Vector;
          renderNormal?: Zdog.Vector;
          children: Zdog.Anchor[];
          pathCommands?: { renderPoints: Zdog.Vector[] }[];
        };
        const depth = (point: Point) =>
          (point.y - offset) * sine + point.z * cosine;
        const scale = factor(depth(shape.renderOrigin));
        function projectPoint(point: Zdog.Vector) {
          const value = factor(depth(point));
          point.x *= value;
          point.y = (point.y - offset) * value + offset;
        }
        shape.pathCommands?.forEach(({ renderPoints }) =>
          renderPoints.forEach(projectPoint),
        );
        projectPoint(shape.renderOrigin);
        if (
          node instanceof Zdog.Shape &&
          typeof node.stroke === "number"
        ) {
          const { stroke } = node;
          node.stroke *= scale;
          restore.push(() => {
            node.stroke = stroke;
          });
        }
        if (
          node instanceof Zdog.Hemisphere &&
          shape.renderNormal
        ) {
          const normal = shape.renderNormal.copy();
          shape.renderNormal.multiply(scale);
          restore.push(() => {
            shape.renderNormal!.set(normal);
          });
        }
        shape.children.forEach(visit);
      }
      visit(root);
      return () => restore.forEach((reset) => reset());
    },
  };
}
