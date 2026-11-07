import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

export function useDropdown({
  options,
  value,
  onValueChange,
  disabled,
}: {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selectedIndex = options.findIndex(
    (option) => option.value === value,
  );
  const expanded = open && !disabled;

  useEffect(() => {
    if (!expanded) return;

    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node))
        setOpen(false);
    }

    document.addEventListener("pointerdown", outside);
    return () =>
      document.removeEventListener("pointerdown", outside);
  }, [expanded]);

  function toggle() {
    if (disabled || !options.length) return;
    setActiveIndex(Math.max(0, selectedIndex));
    setOpen(!expanded);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || disabled) return;
    setOpen(false);
    trigger.current?.focus();
    onValueChange(option.value);
  }

  function onKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (disabled || !options.length) return;
    const { key } = event;

    if (key === "Tab") {
      setOpen(false);
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (expanded) choose(activeIndex);
      else toggle();
      return;
    }
    if (
      ["ArrowDown", "ArrowUp", "Home", "End"].includes(key)
    ) {
      event.preventDefault();
      setOpen(true);
      if (key === "Home") setActiveIndex(0);
      else if (key === "End")
        setActiveIndex(options.length - 1);
      else if (!expanded)
        setActiveIndex(Math.max(0, selectedIndex));
      else
        setActiveIndex(
          (index) =>
            (index +
              (key === "ArrowDown" ? 1 : -1) +
              options.length) %
            options.length,
        );
      return;
    }
    if (
      key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const index = options.findIndex(({ label }) =>
        label
          .toLocaleLowerCase()
          .startsWith(key.toLocaleLowerCase()),
      );
      if (index >= 0) {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(index);
      }
    }
  }

  return {
    expanded,
    activeIndex,
    root,
    trigger,
    toggle,
    choose,
    onKeyDown,
    close: () => setOpen(false),
  };
}
