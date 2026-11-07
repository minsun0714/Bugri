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
  const bounds = {
    left: -900,
    right: 900,
    back: -420,
    front: 900,
  };
  const width = bounds.right - bounds.left;
  const depth = bounds.front - bounds.back;
  const centerX = (bounds.left + bounds.right) / 2;
  const centerZ = (bounds.back + bounds.front) / 2;
  const floorY = 2;
  const floor = new Zdog.Rect({
    addTo: parent,
    width,
    height: depth,
    rotate: { x: Math.PI / 2 },
    translate: { x: centerX, y: floorY, z: centerZ },
    fill: true,
    stroke: false,
    color: theme.floor,
    backface: false,
  });
  const walls = [
    {
      x: centerX,
      z: bounds.back,
      angle: 0,
      span: width,
      color: theme.wall,
    },
    {
      x: bounds.left,
      z: centerZ,
      angle: -Math.PI / 2,
      span: depth,
      color: theme.side,
    },
    {
      x: centerX,
      z: bounds.front,
      angle: Math.PI,
      span: width,
      color: theme.wall,
    },
    {
      x: bounds.right,
      z: centerZ,
      angle: Math.PI / 2,
      span: depth,
      color: theme.side,
    },
  ].map(
    ({ x, z, angle, span, color }) =>
      new Zdog.Rect({
        addTo: parent,
        width: span,
        height: 700,
        rotate: { y: angle },
        translate: { x, y: floorY - 350, z },
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
  let previous = "";
  return (required: number, yaw = 45) => {
    const extent = Math.max(1800, Math.ceil(required));
    const key = `${extent}:${yaw}`;
    if (key === previous) return;
    previous = key;
    const angle = (yaw * Math.PI) / 180;
    const sine = Math.sin(angle);
    const cosine = Math.cos(angle);
    // Clip only where visible walls meet. Their other ends continue beyond
    // the viewport, even when a wall is almost edge-on to the camera.
    const reachX =
      extent / Math.max(0.001, Math.abs(cosine));
    const reachZ = extent / Math.max(0.001, Math.abs(sine));
    const minX = sine > 0.000001 ? bounds.left : -reachX;
    const maxX = sine < -0.000001 ? bounds.right : reachX;
    const minZ = cosine > 0.000001 ? bounds.back : -reachZ;
    const maxZ = cosine < -0.000001 ? bounds.front : reachZ;
    floor.width = floor.height = extent * 2;
    floor.translate.x = floor.translate.z = 0;
    floor.updatePath();
    walls.forEach((wall, index) => {
      const alongX = index % 2 === 0;
      wall.width = alongX ? maxX - minX : maxZ - minZ;
      wall.height = extent * 2;
      if (alongX) wall.translate.x = (minX + maxX) / 2;
      else wall.translate.z = (minZ + maxZ) / 2;
      wall.translate.y = floorY - extent;
      wall.updatePath();
    });
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
