"use client";

import { useEffect, useId, useRef } from "react";
import {
  useDropdown,
  type DropdownOption,
} from "@/components/ui/hooks/use-dropdown";

export function Dropdown({
  label,
  options,
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const list = useRef<HTMLUListElement>(null);
  const {
    expanded,
    activeIndex,
    root,
    trigger,
    toggle,
    choose,
    onKeyDown,
    close,
  } = useDropdown({
    options,
    value,
    onValueChange,
    disabled,
  });
  const selected = options.find(
    (option) => option.value === value,
  );

  useEffect(() => {
    if (expanded)
      list.current?.children[activeIndex]?.scrollIntoView?.(
        { block: "nearest" },
      );
  }, [activeIndex, expanded]);

  return (
    <div
      ref={root}
      className="relative grid w-full gap-2.25"
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node,
          )
        )
          close();
      }}
    >
      <span
        id={`${id}-label`}
        className="text-xs font-semibold"
      >
        {label}
      </span>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-labelledby={`${id}-label`}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        aria-controls={
          expanded ? `${id}-options` : undefined
        }
        aria-activedescendant={
          expanded
            ? `${id}-option-${activeIndex}`
            : undefined
        }
        disabled={disabled || !options.length}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${expanded ? "border-primary/20 bg-primary/10 text-primary" : "border-line bg-surface text-foreground hover:bg-canvas"}`}
      >
        <span className="min-w-0 truncate">
          {selected?.label ?? "선택하세요"}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`size-4 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {expanded && (
        <ul
          ref={list}
          id={`${id}-options`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-30 grid max-h-64 gap-1 overflow-y-auto rounded-3xl border border-line bg-surface p-2 shadow-[0_16px_45px_-12px_#34204b40]"
        >
          {options.map((option, index) => (
            <li
              id={`${id}-option-${index}`}
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onPointerDown={(event) =>
                event.preventDefault()
              }
              onClick={() => choose(index)}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${option.value === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-canvas"} ${activeIndex === index ? "ring-1 ring-inset ring-primary/30" : ""}`}
            >
              <span className="min-w-0 flex-1 break-words">
                {option.label}
              </span>
              {option.value === value && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4 shrink-0"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
