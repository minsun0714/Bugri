import type { SpatialTarget } from "@/lib/desk-spatial";
import type { DeskTransform } from "@/api/contracts";
import type { SceneState } from "@/components/shop/three/engine";
import type { MovableCategory } from "@/lib/desk-layout";

export const SceneObject = { PREVIEW: "PREVIEW" } as const;
export type SceneTarget =
  SpatialTarget | typeof SceneObject.PREVIEW;

export interface SelectionBounds {
  category: SceneTarget;
  x: number;
  y: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface DeskSceneState extends Omit<
  SceneState,
  | "selected"
  | "onSelect"
  | "onPreview"
  | "onCommit"
  | "onCamera"
> {
  selected: SpatialTarget | null;
  /** Optional left-to-right room reveal; furnishings remain fully visible. */
  backgroundReveal?: number;
  onCamera?: (yaw: number, pitch: number) => void;
  layerOrder?: readonly SceneTarget[];
  /** Frozen item coordinate frame while the trial desk moves independently. */
  itemFrame?: DeskTransform;
  previewSelected?: boolean;
  allowDefaultDesk?: boolean;
  wheelZoom?: boolean;
  onSelect?: (
    category: SpatialTarget,
    preview?: boolean,
  ) => void;
  onPreview?: (
    category: SpatialTarget,
    transform: DeskTransform,
    preview?: boolean,
  ) => void;
  onCommit?: (
    category: SpatialTarget,
    transform: DeskTransform,
    preview?: boolean,
  ) => void;
  preview?: {
    category: MovableCategory;
    productId: string;
    transform: DeskTransform;
  };
  directManipulation?: boolean;
  editableCategories?: SpatialTarget[];
  onDeselect?: () => void;
  onSelectionBounds?: (
    bounds: SelectionBounds | null,
  ) => void;
}
