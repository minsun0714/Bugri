import type { SceneState } from "@/components/shop/three/engine";
import type { MovableCategory } from "@/lib/desk-layout";

export interface SelectionBounds {
  category: MovableCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface DeskSceneState extends SceneState {
  directManipulation?: boolean;
  editableCategories?: MovableCategory[];
  onDeselect?: () => void;
  onSelectionBounds?: (
    bounds: SelectionBounds | null,
  ) => void;
}
