import type { DeskTransform } from "@/api/contracts";
import type { SceneState } from "@/components/shop/three/engine";
import type { MovableCategory } from "@/lib/desk-layout";

export const SceneObject = { PREVIEW: "PREVIEW" } as const;
export type SceneTarget =
  MovableCategory | typeof SceneObject.PREVIEW;

export interface SelectionBounds {
  category: SceneTarget;
  x: number;
  y: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface DeskSceneState extends SceneState {
  /** Frozen item coordinate frame while the trial desk moves independently. */
  itemFrame?: DeskTransform;
  previewSelected?: boolean;
  allowDefaultDesk?: boolean;
  onSelect?: (
    category: MovableCategory,
    preview?: boolean,
  ) => void;
  onPreview?: (
    category: MovableCategory,
    transform: DeskTransform,
    preview?: boolean,
  ) => void;
  onCommit?: (
    category: MovableCategory,
    transform: DeskTransform,
    preview?: boolean,
  ) => void;
  preview?: {
    category: MovableCategory;
    productId: string;
    transform: DeskTransform;
  };
  directManipulation?: boolean;
  editableCategories?: MovableCategory[];
  onDeselect?: () => void;
  onSelectionBounds?: (
    bounds: SelectionBounds | null,
  ) => void;
}
