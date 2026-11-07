import type {
  CSSProperties,
  PointerEvent,
  KeyboardEvent,
} from "react";
import { Category, DeskTool } from "@/api/constants";
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
    "--controls-x": `${Math.max(4, Math.min(bounds.viewportWidth - 100, bounds.x + bounds.width + 8))}px`,
    "--controls-y": `${Math.max(4, Math.min(bounds.viewportHeight - 48, bounds.y - 4))}px`,
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
        className="pointer-events-auto absolute left-[var(--controls-x)] top-[var(--controls-y)] flex gap-1 rounded-xl bg-surface p-1 shadow-sm"
        role="group"
        aria-label="선택 상품 조작"
      >
        <Button
          size="sm"
          variant="secondary"
          className="!h-10 !w-10 !p-0 touch-none !cursor-grab active:!cursor-grabbing"
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
          <span
            aria-hidden="true"
            className="flex flex-col items-center leading-none"
          >
            <span className="text-base">↻</span>
            <span className="mt-1 text-[9px]">드래그</span>
          </span>
        </Button>
        {bounds.category !== Category.DESK && (
          <Button
            size="sm"
            variant="secondary"
            className="!h-10 !w-10 !p-0 touch-none"
            aria-label="선택 상품 높이"
            title="클릭하여 높이 올리기 · 위아래 드래그·방향키로 조절"
            disabled={disabled}
            onPointerDown={(event) =>
              onStart(event, DeskTool.HEIGHT)
            }
            onKeyDown={(event) =>
              keyDown(event, DeskTool.HEIGHT)
            }
          >
            ↕
          </Button>
        )}
      </div>
    </div>
  );
}
