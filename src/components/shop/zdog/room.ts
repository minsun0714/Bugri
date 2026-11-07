import * as Zdog from "zdog";
import {
  roomTheme,
  roomLitColor,
} from "@/components/shop/room-theme";

export function room(
  parent: Zdog.Anchor,
  productId: string,
) {
  const theme = roomTheme(productId);
  const night = productId === "background-2";
  const floor = new Zdog.Rect({
    addTo: parent,
    width: 1800,
    height: 1800,
    rotate: { x: Math.PI / 2 },
    translate: { y: 2 },
    fill: true,
    stroke: false,
    color: theme.floor,
    backface: false,
  });
  const walls = [
    { x: 0, z: -420, angle: 0, color: theme.wall },
    {
      x: -900,
      z: 0,
      angle: -Math.PI / 2,
      color: theme.side,
    },
    { x: 0, z: 900, angle: Math.PI, color: theme.wall },
    { x: 900, z: 0, angle: Math.PI / 2, color: theme.side },
  ].map(
    ({ x, z, angle, color }) =>
      new Zdog.Rect({
        addTo: parent,
        width: 1800,
        height: 700,
        rotate: { y: angle },
        translate: { x, y: -350, z },
        fill: true,
        stroke: false,
        color,
        backface: false,
      }),
  );
  new Zdog.RoundedRect({
    addTo: parent,
    width: 650,
    height: 460,
    cornerRadius: 75,
    rotate: { x: Math.PI / 2 },
    translate: { y: 0, z: 40 },
    fill: true,
    stroke: false,
    color: theme.rug,
    backface: false,
  });
  const window = new Zdog.Group({
    addTo: parent,
    translate: { x: -100, y: -230, z: -415 },
    scale: 0.75,
    updateSort: false,
  });
  new Zdog.RoundedRect({
    addTo: window,
    width: 330,
    height: 350,
    cornerRadius: 105,
    fill: true,
    stroke: 18,
    color: theme.glow,
    backface: false,
  });
  new Zdog.RoundedRect({
    addTo: window,
    width: 300,
    height: 320,
    cornerRadius: 90,
    fill: true,
    stroke: false,
    color: theme.sky,
    backface: false,
  });
  new Zdog.Ellipse({
    addTo: window,
    diameter: 76,
    translate: { x: 65, y: -65 },
    fill: true,
    stroke: false,
    color: theme.glow,
    backface: false,
  });
  if (night) {
    new Zdog.Ellipse({
      addTo: window,
      diameter: 65,
      translate: { x: 85, y: -80 },
      fill: true,
      stroke: false,
      color: theme.sky,
      backface: false,
    });
    for (const [x, y] of [
      [-105, -80],
      [-40, -110],
      [5, -35],
      [110, 25],
      [-90, 15],
    ])
      new Zdog.Ellipse({
        addTo: window,
        diameter: 5,
        translate: { x, y },
        fill: true,
        stroke: false,
        color: theme.glow,
        backface: false,
      });
  }
  new Zdog.Shape({
    addTo: window,
    path: [
      { x: -145, y: 65 },
      { x: -65, y: 12 },
      { x: 25, y: 75 },
      { x: 145, y: 40 },
      { x: 145, y: 125 },
      { x: -145, y: 125 },
    ],
    fill: true,
    stroke: false,
    color: night ? "#686390" : "#88ad86",
    backface: false,
  });
  new Zdog.Shape({
    addTo: window,
    path: [
      { x: -150, y: 65 },
      { x: 150, y: 65 },
    ],
    stroke: 10,
    color: theme.glow,
    backface: false,
  });
  new Zdog.Shape({
    addTo: window,
    path: [
      { x: 0, y: -150 },
      { x: 0, y: 155 },
    ],
    stroke: 10,
    color: theme.glow,
    backface: false,
  });
  let extent = 0;
  return (required: number) => {
    const next = Math.max(1800, Math.ceil(required));
    if (next === extent) return;
    extent = next;
    floor.width = floor.height = extent * 2;
    floor.updatePath();
    for (const wall of walls) {
      wall.width = wall.height = extent * 2;
      wall.translate.y = 2 - extent;
      wall.updatePath();
    }
  };
}

export function lightRoomObjects(
  root: Zdog.Anchor,
  productId?: string,
) {
  const { light, strength } = roomTheme(productId);
  if (!strength) return;
  function visit(node: Zdog.Anchor) {
    if (node instanceof Zdog.Shape) {
      node.color = roomLitColor(
        node.color,
        light,
        strength,
      );
      if (typeof node.backface === "string")
        node.backface = roomLitColor(
          node.backface,
          light,
          strength,
        );
    }
    const { children } = node as Zdog.Anchor & {
      children: Zdog.Anchor[];
    };
    children.forEach(visit);
  }
  visit(root);
}
