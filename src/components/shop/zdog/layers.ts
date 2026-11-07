import * as Zdog from "zdog";
import type { SceneTarget } from "@/components/shop/zdog/scene-state";

/** Preserve each object's 3D geometry while composing explicit object layers. */
export function paintLayers(
  root: Zdog.Anchor,
  context: CanvasRenderingContext2D,
  owners: Map<Zdog.Anchor, SceneTarget | null>,
  order: readonly SceneTarget[],
) {
  const paint = () =>
    Zdog.Anchor.prototype.renderGraphCanvas.call(
      root,
      context,
    );
  if (!order.length) {
    paint();
    return;
  }
  const shapes: {
    shape: Zdog.Shape;
    owner: SceneTarget | null;
    visible: boolean;
  }[] = [];
  function visit(
    node: Zdog.Anchor,
    inherited: SceneTarget | null,
  ) {
    const owner = owners.has(node)
      ? (owners.get(node) ?? null)
      : inherited;
    if (node instanceof Zdog.Shape)
      shapes.push({
        shape: node,
        owner,
        visible: node.visible,
      });
    const { children } = node as Zdog.Anchor & {
      children: Zdog.Anchor[];
    };
    children.forEach((child) => visit(child, owner));
  }
  visit(root, null);
  try {
    for (const target of [null, ...order]) {
      for (const { shape, owner, visible } of shapes)
        shape.visible = visible && owner === target;
      paint();
    }
  } finally {
    for (const { shape, visible } of shapes)
      shape.visible = visible;
  }
}
