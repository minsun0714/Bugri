"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import { DeskTool, LayerAction } from "@/api/constants";
import { Button } from "@/components/ui";
import type { SelectionBounds } from "@/components/shop/zdog/scene-state";

export function SelectionOverlay({
  bounds,
  disabled,
  onStart,
  onStep,
  onReorder,
}: {
  onReorder?: (action: LayerAction) => void;
  bounds: SelectionBounds;
  disabled: boolean;
  onStart: (
    event: PointerEvent<HTMLButtonElement>,
    tool: DeskTool,
  ) => void;
  onStep: (tool: DeskTool, direction: number) => void;
}) {
  const t = useTranslation();

  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    menu.current
      ?.querySelector<HTMLButtonElement>("[role=menuitem]")
      ?.focus();
    const outside = (event: globalThis.PointerEvent) => {
      if (
        !menu.current?.contains(event.target as Node) &&
        !trigger.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () =>
      document.removeEventListener("pointerdown", outside);
  }, [open]);
  function closeMenu() {
    setOpen(false);
    trigger.current?.focus();
  }
  function menuKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (
      !["ArrowUp", "ArrowDown", "Home", "End"].includes(
        event.key,
      )
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    const items = Array.from(
      menu.current?.querySelectorAll<HTMLButtonElement>(
        "[role=menuitem]",
      ) ?? [],
    );
    const index = items.findIndex(
      (item) => item === document.activeElement,
    );
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (index +
              (event.key === "ArrowDown" ? 1 : -1) +
              items.length) %
            items.length;
    items[next]?.focus();
  }
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
  const controlX = Math.max(
    4,
    Math.min(
      bounds.viewportWidth - 32,
      bounds.x + bounds.width - 14,
    ),
  );
  const controlY = Math.max(
    4,
    Math.min(bounds.viewportHeight - 32, bounds.y - 32),
  );
  const menuButtonX =
    controlX >= 36 ? controlX - 32 : controlX + 32;
  const position = {
    "--menu-button-x": `${menuButtonX}px`,
    "--menu-x": `${Math.max(4, Math.min(bounds.viewportWidth - 180, menuButtonX - 148))}px`,
    "--menu-y": `${Math.max(4, Math.min(bounds.viewportHeight - 168, controlY + 32))}px`,
    "--selection-x": `${bounds.x}px`,
    "--selection-y": `${bounds.y}px`,
    "--selection-width": `${bounds.width}px`,
    "--selection-height": `${bounds.height}px`,
    "--controls-x": `${controlX}px`,
    "--controls-y": `${controlY}px`,
  } as CSSProperties;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={position}
    >
      <div
        role="group"
        aria-label={t("선택 테두리")}
        className="absolute left-[var(--selection-x)] top-[var(--selection-y)] h-[var(--selection-height)] w-[var(--selection-width)] border-2 border-primary before:absolute before:-left-1 before:-top-1 before:size-2 before:border before:border-primary before:bg-surface after:absolute after:-bottom-1 after:-right-1 after:size-2 after:border after:border-primary after:bg-surface"
      />
      <div
        className="pointer-events-auto absolute left-[var(--controls-x)] top-[var(--controls-y)] "
        role="group"
        aria-label={t("선택 상품 조작")}
      >
        <Button
          size="sm"
          variant="ghost"
          className="relative !h-7 !min-h-0 !w-7 !rounded-full !border-0 !p-0 !shadow-none !text-primary touch-none !cursor-grab active:!cursor-grabbing after:absolute after:left-1/2 after:top-full after:h-1 after:w-px after:bg-primary"
          aria-label={t("선택 상품 회전")}
          title={t(
            "누른 채 좌우로 드래그해 회전 · 방향키로 15도씩 조절",
          )}
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
      {onReorder && (
        <>
          <Button
            size="sm"
            variant="ghost"
            aria-label={t("선택 아이템 메뉴")}
            aria-haspopup="menu"
            aria-expanded={open}
            disabled={disabled}
            className="pointer-events-auto absolute left-[var(--menu-button-x)] top-[var(--controls-y)] !h-7 !min-h-0 !w-7 !rounded-full !p-0 !text-lg !shadow-none"
            onClick={(event) => {
              trigger.current = event.currentTarget;
              setOpen((value) => !value);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                trigger.current = event.currentTarget;
                setOpen(true);
              }
            }}
          >
            …
          </Button>
          {open && (
            <div
              ref={menu}
              role="menu"
              aria-label={t("겹침 순서 변경")}
              onKeyDown={menuKeyDown}
              className="pointer-events-auto absolute left-[var(--menu-x)] top-[var(--menu-y)] z-50 w-44 overflow-hidden rounded-control border border-control-line bg-surface-raised p-0"
            >
              {[
                [LayerAction.FORWARD, t("앞으로 가져오기")],
                [LayerAction.BACKWARD, t("뒤로 보내기")],
                [LayerAction.FRONT, t("맨 앞으로 보내기")],
                [LayerAction.BACK, t("맨 뒤로 보내기")],
              ].map(([action, label]) => (
                <Button
                  key={action}
                  role="menuitem"
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start !rounded-none"
                  disabled={disabled}
                  onClick={() => {
                    closeMenu();
                    onReorder(action as LayerAction);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
