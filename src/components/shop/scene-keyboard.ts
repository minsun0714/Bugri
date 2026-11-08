import type { KeyboardEvent } from "react";
import type { SpatialTarget } from "@/lib/desk-spatial";

type Target = {
  category: SpatialTarget;
  preview: boolean;
};

export function sceneKeyDown(
  event: KeyboardEvent,
  {
    blocked,
    selected,
    previewSelected = false,
    targets,
    select,
    keyDown,
  }: {
    blocked: boolean;
    selected: SpatialTarget | null;
    previewSelected?: boolean;
    targets: Target[];
    select: (
      category: SpatialTarget,
      preview: boolean,
    ) => void;
    keyDown: (event: KeyboardEvent) => void;
  },
) {
  if (blocked) return;
  if (["Home", "PageDown", "PageUp"].includes(event.key)) {
    event.preventDefault();
    const index = targets.findIndex(
      (target) =>
        target.category === selected &&
        target.preview === previewSelected,
    );
    const next =
      event.key === "Home"
        ? 0
        : (index +
            (event.key === "PageUp" ? -1 : 1) +
            targets.length) %
          targets.length;
    const target = targets[next];
    if (target) select(target.category, target.preview);
    return;
  }
  keyDown(event);
}
