import * as Zdog from "zdog";
import { Category, DeskObject } from "@/api/constants";
import {
  SceneObject,
  type SceneTarget,
} from "@/components/shop/zdog/scene-state";
import type { SelectionBounds } from "@/components/shop/zdog/scene-state";

const colors: Record<SceneTarget, string> = {
  PREVIEW: "#ff00ff",
  BUGRI: "#00ffff",
  KEYBOARD: "#ff0000",
  MONITOR: "#00ff00",
  ACCESSORY: "#0000ff",
  DESK: "#ffff00",
};

function categoryAt(
  data: Uint8ClampedArray,
  offset: number,
): SceneTarget | null {
  if (data[offset + 3] !== 255) return null;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  if (r === 0 && g === 255 && b === 255)
    return DeskObject.BUGRI;
  if (r === 255 && g === 0 && b === 255)
    return SceneObject.PREVIEW;
  if (r === 255 && g === 0 && b === 0)
    return Category.KEYBOARD;
  if (r === 0 && g === 255 && b === 0)
    return Category.MONITOR;
  if (r === 0 && g === 0 && b === 255)
    return Category.ACCESSORY;
  if (r === 255 && g === 255 && b === 0)
    return Category.DESK;
  return null;
}

/** Render the same sorted geometry into an offscreen colour map. Occlusion and
 * backface culling therefore match the visible scene, including below-table items. */
export function createPicker() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });
  if (!context)
    throw new Error("Canvas picking unavailable");
  let data = new Uint8ClampedArray();

  function render(
    illustration: Zdog.Illustration,
    owners: Map<Zdog.Anchor, SceneTarget | null>,
    width: number,
    height: number,
    zoom: number,
    selected: SceneTarget | null,
  ): SelectionBounds | null {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const restore: (() => void)[] = [];
    function visit(
      node: Zdog.Anchor,
      owner: SceneTarget | null,
    ) {
      if (owners.has(node))
        owner = owners.get(node) ?? null;
      if (node instanceof Zdog.Shape) {
        const { color, backface } = node;
        restore.push(() => {
          node.color = color;
          node.backface = backface;
        });
        node.color = owner ? colors[owner] : "#000000";
        if (typeof backface === "string")
          node.backface = node.color;
      }
      // Zdog 1.x keeps children on Anchor; its DefinitelyTyped surface omits it.
      const { children } = node as Zdog.Anchor & {
        children: Zdog.Anchor[];
      };
      children.forEach((child) => visit(child, owner));
    }
    try {
      visit(illustration, null);
      context!.save();
      context!.translate(width / 2, height / 2);
      context!.scale(zoom, zoom);
      context!.lineCap = "round";
      context!.lineJoin = "round";
      // Bypass Illustration's renderer bound to the visible canvas.
      Zdog.Anchor.prototype.renderGraphCanvas.call(
        illustration,
        context!,
      );
    } finally {
      context!.restore();
      restore.reverse().forEach((reset) => reset());
    }
    data = context!.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    ).data;
    if (!selected) return null;
    let left = canvas.width;
    let top = canvas.height;
    let right = -1;
    let bottom = -1;
    for (
      let offset = 0;
      offset < data.length;
      offset += 4
    ) {
      if (categoryAt(data, offset) !== selected) continue;
      const pixel = offset / 4;
      const x = pixel % canvas.width;
      const y = Math.floor(pixel / canvas.width);
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
    return right < 0
      ? null
      : {
          category: selected,
          x: left - 4,
          y: top - 4,
          width: right - left + 9,
          height: bottom - top + 9,
          viewportWidth: width,
          viewportHeight: height,
        };
  }

  return {
    render,
    hit(x: number, y: number) {
      if (
        x < 0 ||
        y < 0 ||
        x >= canvas.width ||
        y >= canvas.height
      )
        return null;
      return categoryAt(
        data,
        (Math.floor(y) * canvas.width + Math.floor(x)) * 4,
      );
    },
  };
}
