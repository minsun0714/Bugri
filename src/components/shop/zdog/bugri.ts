import * as Zdog from "zdog";

/** The resident mascot follows the existing lime body and antenna design. */
export function bugri(parent: Zdog.Anchor) {
  const root = new Zdog.Group({
    addTo: parent,
    translate: { x: -230, y: 0, z: 180 },
    scale: 1.4,
    updateSort: true,
  });
  const lime = "#c5ed66";
  const ink = "#503a85";

  new Zdog.RoundedRect({
    addTo: root,
    width: 60,
    height: 54,
    cornerRadius: 20,
    translate: { y: -48, z: -4 },
    stroke: 34,
    fill: true,
    color: "#a7d34c",
  });
  new Zdog.RoundedRect({
    addTo: root,
    width: 60,
    height: 54,
    cornerRadius: 20,
    translate: { y: -48 },
    stroke: 32,
    fill: true,
    color: lime,
  });
  for (const side of [-1, 1]) {
    new Zdog.Shape({
      addTo: root,
      path: [
        { x: side * 21, y: -83 },
        { x: side * 32, y: -110 },
      ],
      stroke: 3,
      color: ink,
    });
    new Zdog.Shape({
      addTo: root,
      translate: { x: side * 32, y: -110 },
      stroke: 8,
      color: ink,
    });
    new Zdog.Shape({
      addTo: root,
      translate: { x: side * 45, y: -48, z: 3 },
      stroke: 14,
      color: lime,
    });
    new Zdog.Shape({
      addTo: root,
      translate: { x: side * 22, y: -5, z: 9 },
      stroke: 10,
      color: lime,
    });
  }
  const face = new Zdog.Group({
    addTo: root,
    translate: { z: 18 },
  });
  for (const side of [-1, 1]) {
    new Zdog.Shape({
      addTo: face,
      path: [
        { x: side * 14, y: -57 },
        { x: side * 14, y: -51 },
      ],
      stroke: 5,
      color: ink,
      backface: false,
    });
    new Zdog.Ellipse({
      addTo: face,
      width: 12,
      height: 6,
      translate: { x: side * 29, y: -41 },
      fill: true,
      stroke: false,
      color: "#ff969e",
      backface: false,
    });
  }
  new Zdog.Shape({
    addTo: face,
    path: [
      { x: -6, y: -40 },
      { x: -3, y: -36 },
      { x: 3, y: -36 },
      { x: 6, y: -40 },
    ],
    closed: false,
    stroke: 2.5,
    color: ink,
    backface: false,
  });
  return root;
}
