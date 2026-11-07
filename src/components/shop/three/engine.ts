import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import {
  Category,
  DeskTool,
  DeskView,
} from "@/api/constants";
import type {
  Equipment,
  DeskTransform,
  DeskTransforms,
} from "@/api/contracts";
import {
  isMovable,
  type MovableCategory,
} from "@/lib/desk-layout";
import {
  constrainTransform,
  defaultTransforms,
} from "@/lib/desk-spatial";
import {
  productModel,
  lightScene,
  disposeModel,
} from "@/components/shop/three/models";

export interface SceneState {
  equipment: Equipment;
  transforms: DeskTransforms;
  selected: MovableCategory | null;
  tool: DeskTool;
  disabled: boolean;
  readOnly: boolean;
  onSelect?: (category: MovableCategory) => void;
  onPreview?: (
    category: MovableCategory,
    transform: DeskTransform,
  ) => void;
  onCommit?: (
    category: MovableCategory,
    transform: DeskTransform,
  ) => void;
  onCamera?: (angle: number) => void;
  onCancel?: () => void;
  onError: () => void;
}

export function createDeskEngine(
  host: HTMLElement,
  initial: SceneState,
) {
  let state = initial;
  let destroyed = false;
  let frame = 0;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#f0ebf7");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5),
  );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-label", "3D 데스크 캔버스");
  canvas.className =
    "block h-full w-full touch-none rounded-2xl";
  host.appendChild(canvas);
  lightScene(scene);
  const camera = new THREE.PerspectiveCamera(
    38,
    1,
    0.1,
    50,
  );
  camera.position.set(5.2, 4.5, 5.2);
  const orbit = new OrbitControls(camera, canvas);
  orbit.target.set(0, 1.1, 0);
  orbit.minDistance = 4;
  orbit.maxDistance = 14;
  orbit.minPolarAngle = 0.08;
  orbit.maxPolarAngle = Math.PI / 2 - 0.08;
  orbit.enablePan = false;
  orbit.update();
  const controls = new TransformControls(camera, canvas);
  controls.setSpace("local");
  controls.setSize(0.8);
  controls.setRotationSnap(Math.PI / 180);
  scene.add(controls.getHelper());
  let content = new THREE.Group();
  let equipmentKey = "";
  const groups = new Map<MovableCategory, THREE.Group>();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let direct: {
    category: MovableCategory;
    pointerId: number;
    plane: THREE.Plane;
    offset: THREE.Vector3;
    moved: boolean;
  } | null = null;

  function render() {
    if (destroyed || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!destroyed) renderer.render(scene, camera);
    });
  }
  function apply(
    group: THREE.Group,
    transform: DeskTransform,
  ) {
    group.position.set(
      transform.x,
      transform.y,
      transform.z,
    );
    group.rotation.set(
      0,
      THREE.MathUtils.degToRad(transform.rotationY),
      0,
    );
  }
  function getTransform(
    category: MovableCategory,
  ): DeskTransform {
    const group = groups.get(category)!;
    return constrainTransform(category, {
      x: group.position.x,
      y: group.position.y,
      z: group.position.z,
      rotationY: THREE.MathUtils.radToDeg(group.rotation.y),
    });
  }
  function preview(category: MovableCategory) {
    const transform = getTransform(category);
    apply(groups.get(category)!, transform);
    state.onPreview?.(category, transform);
    render();
    return transform;
  }
  function sync(next: SceneState) {
    state = next;
    const key = JSON.stringify(state.equipment);
    if (key !== equipmentKey) {
      controls.detach();
      scene.remove(content);
      disposeModel(content);
      groups.clear();
      content = new THREE.Group();
      const room = productModel(
        state.equipment.BACKGROUND ?? "room-default",
      );
      content.add(room);
      const desk = productModel(
        state.equipment.DESK ?? "default",
      );
      content.add(desk);
      if (state.equipment.DESK)
        groups.set(Category.DESK, desk);
      for (const category of [
        Category.MONITOR,
        Category.KEYBOARD,
        Category.ACCESSORY,
      ]) {
        const productId = state.equipment[category];
        if (!productId) continue;
        const model = productModel(productId);
        desk.add(model);
        model.userData.category = category;
        groups.set(category, model);
      }
      if (state.equipment.DESK)
        desk.userData.category = Category.DESK;
      scene.add(content);
      equipmentKey = key;
    }
    for (const [category, group] of groups)
      apply(
        group,
        state.transforms[category] ??
          defaultTransforms[category],
      );
    orbit.enabled =
      !state.disabled &&
      (state.readOnly || state.tool === DeskTool.CAMERA);
    const selected =
      state.selected && groups.get(state.selected);
    controls.enabled =
      !state.readOnly &&
      !state.disabled &&
      state.tool !== DeskTool.CAMERA;
    if (selected && controls.enabled) {
      if (controls.object !== selected)
        controls.attach(selected);
      const rotating = state.tool === DeskTool.ROTATE;
      controls.setMode(rotating ? "rotate" : "translate");
      controls.showX = !rotating;
      controls.showY = rotating;
      controls.showZ = !rotating;
      controls.showXY = false;
      controls.showYZ = false;
      controls.showXZ = !rotating;
      controls.showXYZE = false;
    } else controls.detach();
    render();
  }
  controls.addEventListener("change", render);
  controls.addEventListener("objectChange", () => {
    if (state.selected) preview(state.selected);
  });
  controls.addEventListener("mouseUp", () => {
    if (state.selected)
      state.onCommit?.(
        state.selected,
        getTransform(state.selected),
      );
  });
  orbit.addEventListener("change", () => {
    state.onCamera?.(
      Math.round(
        THREE.MathUtils.radToDeg(orbit.getAzimuthalAngle()),
      ),
    );
    render();
  });

  function setRay(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
  }
  function down(event: PointerEvent) {
    if (
      state.disabled ||
      state.readOnly ||
      state.tool === DeskTool.CAMERA ||
      controls.dragging ||
      controls.axis ||
      direct ||
      !event.isPrimary ||
      event.button !== 0
    )
      return;
    setRay(event);
    const hit = raycaster.intersectObjects(
      [...groups.values()],
      true,
    )[0];
    if (!hit) return;
    let object: THREE.Object3D | null = hit.object;
    while (object && !isMovable(object.userData.category))
      object = object.parent;
    if (!object) return;
    const category = object.userData
      .category as MovableCategory;
    state.onSelect?.(category);
    if (state.tool !== DeskTool.MOVE) return;
    const group = groups.get(category)!;
    const world = group.getWorldPosition(
      new THREE.Vector3(),
    );
    const plane = new THREE.Plane(
      new THREE.Vector3(0, 1, 0),
      -world.y,
    );
    const point = raycaster.ray.intersectPlane(
      plane,
      new THREE.Vector3(),
    );
    if (!point) return;
    const local = group.parent!.worldToLocal(point);
    direct = {
      category,
      pointerId: event.pointerId,
      plane,
      offset: group.position.clone().sub(local),
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (!direct || direct.pointerId !== event.pointerId)
      return;
    setRay(event);
    const point = raycaster.ray.intersectPlane(
      direct.plane,
      new THREE.Vector3(),
    );
    if (!point) return;
    const group = groups.get(direct.category)!;
    group.position.copy(
      group.parent!.worldToLocal(point).add(direct.offset),
    );
    direct.moved = true;
    preview(direct.category);
  }
  function up(event: PointerEvent) {
    if (!direct || direct.pointerId !== event.pointerId)
      return;
    const { category, moved } = direct;
    direct = null;
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
    if (moved)
      state.onCommit?.(category, getTransform(category));
  }
  function cancel() {
    direct = null;
    controls.reset();
    controls.dragging = false;
    state.onCancel?.();
    render();
  }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", cancel);
  function lost(event: Event) {
    event.preventDefault();
    state.onError();
  }
  canvas.addEventListener("webglcontextlost", lost);
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  });
  resize.observe(host);
  sync(initial);

  return {
    sync,
    view(view: DeskView) {
      if (view === DeskView.FRONT)
        camera.position.set(0, 3.1, 8);
      else if (view === DeskView.TOP)
        camera.position.set(0, 9, 0.05);
      else camera.position.set(5.2, 4.5, 5.2);
      orbit.target.set(0, 1.1, 0);
      orbit.update();
      render();
    },
    cancel,
    dispose() {
      destroyed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("webglcontextlost", lost);
      controls.dispose();
      orbit.dispose();
      disposeModel(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
