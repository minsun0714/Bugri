import { createSceneProjection } from "@/components/shop/zdog/projection";
import * as Zdog from "zdog";
import { room } from "@/components/shop/zdog/room";
import { roomTheme } from "@/components/shop/room-theme";

type Point = { x: number; y: number; z: number };

/** A camera inside the room, rather than an orthographic view of a stage. */
export function createRoomEnvironment() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  const windows = new Map<string, HTMLCanvasElement>();
  const windowPixels = new Map<string, ImageData>();
  const patch = document.createElement("canvas");
  const patchContext = patch.getContext("2d")!;

  function windowTexture(productId: string) {
    const cached = windows.get(productId);
    if (cached) return cached;
    const texture = document.createElement("canvas");
    texture.width = 400;
    texture.height = 420;
    const illustration = new Zdog.Illustration({
      element: texture,
    });
    const source = new Zdog.Anchor();
    room(source, productId);
    const { children } =
      source as unknown as Zdog.Anchor & {
        children: Zdog.Anchor[];
      };
    const frame = children.find(
      (child) => child instanceof Zdog.Group,
    )!;
    frame.copyGraph({
      addTo: illustration,
      translate: { x: 0, y: 0, z: 0 },
      scale: 1,
    });
    illustration.updateRenderGraph();
    windows.set(productId, texture);
    windowPixels.set(
      productId,
      texture
        .getContext("2d")!
        .getImageData(0, 0, texture.width, texture.height),
    );
    return texture;
  }

  return (
    target: CanvasRenderingContext2D,
    productId: string,
    yaw: number,
    pitch: number,
    zoom: number,
    distance: number,
    verticalOffset: number,
    radius: number,
  ) => {
    const { width, height } = target.canvas;
    if (
      canvas.width !== width ||
      canvas.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;
    }
    const theme = roomTheme(productId);
    const angle = (yaw * Math.PI) / 180;
    const tilt = (pitch * Math.PI) / 180;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const near = distance * 0.02;
    const rotate = ({ x, y, z }: Point): Point => ({
      x: x * cosine - z * sine,
      y,
      z: x * sine + z * cosine,
    });
    const camera = createSceneProjection(distance, pitch);
    const project = (point: Point) => {
      const projected = camera.project(point);
      return {
        x: width / 2 + projected.x * zoom,
        y: height / 2 + verticalOffset + projected.y * zoom,
      };
    };
    const clip = (points: Point[]) => {
      const result: Point[] = [];
      points.forEach((current, index) => {
        const previous =
          points[
            (index + points.length - 1) % points.length
          ];
        const inside = current.z <= distance - near;
        const previousInside =
          previous.z <= distance - near;
        if (inside !== previousInside) {
          const fraction =
            (distance - near - previous.z) /
            (current.z - previous.z);
          result.push({
            x:
              previous.x +
              (current.x - previous.x) * fraction,
            y:
              previous.y +
              (current.y - previous.y) * fraction,
            z: distance - near,
          });
        }
        if (inside) result.push(current);
      });
      return result;
    };
    const polygon = (points: Point[], color: string) => {
      const vertices = clip(points.map(rotate)).map(
        project,
      );
      if (vertices.length < 3) return;
      context.beginPath();
      vertices.forEach(({ x, y }, index) => {
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
      context.fillStyle = color;
      context.fill();
    };
    context.clearRect(0, 0, width, height);
    context.fillStyle = theme.floor;
    context.fillRect(0, 0, width, height);
    const corners = [
      { x: -radius, z: -radius },
      { x: radius, z: -radius },
      { x: radius, z: radius },
      { x: -radius, z: radius },
    ];
    const wallDepths = corners.map((a, index) => {
      const b = corners[(index + 1) % corners.length];
      return rotate({
        x: (a.x + b.x) / 2,
        y: 0,
        z: (a.z + b.z) / 2,
      }).z;
    });
    const nearest = Math.max(...wallDepths);
    const open = wallDepths.map(
      (depth) => nearest - depth < radius * 0.000001,
    );
    // Open the camera-facing side of the rectangular room. Continue the
    // adjoining side walls past the viewport instead of showing the near
    // corners as extra folds when the field of view widens on zoom-out.
    for (let index = 0; index < corners.length; index++) {
      if (open[index]) continue;
      const originalA = corners[index];
      const originalB =
        corners[(index + 1) % corners.length];
      const extend = (
        a: { x: number; z: number },
        b: { x: number; z: number },
      ) => ({
        x: a.x + (a.x - b.x) * 100,
        z: a.z + (a.z - b.z) * 100,
      });
      const a = open[
        (index + corners.length - 1) % corners.length
      ]
        ? extend(originalA, originalB)
        : originalA;
      const b = open[(index + 1) % corners.length]
        ? extend(originalB, originalA)
        : originalB;
      polygon(
        [
          { ...a, y: 0 },
          { ...b, y: 0 },
          { ...b, y: -radius * 8 },
          { ...a, y: -radius * 8 },
        ],
        index % 2 ? theme.side : theme.wall,
      );
    }
    const texture = windowTexture(productId);
    const frame = [
      {
        x: -radius * 0.3,
        y: -radius * 0.5,
        z: -radius + 1,
      },
      { x: radius * 0.1, y: -radius * 0.5, z: -radius + 1 },
      {
        x: radius * 0.1,
        y: -radius * 0.08,
        z: -radius + 1,
      },
      {
        x: -radius * 0.3,
        y: -radius * 0.08,
        z: -radius + 1,
      },
    ].map(rotate);
    if (
      !open[0] &&
      frame.every(({ z }) => z < distance - near)
    ) {
      const projected = frame.map(project);
      const left = Math.max(
        0,
        Math.floor(
          Math.min(...projected.map(({ x }) => x)),
        ),
      );
      const top = Math.max(
        0,
        Math.floor(
          Math.min(...projected.map(({ y }) => y)),
        ),
      );
      const right = Math.min(
        width,
        Math.ceil(Math.max(...projected.map(({ x }) => x))),
      );
      const bottom = Math.min(
        height,
        Math.ceil(Math.max(...projected.map(({ y }) => y))),
      );
      if (right > left && bottom > top) {
        patch.width = right - left;
        patch.height = bottom - top;
        const pixels = patchContext.createImageData(
          patch.width,
          patch.height,
        );
        const source = windowPixels.get(productId)!;
        // Invert the wall-plane projection per pixel. This avoids seams between
        // affine triangles and keeps the existing curved window frame intact.
        for (let row = 0; row < patch.height; row++) {
          for (
            let column = 0;
            column < patch.width;
            column++
          ) {
            const screenX =
              (left + column + 0.5 - width / 2) / zoom;
            const screenY =
              (top +
                row +
                0.5 -
                height / 2 -
                verticalOffset) /
              zoom;
            const wallZ = -radius + 1;
            const denominator =
              distance * cosine + screenX * sine;
            if (Math.abs(denominator) < 0.000001) continue;
            const worldX =
              (screenX * (distance - cosine * wallZ) +
                distance * sine * wallZ) /
              denominator;
            const depth = worldX * sine + wallZ * cosine;
            const worldY =
              ((screenY * (distance - depth)) / distance -
                depth * Math.sin(tilt)) /
              Math.cos(tilt);
            const u =
              (worldX + radius * 0.3) / (radius * 0.4);
            const v =
              (worldY + radius * 0.5) / (radius * 0.42);
            if (u < 0 || u >= 1 || v < 0 || v >= 1)
              continue;
            const tx = u * (texture.width - 1);
            const ty = v * (texture.height - 1);
            const x0 = Math.floor(tx);
            const y0 = Math.floor(ty);
            const dx = tx - x0;
            const dy = ty - y0;
            const offset = (row * patch.width + column) * 4;
            for (let channel = 0; channel < 4; channel++) {
              const at = (x: number, y: number) =>
                source.data[
                  (y * texture.width + x) * 4 + channel
                ];
              pixels.data[offset + channel] =
                at(x0, y0) * (1 - dx) * (1 - dy) +
                at(
                  Math.min(x0 + 1, texture.width - 1),
                  y0,
                ) *
                  dx *
                  (1 - dy) +
                at(
                  x0,
                  Math.min(y0 + 1, texture.height - 1),
                ) *
                  (1 - dx) *
                  dy +
                at(
                  Math.min(x0 + 1, texture.width - 1),
                  Math.min(y0 + 1, texture.height - 1),
                ) *
                  dx *
                  dy;
            }
          }
        }
        patchContext.putImageData(pixels, 0, 0);
        context.drawImage(patch, left, top);
      }
    }
    target.save();
    target.globalCompositeOperation = "destination-over";
    target.drawImage(canvas, 0, 0);
    target.restore();
  };
}
