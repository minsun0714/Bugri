import * as THREE from "three";
import {
  productModel,
  lightScene,
  disposeModel,
} from "@/components/shop/three/models";

const images = new Map<string, string>();
let renderer: THREE.WebGLRenderer | null = null;
let idle: ReturnType<typeof setTimeout> | undefined;

/** Render static catalog images with the same geometry, sharing one short-lived GPU context. */
export function productPreview(productId: string) {
  const cached = images.get(productId);
  if (cached) return cached;
  clearTimeout(idle);
  renderer ??= new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(480, 320);
  renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  lightScene(scene);
  const model = productModel(productId);
  scene.add(model);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const extent = Math.max(size.x, size.y, size.z);
  const camera = new THREE.OrthographicCamera(
    -extent * 0.85,
    extent * 0.85,
    extent * 0.57,
    -extent * 0.57,
    0.01,
    100,
  );
  camera.position
    .copy(center)
    .add(
      new THREE.Vector3(extent, extent * 0.9, extent * 1.5),
    );
  camera.lookAt(center);
  renderer.render(scene, camera);
  const image = renderer.domElement.toDataURL("image/png");
  images.set(productId, image);
  disposeModel(scene);
  idle = setTimeout(() => {
    renderer?.dispose();
    renderer?.forceContextLoss();
    renderer = null;
  }, 100);
  return image;
}
