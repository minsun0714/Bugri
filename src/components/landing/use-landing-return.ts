"use client";

import { useEffect, useRef } from "react";

// The desk is fully visible here. Returning to this point skips only
// the retained furnishing hold, without changing the scene on screen.
const deskEntrance = 0.72 / 1.625;

export function useLandingReturn() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    let previousY = scrollY;
    let returnUntil = 0;
    let touchY: number | undefined;

    const reset = () => {
      returnUntil = 0;
      previousY = scrollY;
    };
    const acceptsInput = (event: Event) =>
      !event.defaultPrevented &&
      !(
        event.target instanceof Element &&
        event.target.closest(
          'dialog, [role="dialog"], input, textarea, select, [contenteditable="true"]',
        )
      );
    const wheel = (event: WheelEvent) => {
      returnUntil =
        acceptsInput(event) &&
        !event.ctrlKey &&
        event.deltaY < 0 &&
        Math.abs(event.deltaY) > Math.abs(event.deltaX)
          ? performance.now() + 400
          : 0;
    };
    const touchStart = (event: TouchEvent) => {
      reset();
      touchY =
        event.touches.length === 1
          ? event.touches[0].clientY
          : undefined;
    };
    const touchMove = (event: TouchEvent) => {
      const nextY =
        event.touches.length === 1
          ? event.touches[0].clientY
          : undefined;
      returnUntil =
        acceptsInput(event) &&
        nextY !== undefined &&
        touchY !== undefined &&
        nextY > touchY
          ? performance.now() + 700
          : 0;
      touchY = nextY;
    };
    const keydown = (event: KeyboardEvent) => {
      const upward =
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        (event.key === " " && event.shiftKey);
      returnUntil =
        acceptsInput(event) &&
        upward &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
          ? performance.now() + 400
          : 0;
    };
    const scroll = () => {
      const currentY = window.scrollY;
      const upward = currentY < previousY;
      // A new downward journey ends the prior return gesture, including
      // its momentum window. Do not apply it to subsequent navigation.
      if (currentY > previousY) returnUntil = 0;
      previousY = currentY;

      if (
        !upward ||
        performance.now() > returnUntil ||
        matchMedia("(prefers-reduced-motion: reduce)")
          .matches ||
        innerHeight < 700 ||
        !CSS.supports("animation-timeline", "view()")
      )
        return;
      const element = section.current;
      if (!element) return;
      const { top, height } =
        element.getBoundingClientRect();
      const hold = height - innerHeight;
      const offset = -top;
      const entrance = hold * deskEntrance;

      // Let the desk naturally re-enter from the quiz before skipping its hold.
      if (offset <= entrance || offset > hold) return;
      returnUntil = 0;
      previousY = currentY + top + entrance;
      window.scrollTo({
        top: previousY,
        behavior: "instant",
      });
    };

    addEventListener("wheel", wheel, { passive: true });
    addEventListener("touchstart", touchStart, {
      passive: true,
    });
    addEventListener("touchmove", touchMove, {
      passive: true,
    });
    addEventListener("keydown", keydown);
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("pointerdown", reset);
    addEventListener("focusin", reset);
    addEventListener("resize", reset);

    return () => {
      removeEventListener("wheel", wheel);
      removeEventListener("touchstart", touchStart);
      removeEventListener("touchmove", touchMove);
      removeEventListener("keydown", keydown);
      removeEventListener("scroll", scroll);
      removeEventListener("pointerdown", reset);
      removeEventListener("focusin", reset);
      removeEventListener("resize", reset);
    };
  }, []);

  return section;
}
