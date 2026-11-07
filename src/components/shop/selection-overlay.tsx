import type {
  CSSProperties,
  PointerEvent,
  KeyboardEvent,
} from "react";
import { DeskTool } from "@/api/constants";
import { Button } from "@/components/ui";
import type { SelectionBounds } from "@/components/shop/zdog/scene-state";

export function SelectionOverlay({
  bounds,
  disabled,
  onStart,
  onStep,
}: {
  bounds: SelectionBounds;
  disabled: boolean;
  onStart: (
    event: PointerEvent<HTMLButtonElement>,
    tool: DeskTool,
  ) => void;
  onStep: (tool: DeskTool, direction: number) => void;
}) {
  function keyDown(event: KeyboardEvent, tool: DeskTool) {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Enter",
        " ",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    onStep(
      tool,
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? -1
        : 1,
    );
  }
  const position = {
    "--selection-x": `${bounds.x}px`,
    "--selection-y": `${bounds.y}px`,
    "--selection-width": `${bounds.width}px`,
    "--selection-height": `${bounds.height}px`,
    "--controls-x": `${Math.max(4, Math.min(bounds.viewportWidth - 32, bounds.x + bounds.width - 14))}px`,
    "--controls-y": `${Math.max(4, Math.min(bounds.viewportHeight - 32, bounds.y - 32))}px`,
  } as CSSProperties;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={position}
    >
      <div
        role="group"
        aria-label="선택 테두리"
        className="absolute left-[var(--selection-x)] top-[var(--selection-y)] h-[var(--selection-height)] w-[var(--selection-width)] border-2 border-primary before:absolute before:-left-1 before:-top-1 before:size-2 before:border before:border-primary before:bg-surface after:absolute after:-bottom-1 after:-right-1 after:size-2 after:border after:border-primary after:bg-surface"
      />
      <div
        className="pointer-events-auto absolute left-[var(--controls-x)] top-[var(--controls-y)] "
        role="group"
        aria-label="선택 상품 조작"
      >
        <Button
          size="sm"
          variant="ghost"
          className="relative !h-7 !min-h-0 !w-7 !rounded-full !border-0 !p-0 !shadow-none !text-primary touch-none !cursor-grab active:!cursor-grabbing after:absolute after:left-1/2 after:top-full after:h-1 after:w-px after:bg-primary"
          aria-label="선택 상품 회전"
          title="누른 채 좌우로 드래그해 회전 · 방향키로 15도씩 조절"
          disabled={disabled}
          onPointerDown={(event) =>
            onStart(event, DeskTool.ROTATE)
          }
          onKeyDown={(event) =>
            keyDown(event, DeskTool.ROTATE)
          }
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 8a8 8 0 1 0 1 7" />
            <path d="M19 3v5h-5" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
