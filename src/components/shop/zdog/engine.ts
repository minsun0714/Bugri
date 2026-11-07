import * as Zdog from "zdog";
import {
  Category,
  DeskTool,
  DeskView,
} from "@/api/constants";
import type { DeskTransform } from "@/api/contracts";
import type { SceneState } from "@/components/shop/three/engine";
import { model } from "@/components/shop/zdog/models";
import {
  constrainTransform,
  defaultTransforms,
} from "@/lib/desk-spatial";
import { type MovableCategory } from "@/lib/desk-layout";

const radians = (value: number) => (value * Math.PI) / 180;

export function createDeskEngine(
  host: HTMLElement,
  initial: SceneState,
) {
  let state = initial;
  const canvas = document.createElement("canvas");
  canvas.className =
    "block h-full w-full touch-none rounded-2xl";
  canvas.setAttribute("aria-label", "3D 데스크 캔버스");
  host.appendChild(canvas);
  const illustration = new Zdog.Illustration({
    element: canvas,
  });
  const scene = new Zdog.Anchor({ addTo: illustration });
  let content: Zdog.Anchor | null = null;
  let rotationHandle: Zdog.Ellipse | null = null;
  const anchors = new Map<MovableCategory, Zdog.Anchor>();
  let equipmentKey = "";
  let yaw = 45;
  let pitch = 30;
  let zoom = 1;
  let drag: {
    id: number;
    x: number;
    y: number;
    yaw: number;
    pitch: number;
    category: MovableCategory | null;
    transform: DeskTransform | null;
    next: DeskTransform | null;
    tool: DeskTool;
    moved: boolean;
  } | null = null;

  function rebuild() {
    content?.remove();
    content = new Zdog.Anchor({ addTo: scene });
    anchors.clear();
    const { equipment } = state;
    if (equipment.BACKGROUND)
      model(content, equipment.BACKGROUND);
    const desk = new Zdog.Anchor({ addTo: content });
    model(desk, equipment.DESK ?? "default");
    anchors.set(Category.DESK, desk);
    for (const category of [
      Category.KEYBOARD,
      Category.MONITOR,
      Category.ACCESSORY,
    ]) {
      const id = equipment[category];
      if (id) anchors.set(category, model(desk, id));
    }
  }

  function render() {
    const key = JSON.stringify(state.equipment);
    if (key !== equipmentKey) {
      equipmentKey = key;
      rebuild();
    }
    const { width, height } = host.getBoundingClientRect();
    illustration.setSize(width || 600, height || 420);
    zoom = Math.min(
      (width || 600) / 850,
      (height || 420) / 570,
    );
    illustration.zoom = zoom;
    scene.rotate.set({
      x: -radians(pitch),
      y: radians(yaw),
    });
    illustration.translate.y = 55 * zoom;
    anchors.forEach((anchor, category) => {
      const value =
        state.transforms[category] ??
        defaultTransforms[category];
      anchor.translate.set({
        x: value.x * 100,
        y: -value.y * 100,
        z: value.z * 100,
      });
      anchor.rotate.y = -radians(value.rotationY);
    });
    rotationHandle?.remove();
    rotationHandle = null;
    if (
      !state.readOnly &&
      state.tool === DeskTool.ROTATE &&
      state.selected
    ) {
      const anchor = anchors.get(state.selected);
      if (anchor)
        rotationHandle = new Zdog.Ellipse({
          addTo: anchor,
          diameter:
            state.selected === Category.DESK ? 490 : 195,
          rotate: { x: Math.PI / 2 },
          translate: { y: -2 },
          stroke: 4,
          color: "#6544dc",
        });
    }
    illustration.updateRenderGraph();
  }

  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || drag || state.disabled)
      return;
    const category =
      state.readOnly || state.tool === DeskTool.CAMERA
        ? null
        : state.selected;
    if (
      !category &&
      !state.readOnly &&
      state.tool !== DeskTool.CAMERA
    )
      return;
    const transform = category
      ? (state.transforms[category] ??
        defaultTransforms[category])
      : null;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      yaw,
      pitch,
      category,
      transform,
      next: null,
      tool: state.readOnly ? DeskTool.CAMERA : state.tool,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent) {
    if (
      !drag ||
      drag.id !== event.pointerId ||
      state.disabled
    )
      return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.moved ||= Math.hypot(dx, dy) > 2;
    if (drag.tool === DeskTool.CAMERA) {
      yaw = drag.yaw + dx * 0.5;
      pitch = Math.max(
        10,
        Math.min(85, drag.pitch - dy * 0.3),
      );
      state.onCamera?.(
        Math.round(((yaw % 360) + 360) % 360),
      );
      render();
      return;
    }
    const { category, transform } = drag;
    if (
      !category ||
      !transform ||
      !state.equipment[category]
    )
      return;
    let next = { ...transform };
    if (drag.tool === DeskTool.ROTATE)
      next.rotationY += dx * 0.6;
    else {
      const cameraAngle = radians(drag.yaw);
      const screenX = dx / zoom / 100;
      const screenZ =
        dy / zoom / 100 / Math.sin(radians(drag.pitch));
      let x =
        Math.cos(cameraAngle) * screenX +
        Math.sin(cameraAngle) * screenZ;
      let z =
        -Math.sin(cameraAngle) * screenX +
        Math.cos(cameraAngle) * screenZ;
      if (category !== Category.DESK) {
        const deskAngle = -radians(
          (state.transforms.DESK ?? defaultTransforms.DESK)
            .rotationY,
        );
        const localX =
          Math.cos(deskAngle) * x + Math.sin(deskAngle) * z;
        z =
          -Math.sin(deskAngle) * x +
          Math.cos(deskAngle) * z;
        x = localX;
      }
      next = {
        ...next,
        x: transform.x + x,
        z: transform.z + z,
      };
    }
    next = constrainTransform(category, next);
    drag.next = next;
    state.onPreview?.(category, next);
  }

  function cancel() {
    if (!drag) return;
    const { id } = drag;
    drag = null;
    state.onCancel?.();
    if (canvas.hasPointerCapture(id))
      canvas.releasePointerCapture(id);
  }

  function pointerUp(event: PointerEvent) {
    if (!drag || drag.id !== event.pointerId) return;
    const { category, next, moved } = drag;
    drag = null;
    canvas.releasePointerCapture(event.pointerId);
    if (moved && category && next && !state.disabled)
      state.onCommit?.(category, next);
  }

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("lostpointercapture", cancel);
  const resize = new ResizeObserver(render);
  resize.observe(host);
  render();

  return {
    sync(next: SceneState) {
      state = next;
      render();
    },
    view(view: DeskView) {
      cancel();
      yaw = view === DeskView.ANGLED ? 45 : 0;
      pitch = view === DeskView.TOP ? 85 : 30;
      state.onCamera?.(yaw);
      render();
    },
    cancel,
    dispose() {
      resize.disconnect();
      canvas.removeEventListener(
        "pointerdown",
        pointerDown,
      );
      canvas.removeEventListener(
        "pointermove",
        pointerMove,
      );
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener(
        "lostpointercapture",
        cancel,
      );
      content?.remove();
      canvas.remove();
    },
  };
}
