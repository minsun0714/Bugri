import * as Zdog from "zdog";
import { bugri } from "@/components/shop/zdog/bugri";
import {
  Category,
  DeskTool,
  DeskView,
} from "@/api/constants";
import type { DeskTransform } from "@/api/contracts";
import type { DeskSceneState } from "@/components/shop/zdog/scene-state";
import { createPicker } from "@/components/shop/zdog/picking";
import {
  deskParts,
  model,
} from "@/components/shop/zdog/models";
import {
  constrainTransform,
  defaultTransforms,
  tableHeight,
} from "@/lib/desk-spatial";
import { type MovableCategory } from "@/lib/desk-layout";

const radians = (value: number) => (value * Math.PI) / 180;

export function createDeskEngine(
  host: HTMLElement,
  initial: DeskSceneState,
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
  const picker = createPicker();
  const owners = new Map<
    Zdog.Anchor,
    MovableCategory | null
  >();
  let content: Zdog.Anchor | null = null;
  let rotationHandle: Zdog.Anchor | null = null;
  let framingHeight = 300;
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
    zoom: number;
    category: MovableCategory | null;
    transform: DeskTransform | null;
    next: DeskTransform | null;
    tool: DeskTool;
    moved: boolean;
    handle: boolean;
  } | null = null;

  function rebuild() {
    content?.remove();
    content = new Zdog.Anchor({ addTo: scene });
    anchors.clear();
    owners.clear();
    const { equipment } = state;
    if (equipment.BACKGROUND)
      model(content, equipment.BACKGROUND);
    // Draw lower objects with the legs, then the tabletop, then raised objects.
    const desk = new Zdog.Group({ addTo: content });
    const lower = new Zdog.Group({
      addTo: desk,
      updateSort: true,
    });
    const top = new Zdog.Group({
      addTo: desk,
      updateSort: true,
    });
    const upper = new Zdog.Group({
      addTo: desk,
      updateSort: true,
    });
    deskParts(lower, top, equipment.DESK ?? "default");
    owners.set(bugri(lower), null);
    anchors.set(Category.DESK, desk);
    for (const category of [
      Category.KEYBOARD,
      Category.MONITOR,
      Category.ACCESSORY,
    ]) {
      const id = equipment[category];
      const value =
        state.transforms[category] ??
        defaultTransforms[category];
      if (id)
        anchors.set(
          category,
          model(value.y >= tableHeight ? upper : lower, id),
        );
    }
    anchors.forEach((anchor, category) =>
      owners.set(anchor, category),
    );
    createHandle();
  }

  function createHandle() {
    rotationHandle = null;
    if (state.directManipulation) return;
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
    if (
      !state.readOnly &&
      state.tool === DeskTool.HEIGHT &&
      state.selected &&
      state.selected !== Category.DESK
    ) {
      const anchor = anchors.get(state.selected);
      if (anchor) {
        rotationHandle = new Zdog.Anchor({
          addTo: anchor,
          scale: {
            y: 1 / Math.max(0.2, Math.cos(radians(pitch))),
          },
        });
        new Zdog.Shape({
          addTo: rotationHandle,
          path: [{ y: -10 }, { y: -90 }],
          stroke: 4,
          color: "#6544dc",
        });
        new Zdog.Shape({
          addTo: rotationHandle,
          path: [
            { x: -9, y: -78 },
            { y: -90 },
            { x: 9, y: -78 },
          ],
          closed: false,
          stroke: 4,
          color: "#6544dc",
        });
      }
    }
  }

  function render() {
    // Zdog caches each group's draw list. Rebuild when an item crosses the
    // tabletop or the selected gizmo changes, rather than reparent cached shapes.
    const key = JSON.stringify([
      state.equipment,
      state.selected,
      state.tool,
      state.readOnly,
      [
        Category.KEYBOARD,
        Category.MONITOR,
        Category.ACCESSORY,
      ].map(
        (category) =>
          (
            state.transforms[category] ??
            defaultTransforms[category]
          ).y >= tableHeight,
      ),
    ]);
    if (key !== equipmentKey) {
      equipmentKey = key;
      rebuild();
    }
    const { width, height } = host.getBoundingClientRect();
    illustration.setSize(width || 600, height || 420);
    if (!drag || drag.tool === DeskTool.CAMERA) {
      const desk =
        state.transforms.DESK ?? defaultTransforms.DESK;
      let radius = 3.7;
      framingHeight = 300;
      for (const category of anchors.keys()) {
        if (category === Category.DESK) continue;
        const value =
          state.transforms[category] ??
          defaultTransforms[category];
        const objectHeight =
          category === Category.MONITOR
            ? 138
            : category === Category.ACCESSORY
              ? 85
              : 12;
        framingHeight = Math.max(
          framingHeight,
          value.y * 100 + objectHeight,
        );
        radius = Math.max(
          radius,
          Math.hypot(value.x, value.z) + 1,
        );
      }
      radius += Math.hypot(desk.x, desk.z);
      const spanX = Math.max(850, radius * 200 + 80);
      const spanY = Math.max(
        570,
        radius * 200 * Math.sin(radians(pitch)) +
          framingHeight * Math.cos(radians(pitch)) +
          80,
      );
      zoom = Math.min(
        (width || 600) / spanX,
        (height || 420) / spanY,
      );
    }
    illustration.zoom = zoom;
    scene.rotate.set({
      x: -radians(pitch),
      y: radians(yaw),
    });
    illustration.translate.y =
      (framingHeight / 2) * Math.cos(radians(pitch)) * zoom;
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
    if (rotationHandle && state.tool === DeskTool.HEIGHT)
      rotationHandle.scale.y =
        1 / Math.max(0.2, Math.cos(radians(pitch)));
    illustration.updateRenderGraph();
    if (state.directManipulation && !state.readOnly) {
      const bounds = picker.render(
        illustration,
        owners,
        width || 600,
        height || 420,
        zoom,
        state.selected,
      );
      state.onSelectionBounds?.(bounds);
    } else state.onSelectionBounds?.(null);
  }

  function pointerDown(
    event: PointerEvent,
    handleTool?: DeskTool,
  ) {
    if (event.button !== 0 || drag || state.disabled)
      return;
    let tool = state.readOnly
      ? DeskTool.CAMERA
      : state.tool;
    let category =
      state.readOnly || tool === DeskTool.CAMERA
        ? null
        : state.selected;
    if (state.directManipulation && !state.readOnly) {
      if (handleTool && state.selected) {
        category = state.selected;
        tool = handleTool;
      } else {
        const box = canvas.getBoundingClientRect();
        const hit = picker.hit(
          event.clientX - box.x,
          event.clientY - box.y,
        );
        category =
          hit &&
          state.equipment[hit] &&
          (!state.editableCategories ||
            state.editableCategories.includes(hit))
            ? hit
            : null;
        tool = category ? DeskTool.MOVE : DeskTool.CAMERA;
        state = { ...state, selected: category };
        if (category) state.onSelect?.(category);
        else state.onDeselect?.();
      }
    }
    if (!category && tool !== DeskTool.CAMERA) return;
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
      zoom,
      category,
      transform,
      next: null,
      tool,
      moved: false,
      handle: Boolean(handleTool),
    };
    canvas.setPointerCapture(event.pointerId);
    if (state.directManipulation) render();
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
    else if (drag.tool === DeskTool.HEIGHT) {
      if (category === Category.DESK) return;
      next.y -=
        dy /
        drag.zoom /
        100 /
        Math.max(0.2, Math.cos(radians(drag.pitch)));
    } else {
      const cameraAngle = radians(drag.yaw);
      const screenX = dx / drag.zoom / 100;
      const screenZ =
        dy /
        drag.zoom /
        100 /
        Math.sin(radians(drag.pitch));
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
    const { category, moved, handle, transform, tool } =
      drag;
    let { next } = drag;
    if (handle && !moved && category && transform) {
      next = constrainTransform(category, {
        ...transform,
        ...(tool === DeskTool.ROTATE
          ? { rotationY: transform.rotationY + 15 }
          : { y: transform.y + 0.1 }),
      });
    }
    drag = null;
    canvas.releasePointerCapture(event.pointerId);
    if (
      (moved || handle) &&
      category &&
      next &&
      !state.disabled
    )
      state.onCommit?.(category, next);
  }

  function keyDown(event: KeyboardEvent) {
    if (drag && event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  }

  window.addEventListener("keydown", keyDown);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("lostpointercapture", cancel);
  const resize = new ResizeObserver(render);
  resize.observe(host);
  render();

  return {
    beginHandle(event: PointerEvent, tool: DeskTool) {
      pointerDown(event, tool);
    },
    sync(next: DeskSceneState) {
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
      window.removeEventListener("keydown", keyDown);
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
