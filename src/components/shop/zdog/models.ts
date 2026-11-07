import { room } from "@/components/shop/zdog/room";
import * as Zdog from "zdog";
import { monitorScreen } from "@/components/shop/monitor-screen";

function box(
  parent: Zdog.Anchor,
  size: [number, number, number],
  at: [number, number, number],
  color: string,
  extra: Partial<Zdog.BoxOptions> = {},
) {
  const [width, height, depth] = size;
  const [x, y, z] = at;
  const group = new Zdog.Group({
    addTo: parent,
    translate: { x, y, z },
    updateSort: true,
  });
  new Zdog.Box({
    addTo: group,
    width,
    height,
    depth,
    color,
    stroke: 0.5,
    ...extra,
  });
}

/** Units are centimetres; y points down in the Canvas renderer. */
export function model(parent: Zdog.Anchor, id: string) {
  // Keep each object's parts together when sorting neighbouring objects.
  const root = new Zdog.Group({
    addTo: parent,
    updateSort:
      !id.startsWith("keyboard") &&
      !id.startsWith("background"),
  });
  const second = id.endsWith("2");
  if (id.startsWith("keyboard")) {
    box(
      root,
      [135, 8, 52],
      [0, -4, 0],
      second ? "#c9b8e3" : "#a8c3a8",
    );
    // All allowed views are above the keyboard: its keycaps cover its body.
    const keys = new Zdog.Group({
      addTo: root,
      updateSort: true,
    });
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 10; col++) {
        box(
          keys,
          [10, 4, 10],
          [-55 + col * 12, -10, -18 + row * 13],
          col === 0 ? "#6544dc" : "#f6f1e8",
        );
      }
    box(keys, [60, 4, 8], [0, -10, 20], "#dcf58c");
  } else if (id.startsWith("monitor")) {
    box(
      root,
      [75, 5, 45],
      [0, -2.5, 0],
      second ? "#393448" : "#c9c0dc",
    );
    box(
      root,
      [14, 42, 12],
      [0, -24, 0],
      second ? "#50475e" : "#ada1c3",
    );
    // Draw screen art after the housing; artwork density must not affect depth sorting.
    const display = new Zdog.Group({
      addTo: root,
      updateSort: false,
    });
    box(
      display,
      [170, 100, 14],
      [0, -88, 0],
      second ? "#393448" : "#d9d1e8",
      {
        frontFace: "#29243d",
        rearFace: second ? "#50475e" : "#b7abc8",
      },
    );
    // Flat decorations stay on their respective face and cull when facing away.
    const front = new Zdog.Group({
      addTo: display,
      translate: { y: -88, z: 7.5 },
      updateSort: false,
    });
    for (const mark of monitorScreen(second)) {
      const { x, y, color } = mark;
      const options = {
        addTo: front,
        translate: { x, y },
        fill: true,
        stroke: 0,
        color,
        backface: false,
      };
      if (mark.kind === "rect") {
        const { width, height } = mark;
        new Zdog.Rect({ ...options, width, height });
      } else {
        const { diameter } = mark;
        new Zdog.Ellipse({ ...options, diameter });
      }
    }
    const rear = new Zdog.Anchor({
      addTo: display,
      translate: { y: -88, z: -7.5 },
      rotate: { y: Math.PI },
    });
    for (let i = 0; i < 7; i++)
      new Zdog.Rect({
        addTo: rear,
        width: 3,
        height: 20,
        translate: { x: -24 + 8 * i },
        fill: true,
        stroke: 0,
        color: "#716a84",
        backface: false,
      });
  } else if (id.startsWith("accessory")) {
    if (second) {
      box(root, [42, 5, 42], [0, -2.5, 0], "#c9ad77");
      box(root, [7, 55, 7], [0, -30, 0], "#d9bb82");
      new Zdog.Hemisphere({
        addTo: root,
        diameter: 60,
        stroke: false,
        color: "#f87981",
        backface: "#ffe0b4",
        translate: { y: -55 },
        rotate: { x: Math.PI / 2 },
      });
    } else {
      box(root, [35, 33, 35], [0, -16.5, 0], "#d9b49a", {
        topFace: "#6b594c",
      });
      box(root, [5, 45, 5], [0, -48, 0], "#628b5b");
      for (const x of [-15, 15])
        new Zdog.Ellipse({
          addTo: root,
          diameter: 32,
          quarters: 4,
          stroke: 10,
          fill: true,
          color: x < 0 ? "#88ac68" : "#a7bf77",
          translate: { x, y: -65, z: 0 },
          rotate: { y: x / 20, z: x / 35 },
        });
    }
  } else if (id.startsWith("background")) {
    room(root, id);
  } else {
    deskParts(root, root, id);
  }
  return root;
}

const deskFeet = [
  [-175, -95],
  [-175, 95],
  [175, -95],
  [175, 95],
] as const;

/** Floor-only contact cues, painted after the rug and before all furnishings. */
export function deskContactShadow(parent: Zdog.Anchor) {
  const root = new Zdog.Group({
    addTo: parent,
    updateSort: false,
  });
  for (const [x, z] of deskFeet) {
    const contact = new Zdog.Group({
      addTo: root,
      translate: { x, y: 0, z },
      updateSort: false,
    });
    for (const [diameter, opacity] of [
      [44, 0.06],
      [32, 0.09],
      [22, 0.14],
    ])
      new Zdog.Ellipse({
        addTo: contact,
        diameter,
        rotate: { x: Math.PI / 2 },
        fill: true,
        stroke: false,
        color: `rgba(41, 36, 61, ${opacity})`,
        backface: false,
      });
  }
  return root;
}

/** Separate the tabletop from legs so lowered items can be occluded by it. */
export function deskParts(
  lower: Zdog.Anchor,
  top: Zdog.Anchor,
  id: string,
) {
  const second = id.endsWith("2");
  box(
    top,
    [400, 14, 240],
    [0, -148, 0],
    second ? "#ded4ed" : "#c9a882",
    {
      topFace: second ? "#eee8f5" : "#f0d6b5",
      bottomFace: "#ad927d",
    },
  );
  for (const [x, z] of deskFeet)
    box(
      lower,
      [15, 141, 15],
      [x, -70.5, z],
      second ? "#c2b5d3" : "#b69a83",
    );
}

export function productPreview(productId: string) {
  const canvas = document.createElement("canvas");
  const illustration = new Zdog.Illustration({
    element: canvas,
    zoom: productId.startsWith("background")
      ? 0.24
      : productId.startsWith("desk")
        ? 0.85
        : 2,
    rotate: { x: -0.35, y: 0.6 },
  });
  illustration.setSize(480, 320);
  const root = model(illustration, productId);
  root.translate.y = productId.startsWith("desk")
    ? 75
    : productId.startsWith("background")
      ? 110
      : productId.startsWith("monitor")
        ? 65
        : productId.startsWith("accessory")
          ? 35
          : 0;
  illustration.updateRenderGraph();
  const image = canvas.toDataURL();
  root.remove();
  return image;
}
