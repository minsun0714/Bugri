import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

function material(color: string, metalness = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.65,
    metalness,
  });
}

function box(
  group: THREE.Group,
  size: [number, number, number],
  at: [number, number, number],
  color: string,
  radius = 0.025,
) {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(
      ...size,
      2,
      Math.min(radius, Math.min(...size) / 3),
    ),
    material(color),
  );
  mesh.position.set(...at);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function cylinder(
  group: THREE.Group,
  top: number,
  bottom: number,
  height: number,
  at: [number, number, number],
  color: string,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(top, bottom, height, 24),
    material(color),
  );
  mesh.position.set(...at);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function sphere(
  group: THREE.Group,
  at: [number, number, number],
  scale: [number, number, number],
  color: string,
) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 14),
    material(color),
  );
  mesh.position.set(...at);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  group.add(mesh);
  return mesh;
}

export function productModel(
  productId: string,
): THREE.Group {
  const group = new THREE.Group();
  const alternate = productId.endsWith("-2");
  if (
    productId.startsWith("desk") ||
    productId === "default"
  ) {
    const top =
      productId === "default"
        ? "#d6cfdf"
        : alternate
          ? "#eee4d1"
          : "#cca47b";
    box(group, [4, 0.15, 2.4], [0, 1.475, 0], top, 0.06);
    for (const x of [-1.75, 1.75])
      for (const z of [-0.95, 0.95]) {
        cylinder(
          group,
          0.065,
          0.085,
          1.4,
          [x, 0.7, z],
          alternate ? "#d2c6b2" : "#ae835f",
        );
      }
    box(
      group,
      [1, 0.3, 1.65],
      [1.1, 1.23, 0.05],
      alternate ? "#e1d5bd" : "#b9906b",
    );
    box(
      group,
      [0.28, 0.035, 0.04],
      [1.1, 1.23, 0.9],
      "#77634d",
    );
    if (!alternate && productId !== "default")
      for (let i = 0; i < 9; i++)
        box(
          group,
          [3.75, 0.002, 0.007],
          [0, 1.551, -1.05 + i * 0.26],
          "#b68c65",
          0,
        );
  } else if (productId.startsWith("keyboard")) {
    box(
      group,
      [1.35, 0.095, 0.52],
      [0, 0.05, 0],
      alternate ? "#b59bd8" : "#9eb98c",
      0.04,
    );
    box(
      group,
      [1.28, 0.025, 0.46],
      [0, 0.105, 0],
      alternate ? "#9078b6" : "#79946d",
    );
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 12; col++) {
        if (row === 3 && col >= 3 && col <= 8) continue;
        box(
          group,
          [0.09, 0.045, 0.085],
          [-0.58 + col * 0.105, 0.135, -0.16 + row * 0.105],
          col === 0 || col === 11
            ? alternate
              ? "#8861b3"
              : "#648c57"
            : "#fff5dc",
          0.012,
        );
      }
    box(
      group,
      [0.62, 0.045, 0.085],
      [0, 0.135, 0.155],
      "#fff5dc",
      0.01,
    );
  } else if (productId.startsWith("monitor")) {
    const frame = alternate ? "#51445e" : "#d2bddf";
    box(group, [0.62, 0.045, 0.42], [0, 0.025, 0], frame);
    box(group, [0.12, 0.38, 0.12], [0, 0.22, 0], frame);
    box(
      group,
      [1.7, 1.05, 0.12],
      [0, 0.86, -0.04],
      frame,
      0.055,
    );
    box(
      group,
      [1.55, 0.87, 0.015],
      [0, 0.89, 0.03],
      alternate ? "#22283e" : "#655393",
      0.02,
    );
    box(
      group,
      [0.85, 0.52, 0.02],
      [-0.21, 0.87, 0.045],
      "#272a40",
    );
    for (let i = 0; i < 5; i++)
      box(
        group,
        [0.24 + (i % 3) * 0.14, 0.015, 0.01],
        [-0.29, 1.02 - i * 0.075, 0.062],
        i % 2 ? "#b0c6ec" : "#c8df94",
        0,
      );
    const moon = cylinder(
      group,
      0.1,
      0.1,
      0.015,
      [0.58, 1.13, 0.05],
      "#ffe3a1",
    );
    moon.rotation.x = Math.PI / 2;
  } else if (productId === "accessory-2") {
    cylinder(
      group,
      0.23,
      0.23,
      0.045,
      [0, 0.025, 0],
      "#c98d6b",
    );
    cylinder(
      group,
      0.055,
      0.085,
      0.46,
      [0, 0.26, 0],
      "#eed5af",
    );
    const shade = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.3,
        32,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      ),
      material("#ee9b80"),
    );
    shade.position.y = 0.48;
    shade.castShadow = true;
    group.add(shade);
    cylinder(
      group,
      0.3,
      0.3,
      0.015,
      [0, 0.48, 0],
      "#ffe1a8",
    );
  } else if (productId === "accessory-1") {
    cylinder(
      group,
      0.19,
      0.14,
      0.3,
      [0, 0.15, 0],
      "#d6a080",
    );
    cylinder(
      group,
      0.165,
      0.165,
      0.012,
      [0, 0.305, 0],
      "#59473a",
    );
    cylinder(
      group,
      0.015,
      0.02,
      0.48,
      [0, 0.54, 0],
      "#65835a",
    );
    for (let i = 0; i < 7; i++) {
      const angle = i * 2.4;
      const leaf = sphere(
        group,
        [
          Math.cos(angle) * 0.12,
          0.44 + i * 0.06,
          Math.sin(angle) * 0.12,
        ],
        [0.11, 0.17, 0.045],
        i % 2 ? "#92af78" : "#688d64",
      );
      leaf.rotation.set(0.4, -angle, 0.5);
    }
  } else if (
    productId.startsWith("background") ||
    productId === "room-default"
  ) {
    box(
      group,
      [7.8, 0.1, 7.8],
      [0, -0.08, 0],
      alternate ? "#c1b6d2" : "#dce0cf",
    );
    box(
      group,
      [7.8, 3.9, 0.12],
      [0, 1.9, -3.6],
      alternate ? "#bcb1d1" : "#e9e2cf",
    );
    if (productId === "room-default") return group;
    box(
      group,
      [2.5, 2.3, 0.05],
      [-1.5, 2.1, -3.5],
      "#f9f1df",
      0.12,
    );
    box(
      group,
      [2.24, 2.04, 0.05],
      [-1.5, 2.1, -3.45],
      alternate ? "#4e446f" : "#acc6af",
      0.1,
    );
    sphere(
      group,
      [-1.9, 2.55, -3.37],
      [0.28, 0.28, 0.025],
      "#ffedb5",
    );
    box(
      group,
      [0.07, 2.12, 0.07],
      [-1.5, 2.1, -3.37],
      "#fff6df",
    );
    box(
      group,
      [2.3, 0.07, 0.07],
      [-1.5, 2.1, -3.37],
      "#fff6df",
    );
    box(
      group,
      [2.7, 0.1, 0.35],
      [-1.5, 0.94, -3.3],
      "#d4c5b1",
    );
    box(
      group,
      [0.75, 0.95, 0.05],
      [1.6, 2.25, -3.49],
      "#f9f1df",
    );
    sphere(
      group,
      [1.6, 2.3, -3.43],
      [0.23, 0.28, 0.02],
      alternate ? "#a292bd" : "#9eb083",
    );
  }
  group.name = productId;
  return group;
}

export function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      geometries.add(object.geometry);
      for (const mat of Array.isArray(object.material)
        ? object.material
        : [object.material])
        materials.add(mat);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((mat) => mat.dispose());
}

export function lightScene(scene: THREE.Scene) {
  scene.add(
    new THREE.HemisphereLight("#fffbf4", "#b0a2c3", 2.5),
  );
  const key = new THREE.DirectionalLight("#fff1d9", 3.5);
  key.position.set(3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -6,
    right: 6,
    top: 6,
    bottom: -6,
    near: 0.1,
    far: 20,
  });
  key.shadow.normalBias = 0.025;
  scene.add(key);
}
