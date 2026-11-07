import * as Zdog from "zdog";

export type Placement = {
  x: number;
  z: number;
  angle: number;
};
export type Model = "keyboard" | "monitor";
export type SceneState = {
  yaw: number;
  pitch: number;
  keyboard: Placement;
  monitor: Placement;
};

export function initialScene(): SceneState {
  return {
    yaw: 45,
    pitch: 25,
    keyboard: { x: -35, z: 60, angle: 0 },
    monitor: { x: 0, z: -45, angle: 0 },
  };
}

const radians = (degrees: number) =>
  (degrees * Math.PI) / 180;

export function constrain(
  model: Model,
  value: Placement,
): Placement {
  const angle = ((value.angle % 360) + 360) % 360;
  const cos = Math.abs(Math.cos(radians(angle)));
  const sin = Math.abs(Math.sin(radians(angle)));
  const [width, depth] =
    model === "keyboard" ? [64, 25] : [77, 30];
  const maxX = 180 - cos * width - sin * depth;
  const maxZ = 105 - sin * width - cos * depth;

  return {
    x: Math.round(Math.max(-maxX, Math.min(maxX, value.x))),
    z: Math.round(Math.max(-maxZ, Math.min(maxZ, value.z))),
    angle,
  };
}

export function planeDelta(
  dx: number,
  dy: number,
  state: SceneState,
  zoom: number,
) {
  const yaw = radians(state.yaw);
  const x = dx / zoom;
  const z = dy / zoom / Math.sin(radians(state.pitch));

  return {
    x: Math.cos(yaw) * x + Math.sin(yaw) * z,
    z: -Math.sin(yaw) * x + Math.cos(yaw) * z,
  };
}

export function createScene(canvas: HTMLCanvasElement) {
  const illo = new Zdog.Illustration({
    element: canvas,
    dragRotate: false,
  });
  const root = new Zdog.Anchor({ addTo: illo });
  const box = (
    parent: Zdog.Anchor,
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    color: string,
    extra: Partial<Zdog.BoxOptions> = {},
  ) =>
    new Zdog.Box({
      addTo: new Zdog.Group({
        addTo: parent,
        updateSort: true,
      }),
      width,
      height,
      depth,
      translate: { x, y, z },
      color,
      stroke: 1,
      ...extra,
    });

  box(root, 360, 15, 210, 0, 25, 0, "#c9a882", {
    topFace: "#f0d6b5",
    bottomFace: "#a78566",
  });
  for (const x of [-150, 150]) {
    for (const z of [-78, 78])
      box(root, 16, 125, 16, x, 95, z, "#b39987", {
        frontFace: "#d6c1ac",
      });
  }
  const monitor = new Zdog.Group({
    addTo: root,
    updateSort: true,
  });
  box(monitor, 75, 6, 48, 0, 12, 0, "#cbc3dd");
  box(monitor, 15, 54, 12, 0, -15, 0, "#b5a9c8");
  box(monitor, 150, 95, 14, 0, -78, 0, "#ded7ed", {
    rearFace: "#b7abc8",
  });
  box(monitor, 135, 79, 1, 0, -78, 8, "#29243d");
  box(monitor, 120, 7, 1, 0, -105, 9, "#6544dc");
  for (let row = 0; row < 4; row++)
    box(
      monitor,
      45 + row * 12,
      4,
      1,
      -20 + row * 3,
      -88 + row * 12,
      9,
      row % 2 ? "#dcf58c" : "#b7a4ef",
    );
  // Rear vents make the back distinguishable from the screen.
  for (let i = 0; i < 7; i++)
    box(monitor, 3, 20, 1, -24 + i * 8, -75, -8, "#716a84");
  const keyboard = new Zdog.Group({
    addTo: root,
    updateSort: true,
  });
  box(keyboard, 126, 10, 48, 0, 12, 0, "#9aafa0", {
    topFace: "#bfd0bb",
  });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++)
      box(
        keyboard,
        9,
        5,
        9,
        -53 + col * 12,
        4,
        -16 + row * 12,
        col === 0 ? "#6544dc" : "#f5f0e5",
      );
  }
  box(keyboard, 58, 5, 7, 0, 4, 18, "#dcf58c");

  let zoom = 1;

  return {
    render(state: SceneState) {
      const { width } = canvas.getBoundingClientRect();
      const height = Math.max(
        300,
        Math.min(460, width * 0.75),
      );
      illo.setSize(width, height);
      zoom = Math.min(width / 560, height / 450);
      illo.zoom = zoom;
      root.rotate.set({
        x: -radians(state.pitch),
        y: radians(state.yaw),
      });
      for (const [model, anchor] of [
        ["keyboard", keyboard],
        ["monitor", monitor],
      ] as const) {
        const { x, z, angle } = state[model];
        anchor.translate.set({ x, y: 0, z });
        anchor.rotate.y = radians(angle);
      }
      illo.updateRenderGraph();
    },
    getZoom: () => zoom,
    dispose: () => root.remove(),
  };
}
