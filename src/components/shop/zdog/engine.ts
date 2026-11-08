import { createSceneProjection } from "@/components/shop/zdog/projection";
import { createRoomEnvironment } from "@/components/shop/zdog/room-perspective";
import { tabletopDrop } from "@/lib/desk-surface";
import { normalizeOrder } from "@/lib/desk-order";
import { paintLayers } from "@/components/shop/zdog/layers";
import { roomTheme } from "@/components/shop/room-theme";
import { lightRoomObjects } from "@/components/shop/zdog/room";
import * as Zdog from "zdog";
import { bugri } from "@/components/shop/zdog/bugri";
import {
  Category,
  DeskObject,
  DeskTool,
  DeskView,
} from "@/api/constants";
import type { DeskTransform } from "@/api/contracts";
import {
  SceneObject,
  type SceneTarget,
  type DeskSceneState,
} from "@/components/shop/zdog/scene-state";
import { createPicker } from "@/components/shop/zdog/picking";
import {
  deskParts,
  deskContactShadow,
  model,
} from "@/components/shop/zdog/models";
import {
  type SpatialTarget,
  constrainTransform,
  defaultTransforms,
  tableHeight,
} from "@/lib/desk-spatial";

const radians = (value: number) => (value * Math.PI) / 180;

export function createDeskEngine(
  host: HTMLElement,
  initial: DeskSceneState,
  interactionSurface: HTMLElement = host,
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
  let rug: Zdog.Anchor | null = null;
  let deskShadow: Zdog.Anchor | null = null;
  let previewDeskShadow: Zdog.Anchor | null = null;
  const picker = createPicker();
  const paintRoom = createRoomEnvironment();
  const owners = new Map<Zdog.Anchor, SceneTarget | null>();
  let content: Zdog.Anchor | null = null;
  let itemLayers: Zdog.Anchor[] = [];
  let previewAnchor: Zdog.Anchor | null = null;
  let rotationHandle: Zdog.Anchor | null = null;
  let framingHeight = 300;
  let framingRadius = 3.7;
  let framingKey = "";
  let framingCenter = { x: 0, z: 0 };
  let framingOrigin = { x: 0, z: 0 };
  let framingPoints: { x: number; z: number }[] = [];
  const anchors = new Map<SpatialTarget, Zdog.Anchor>();
  let equipmentKey = "";
  let yaw = 45;
  let pitch = 30;
  let zoom = 1;
  let userZoom = 1;
  let cameraDistance = 800;
  const cameraDepths = new Map<
    SpatialTarget | typeof SceneObject.PREVIEW,
    number
  >();
  let drag: {
    id: number;
    x: number;
    y: number;
    yaw: number;
    pitch: number;
    zoom: number;
    category: SpatialTarget | null;
    preview: boolean;
    transform: DeskTransform | null;
    next: DeskTransform | null;
    tool: DeskTool;
    moved: boolean;
    handle: boolean;
    baseOffset: { x: number; y: number } | null;
    cameraDepth: number;
    vertical: boolean | null;
  } | null = null;

  function rebuild() {
    content?.remove();
    content = new Zdog.Group({
      addTo: scene,
      updateSort: false,
    });
    anchors.clear();
    owners.clear();
    previewAnchor = null;
    const { equipment } = state;
    rug = equipment.BACKGROUND
      ? new Zdog.RoundedRect({
          addTo: content,
          width: 650,
          height: 460,
          cornerRadius: 75,
          rotate: { x: Math.PI / 2 },
          fill: true,
          stroke: false,
          color: roomTheme(equipment.BACKGROUND).rug,
          backface: false,
        })
      : null;
    deskShadow = deskContactShadow(content);
    previewDeskShadow =
      state.preview?.category === Category.DESK
        ? deskContactShadow(content)
        : null;
    // Keep the room behind the furnishings at every camera angle.
    const furnishings = new Zdog.Group({
      addTo: content,
      updateSort: true,
    });
    // Reverse surface occlusion when the camera moves below the desk.
    const desk = new Zdog.Group({ addTo: furnishings });
    const first = new Zdog.Group({
      addTo: desk,
      updateSort: true,
    });
    const top = new Zdog.Group({
      addTo: desk,
      updateSort: true,
    });
    const last = new Zdog.Group({
      addTo: desk,
      updateSort: true,
    });
    const [lower, upper] =
      pitch < 0 ? [last, first] : [first, last];
    deskParts(lower, top, equipment.DESK ?? "default");
    const lowerItems = new Zdog.Anchor({ addTo: lower });
    const upperItems = new Zdog.Anchor({ addTo: upper });
    itemLayers = [lowerItems, upperItems];
    anchors.set(
      DeskObject.BUGRI,
      bugri(
        (state.transforms.BUGRI ?? defaultTransforms.BUGRI)
          .y >= tableHeight
          ? upperItems
          : lowerItems,
      ),
    );
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
          model(
            value.y >= tableHeight
              ? upperItems
              : lowerItems,
            id,
          ),
        );
    }
    anchors.forEach((anchor, category) =>
      owners.set(anchor, category),
    );
    if (state.preview) {
      const { category, productId, transform } =
        state.preview;
      previewAnchor = model(
        category === Category.DESK
          ? furnishings
          : transform.y >= tableHeight
            ? upperItems
            : lowerItems,
        productId,
      );
      owners.set(previewAnchor, SceneObject.PREVIEW);
    }
    createHandle();
    lightRoomObjects(desk, equipment.BACKGROUND);
    if (
      previewAnchor &&
      state.preview?.category === Category.DESK
    )
      lightRoomObjects(previewAnchor, equipment.BACKGROUND);
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
      pitch < 0,
      state.preview && [
        state.preview.productId,
        state.preview.category,
        state.preview.transform.y >= tableHeight,
      ],
      state.selected,
      state.previewSelected,
      state.tool,
      state.readOnly,
      [
        Category.KEYBOARD,
        Category.MONITOR,
        Category.ACCESSORY,
        DeskObject.BUGRI,
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
    const nextFramingKey = JSON.stringify([
      state.equipment.DESK ?? "default",
      state.equipment.KEYBOARD,
      state.equipment.MONITOR,
      state.equipment.ACCESSORY,
      state.preview?.productId,
    ]);
    // Placement edits must not change the user's framing after a drop or save.
    // Fit a new composition once; resizing, orbit and wheel use that same extent.
    if (nextFramingKey !== framingKey) {
      const desk =
        state.transforms.DESK ?? defaultTransforms.DESK;
      const itemFrame = state.itemFrame ?? desk;
      const sizes: Record<
        SpatialTarget,
        { x: number; z: number; height: number }
      > = {
        DESK: { x: 2, z: 1.2, height: 155 },
        KEYBOARD: { x: 0.675, z: 0.26, height: 12 },
        MONITOR: { x: 0.85, z: 0.225, height: 138 },
        ACCESSORY: { x: 0.6, z: 0.4, height: 85 },
        BUGRI: { x: 0.73, z: 0.3, height: 110 },
      };
      framingPoints = [];
      framingHeight = 300;
      const include = (
        category: SpatialTarget,
        value: DeskTransform,
      ) => {
        const size = sizes[category];
        framingHeight = Math.max(
          framingHeight,
          value.y * 100 + size.height,
        );
        for (const x of [-size.x, size.x]) {
          for (const z of [-size.z, size.z]) {
            const point = new Zdog.Vector({ x, z })
              .rotate({ y: -radians(value.rotationY) })
              .add({ x: value.x, z: value.z });
            if (category !== Category.DESK)
              point
                .rotate({
                  y: -radians(itemFrame.rotationY),
                })
                .add({ x: itemFrame.x, z: itemFrame.z });
            framingPoints.push({ x: point.x, z: point.z });
          }
        }
      };
      for (const category of anchors.keys())
        include(
          category,
          state.transforms[category] ??
            defaultTransforms[category],
        );
      if (state.preview)
        include(
          state.preview.category,
          state.preview.transform,
        );
      const xs = framingPoints.map(({ x }) => x);
      const zs = framingPoints.map(({ z }) => z);
      framingOrigin = {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        z: (Math.min(...zs) + Math.max(...zs)) / 2,
      };
      framingRadius = Math.max(
        3.7,
        ...framingPoints.map(
          ({ x, z }) =>
            Math.hypot(
              x - framingOrigin.x,
              z - framingOrigin.z,
            ) + 0.4,
        ),
      );
      framingKey = nextFramingKey;
    }
    // Keep the entire opening composition centred at each azimuth. Reuse the
    // captured bounds so editing an item never pulls the camera along with it.
    const cosine = Math.cos(radians(yaw));
    const sine = Math.sin(radians(yaw));
    const projected = framingPoints.map(
      ({ x, z }) =>
        cosine * (x - framingOrigin.x) -
        sine * (z - framingOrigin.z),
    );
    const middle =
      (Math.min(...projected) + Math.max(...projected)) / 2;
    framingCenter = {
      x: framingOrigin.x + cosine * middle,
      z: framingOrigin.z - sine * middle,
    };
    // Perspective enlarges the near edge of the rug and furnishings. Reserve
    // framing space without changing the user's zoom or the room geometry.
    const perspectiveFit = state.equipment.BACKGROUND
      ? 0.8
      : 1;
    if (!drag || drag.tool === DeskTool.CAMERA) {
      const radius = framingRadius;
      const spanX = Math.max(850, radius * 200 + 80);
      const spanY = Math.max(
        570,
        radius * 200 * Math.abs(Math.sin(radians(pitch))) +
          framingHeight * Math.cos(radians(pitch)) +
          80,
      );
      zoom =
        userZoom *
        perspectiveFit *
        Math.min(
          (width || 600) / spanX,
          (height || 420) / spanY,
        );
    }
    cameraDistance = Math.max(800, framingRadius * 200);
    illustration.zoom = zoom;
    scene.rotate.set({
      x: -radians(pitch),
      y: radians(yaw),
    });
    scene.translate.set(
      new Zdog.Vector({
        x: -framingCenter.x * 100,
        z: -framingCenter.z * 100,
      }).rotate(scene.rotate),
    );
    illustration.translate.y =
      (framingHeight / 2) * Math.cos(radians(pitch)) * zoom;
    if (rug) {
      rug.translate.x = framingCenter.x * 100;
      rug.translate.z = framingCenter.z * 100;
    }
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
    // Preserve the opening room's item frame even when its desk is moved.
    // Compensate the parent transform without changing stored item coordinates.
    const desk =
      state.transforms.DESK ?? defaultTransforms.DESK;
    for (const [shadow, transform] of [
      [deskShadow, desk],
      [previewDeskShadow, state.preview?.transform],
    ] as const) {
      if (!shadow || !transform) continue;
      shadow.translate.set({
        x: transform.x * 100,
        y: 0,
        z: transform.z * 100,
      });
      shadow.rotate.y = -radians(transform.rotationY);
    }
    const itemFrame = state.itemFrame ?? desk;
    const offset = new Zdog.Vector({
      x: (itemFrame.x - desk.x) * 100,
      y: -(itemFrame.y - desk.y) * 100,
      z: (itemFrame.z - desk.z) * 100,
    }).rotate({ y: radians(desk.rotationY) });
    for (const layer of itemLayers) {
      layer.translate.set(offset);
      layer.rotate.y = radians(
        desk.rotationY - itemFrame.rotationY,
      );
    }
    if (previewAnchor && state.preview) {
      const { transform } = state.preview;
      previewAnchor.translate.set({
        x: transform.x * 100,
        y: -transform.y * 100,
        z: transform.z * 100,
      });
      previewAnchor.rotate.y = -radians(
        transform.rotationY,
      );
    }
    if (rotationHandle && state.tool === DeskTool.HEIGHT)
      rotationHandle.scale.y =
        1 / Math.max(0.2, Math.cos(radians(pitch)));
    const order = state.layerOrder?.length
      ? normalizeOrder(state.layerOrder, [
          ...anchors.keys(),
          ...(state.preview ? [SceneObject.PREVIEW] : []),
        ])
      : [];
    illustration.updateGraph();
    const perspective = Boolean(state.equipment.BACKGROUND);
    cameraDepths.clear();
    for (const [target, anchor] of [
      ...anchors.entries(),
      ...(previewAnchor
        ? [[SceneObject.PREVIEW, previewAnchor] as const]
        : []),
    ]) {
      const { renderOrigin } = anchor as Zdog.Anchor & {
        renderOrigin: Zdog.Vector;
      };
      cameraDepths.set(
        target,
        (renderOrigin.y - illustration.translate.y) *
          Math.sin(radians(pitch)) +
          renderOrigin.z * Math.cos(radians(pitch)),
      );
    }
    const restoreProjection = perspective
      ? createSceneProjection(
          cameraDistance,
          pitch,
        ).projectGraph(
          illustration,
          illustration.translate.y,
        )
      : () => {};
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(
      (zoom * canvas.width) / (width || 600),
      (zoom * canvas.height) / (height || 420),
    );
    context.lineCap = "round";
    context.lineJoin = "round";
    paintLayers(illustration, context, owners, order);
    context.restore();
    if (state.equipment.BACKGROUND) {
      context.save();
      context.beginPath();
      context.rect(
        0,
        0,
        canvas.width *
          Math.max(
            0,
            Math.min(1, state.backgroundReveal ?? 1),
          ),
        canvas.height,
      );
      context.clip();
      const pixelZoom =
        (zoom * canvas.width) / (width || 600);
      paintRoom(
        canvas.getContext("2d")!,
        state.equipment.BACKGROUND,
        yaw,
        pitch,
        pixelZoom,
        cameraDistance,
        illustration.translate.y * pixelZoom,
        Math.min(
          cameraDistance * 1.4,
          ((width || 600) / (zoom / userZoom)) *
            0.9 *
            perspectiveFit,
        ),
      );
      context.restore();
    }
    if (state.directManipulation && !state.readOnly) {
      const bounds = picker.render(
        illustration,
        owners,
        width || 600,
        height || 420,
        zoom,
        state.selected && state.previewSelected
          ? SceneObject.PREVIEW
          : state.selected,
        order,
      );
      state.onSelectionBounds?.(bounds);
    } else state.onSelectionBounds?.(null);
    restoreProjection();
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
    let preview = Boolean(state.previewSelected);
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
        preview = hit === SceneObject.PREVIEW;
        const hitCategory = preview
          ? state.preview?.category
          : hit;
        category =
          hitCategory &&
          hitCategory !== SceneObject.PREVIEW &&
          (preview ||
            hitCategory === DeskObject.BUGRI ||
            state.equipment[hitCategory] ||
            (hitCategory === Category.DESK &&
              state.allowDefaultDesk)) &&
          (!state.editableCategories ||
            state.editableCategories.includes(hitCategory))
            ? hitCategory
            : null;
        tool = category ? DeskTool.MOVE : DeskTool.CAMERA;
        state = {
          ...state,
          selected: category,
          previewSelected: preview,
        };
        if (category) state.onSelect?.(category, preview);
        else state.onDeselect?.();
      }
    }
    if (!category && tool !== DeskTool.CAMERA) return;
    const transform = category
      ? preview && state.preview
        ? state.preview.transform
        : (state.transforms[category] ??
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
      preview,
      transform,
      next: null,
      tool,
      moved: false,
      handle: Boolean(handleTool),
      baseOffset: null,
      cameraDepth:
        cameraDepths.get(
          preview ? SceneObject.PREVIEW : category!,
        ) ?? 0,
      vertical:
        category !== Category.DESK && Math.abs(pitch) <= 20
          ? true
          : null,
    };
    if (category && tool === DeskTool.MOVE) {
      // Every tabletop model's origin is on its supporting base.
      const anchor = (
        preview ? previewAnchor : anchors.get(category)
      ) as
        | (Zdog.Anchor & { renderOrigin: Zdog.Vector })
        | null
        | undefined;
      if (anchor) {
        const { x, y, width, height } =
          canvas.getBoundingClientRect();
        drag.baseOffset = {
          x:
            x +
            width / 2 +
            anchor.renderOrigin.x * zoom -
            event.clientX,
          y:
            y +
            height / 2 +
            anchor.renderOrigin.y * zoom -
            event.clientY,
        };
      }
    }
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
    if (drag.tool === DeskTool.ROTATE && !drag.moved)
      return;
    if (drag.tool === DeskTool.CAMERA) {
      // Rotate the scene so its near side follows the pointer.
      yaw = drag.yaw - dx * 0.5;
      pitch = Math.max(
        -85,
        Math.min(85, drag.pitch + dy * 0.3),
      );
      state.onCamera?.(
        Math.round(((yaw % 360) + 360) % 360),
        Math.round(pitch),
      );
      render();
      return;
    }
    const { category, transform, preview } = drag;
    if (
      !category ||
      !transform ||
      !(
        (preview && state.preview?.category === category) ||
        category === DeskObject.BUGRI ||
        state.equipment[category] ||
        (category === Category.DESK &&
          state.allowDefaultDesk)
      )
    )
      return;
    if (
      drag.tool === DeskTool.MOVE &&
      drag.moved &&
      drag.vertical === null
    )
      drag.vertical =
        category !== Category.DESK &&
        Math.abs(drag.pitch) <= 45 &&
        Math.abs(dy) > Math.abs(dx);
    let next = { ...transform };
    if (drag.tool === DeskTool.ROTATE)
      // Rendering negates the stored angle, so rightward drag subtracts it.
      next.rotationY -= dx * 0.6;
    else if (drag.tool === DeskTool.HEIGHT) {
      if (category === Category.DESK) return;
      const perspectiveScale = state.equipment.BACKGROUND
        ? cameraDistance /
          Math.max(
            cameraDistance * 0.02,
            cameraDistance - drag.cameraDepth,
          )
        : 1;
      next.y -=
        dy /
        drag.zoom /
        perspectiveScale /
        100 /
        Math.max(0.2, Math.cos(radians(drag.pitch)));
    } else {
      const cameraAngle = radians(drag.yaw);
      const screenX = dx / drag.zoom / 100;
      const sine = Math.sin(radians(drag.pitch));
      // Lock the drag plane from the opening gesture so direction changes
      // cannot switch planes and teleport the object mid-drag.
      const vertical = drag.vertical;
      if (vertical)
        next.y -=
          dy /
          drag.zoom /
          100 /
          Math.cos(radians(drag.pitch));
      const screenZ = vertical
        ? 0
        : dy /
          drag.zoom /
          100 /
          ((Math.sign(sine) || 1) *
            Math.max(0.1, Math.abs(sine)));
      let horizontal = screenX;
      let depth = screenZ;
      if (state.equipment.BACKGROUND) {
        const box = canvas.getBoundingClientRect();
        const camera = createSceneProjection(
          cameraDistance,
          drag.pitch,
        );
        const screen = (
          clientX: number,
          clientY: number,
        ) => ({
          x:
            (clientX +
              (drag!.baseOffset?.x ?? 0) -
              box.x -
              box.width / 2) /
            drag!.zoom,
          y:
            (clientY +
              (drag!.baseOffset?.y ?? 0) -
              box.y -
              box.height / 2) /
              drag!.zoom -
            illustration.translate.y,
        });
        const start = screen(drag.x, drag.y);
        const current = screen(
          event.clientX,
          event.clientY,
        );
        const frame =
          state.itemFrame ??
          state.transforms.DESK ??
          defaultTransforms.DESK;
        const height =
          -(
            transform.y +
            (category === Category.DESK ? 0 : frame.y)
          ) * 100;
        const before = vertical
          ? camera.atDepth(start, drag.cameraDepth)
          : camera.onPlane(start, height);
        const after = vertical
          ? camera.atDepth(current, drag.cameraDepth)
          : camera.onPlane(current, height);
        if (!before || !after) return;
        horizontal = (after.x - before.x) / 100;
        depth = (after.z - before.z) / 100;
        if (vertical)
          next.y = transform.y - (after.y - before.y) / 100;
      }
      let x =
        Math.cos(cameraAngle) * horizontal +
        Math.sin(cameraAngle) * depth;
      let z =
        -Math.sin(cameraAngle) * horizontal +
        Math.cos(cameraAngle) * depth;
      if (category !== Category.DESK) {
        const deskAngle = -radians(
          (
            state.itemFrame ??
            state.transforms.DESK ??
            defaultTransforms.DESK
          ).rotationY,
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
    if (
      drag.moved &&
      category !== Category.DESK &&
      drag.tool === DeskTool.MOVE
    )
      next = snapToTable(event, next) ?? next;
    drag.next = next;
    state.onPreview?.(category, next, preview);
  }

  function snapToTable(
    event: PointerEvent,
    transform: DeskTransform,
  ) {
    if (
      !drag ||
      !drag.category ||
      drag.category === Category.DESK ||
      Math.abs(drag.pitch) <= 20 ||
      (drag.vertical &&
        (event.clientY >= drag.y ||
          (drag.transform?.y ?? 0) >= tableHeight))
    )
      return null;
    const { category } = drag;
    const { x, y, width, height } =
      canvas.getBoundingClientRect();
    const desk =
      state.transforms.DESK ?? defaultTransforms.DESK;
    const {
      zoom: scale,
      yaw: azimuth,
      pitch: elevation,
      baseOffset,
    } = drag;
    const snapAt = (
      offset: { x: number; y: number },
      contact = false,
    ) => {
      let screen = {
        x:
          (event.clientX + offset.x - x - width / 2) /
          scale /
          100,
        y:
          ((event.clientY + offset.y - y - height / 2) /
            scale -
            illustration.translate.y) /
          100,
      };
      if (state.equipment.BACKGROUND) {
        const point = createSceneProjection(
          cameraDistance,
          elevation,
        ).onPlane(
          { x: screen.x * 100, y: screen.y * 100 },
          -(desk.y + tableHeight) * 100,
        );
        if (!point) return null;
        screen = {
          x: point.x / 100,
          y:
            (point.y * Math.cos(radians(elevation)) +
              point.z * Math.sin(radians(elevation))) /
            100,
        };
      }
      return tabletopDrop({
        category,
        screen,
        yaw: azimuth,
        pitch: elevation,
        center: framingCenter,
        desk,
        itemFrame: state.itemFrame ?? desk,
        transform,
        contact,
      });
    };

    // Prefer the supporting base; also accept a direct pointer drop onto the table.
    return (
      (baseOffset && snapAt(baseOffset, true)) ??
      snapAt({ x: 0, y: 0 })
    );
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
    const {
      category,
      moved,
      handle,
      transform,
      tool,
      preview,
    } = drag;
    let { next } = drag;
    if (
      handle &&
      tool === DeskTool.HEIGHT &&
      !moved &&
      category &&
      transform
    ) {
      next = constrainTransform(category, {
        ...transform,
        y: transform.y + 0.1,
      });
    }
    if (
      moved &&
      next &&
      tool === DeskTool.MOVE &&
      category &&
      category !== Category.DESK &&
      !state.disabled
    ) {
      next = snapToTable(event, next) ?? next;
    }
    drag = null;
    canvas.releasePointerCapture(event.pointerId);
    if (
      (moved || handle) &&
      category &&
      next &&
      !state.disabled
    )
      state.onCommit?.(category, next, preview);
  }

  function keyDown(event: KeyboardEvent) {
    if (drag && event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  }

  function wheel(event: WheelEvent) {
    if (!state.wheelZoom || state.readOnly) return;
    event.preventDefault();
    if (state.disabled || drag) return;
    const unit =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? host.clientHeight
          : 1;
    userZoom = Math.max(
      0.5,
      Math.min(
        2.5,
        userZoom * Math.exp(-event.deltaY * unit * 0.0015),
      ),
    );
    render();
  }

  window.addEventListener("keydown", keyDown);
  interactionSurface.addEventListener("wheel", wheel, {
    passive: false,
  });
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
      state.onCamera?.(yaw, pitch);
      render();
    },
    cancel,
    dispose() {
      resize.disconnect();
      interactionSurface.removeEventListener(
        "wheel",
        wheel,
      );
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
