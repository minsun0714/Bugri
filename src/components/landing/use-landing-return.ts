"use client";

import { useEffect, useRef } from "react";

// The desk is fully visible here. Skip only the already-seen hold
// between this entrance and the furthest point, in either direction.
const deskEntrance = 0.72 / 1.625;

export function useLandingReturn() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    let previousY = scrollY;
    let returnUntil = 0;
    let inputDirection = 0;
    let furthest = 0;
    let touchY: number | undefined;

    const reset = () => {
      returnUntil = 0;
      inputDirection = 0;
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
    const arm = (
      event: Event,
      direction: number,
      duration: number,
    ) => {
      inputDirection = acceptsInput(event)
        ? Math.sign(direction)
        : 0;
      returnUntil = inputDirection
        ? performance.now() + duration
        : 0;
    };
    const wheel = (event: WheelEvent) => {
      arm(
        event,
        !event.ctrlKey &&
          Math.abs(event.deltaY) > Math.abs(event.deltaX)
          ? event.deltaY
          : 0,
        400,
      );
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
      arm(
        event,
        nextY !== undefined && touchY !== undefined
          ? touchY - nextY
          : 0,
        700,
      );
      touchY = nextY;
    };
    const keydown = (event: KeyboardEvent) => {
      if (
        event.key === " " &&
        event.target instanceof Element &&
        event.target.closest(
          'button, summary, [role="button"], [role="checkbox"], [role="switch"]',
        )
      ) {
        reset();
        return;
      }
      const upward =
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        (event.key === " " && event.shiftKey);
      const downward =
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        (event.key === " " && !event.shiftKey);
      arm(
        event,
        !event.ctrlKey && !event.metaKey && !event.altKey
          ? upward
            ? -1
            : downward
              ? 1
              : 0
          : 0,
        400,
      );
      // Handle a keyboard skip before its native smooth scroll starts, so
      // opposite key presses cannot leave competing scroll animations.
      if (inputDirection && jump(inputDirection))
        event.preventDefault();
    };
    const jump = (direction: number) => {
      const currentY = window.scrollY;
      const element = section.current;
      if (!element) return;
      const { top, height } =
        element.getBoundingClientRect();
      const hold = height - innerHeight;
      if (hold <= 0) return;
      const offset = -top;
      furthest = Math.max(
        furthest,
        Math.min(1, Math.max(0, offset / hold)),
      );

      if (
        !direction ||
        matchMedia("(prefers-reduced-motion: reduce)")
          .matches ||
        innerHeight < 700 ||
        !CSS.supports("animation-timeline", "view()")
      )
        return;
      const entrance = hold * deskEntrance;
      const target =
        direction < 0 ? entrance : hold * furthest;

      // Preserve the scene transition and stop at the furthest seen point.
      // A completed scene skips to the end of its hold, not into the quiz.
      if (
        offset < entrance - 1 ||
        offset > hold ||
        Math.abs(target - offset) < 1
      )
        return;
      returnUntil = 0;
      inputDirection = 0;
      previousY = currentY + top + target;
      window.scrollTo({
        top: previousY,
        behavior: "instant",
      });
      return true;
    };
    const scroll = () => {
      const currentY = window.scrollY;
      const direction = Math.sign(currentY - previousY);
      // End stale momentum intent when navigation changes direction.
      if (direction && direction !== inputDirection)
        returnUntil = 0;
      previousY = currentY;
      jump(
        performance.now() <= returnUntil ? direction : 0,
      );
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
