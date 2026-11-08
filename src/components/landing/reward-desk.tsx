"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Category, DeskTool } from "@/api/constants";
import type {
  Equipment,
  DeskTransforms,
} from "@/api/contracts";
import { defaultTransforms } from "@/lib/desk-spatial";
import { Bugri } from "@/components/ui/bugri";
import { useTranslation } from "@/lib/i18n/use-translation";

const ThreeView = dynamic(
  () =>
    import("@/components/shop/three-view").then(
      ({ ThreeView }) => ThreeView,
    ),
  { ssr: false },
);

const furnishings = [
  {
    category: Category.MONITOR,
    productId: "monitor-1",
    start: 0.76,
  },
  {
    category: Category.KEYBOARD,
    productId: "keyboard-1",
    start: 0.84,
  },
  {
    category: Category.ACCESSORY,
    productId: "accessory-1",
    start: 0.92,
  },
] as const;

export function RewardDesk() {
  const t = useTranslation();
  const host = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = host.current?.closest("section");
    if (!section) return;
    const reduced = matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      if (
        reduced.matches ||
        innerHeight < 700 ||
        !CSS.supports("animation-timeline", "view()")
      ) {
        setProgress(1);
        return;
      }
      const { top, height } =
        section.getBoundingClientRect();
      const next = Math.min(
        1,
        Math.max(0, -top / (height - innerHeight)),
      );
      setProgress((previous) =>
        Math.max(previous, Math.round(next * 200) / 200),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, []);

  const equipment: Equipment = {
    [Category.DESK]: "desk-1",
  };
  if (progress >= 0.98)
    equipment[Category.BACKGROUND] = "background-1";
  const transforms: DeskTransforms = {};

  for (const {
    category,
    productId,
    start,
  } of furnishings) {
    if (progress < start) continue;
    equipment[category] = productId;
    const landing = Math.min(1, (progress - start) / 0.05);
    transforms[category] = {
      ...defaultTransforms[category],
      y:
        defaultTransforms[category].y +
        (1 - landing) ** 2 * 1.8,
    };
  }

  return (
    <div
      ref={host}
      data-testid="reward-desk"
      className="relative w-full"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 overflow-hidden ${progress >= 0.86 ? "invisible" : ""}`}
      >
        <span className="absolute left-1/2 top-0 grid size-9 place-items-center rounded-full border-[3px] border-coin-edge bg-coin-body font-bold text-coin-ink motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-reward-coin motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-timeline:--learning-story] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-range:contain_0%_contain_100%]">
          B
        </span>
        <span className="absolute left-[65%] top-8 grid size-9 place-items-center rounded-full border-[3px] border-coin-edge bg-coin-body font-bold text-coin-ink motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-reward-coin-late motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-timeline:--learning-story] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-range:contain_0%_contain_100%]">
          B
        </span>
      </div>
      <div className="h-[min(44svh,460px)] overflow-hidden [&_[data-renderer]]:h-[min(44svh,460px)] [&_[data-renderer]]:scale-125 md:h-[min(50svh,520px)] md:[&_[data-renderer]]:h-[min(50svh,520px)] [&_canvas]:pointer-events-none [&_[data-renderer]]:pointer-events-none">
        {progress >= 0.56 ? (
          <ThreeView
            equipment={equipment}
            transforms={transforms}
            readOnly
            disabled
            selected={null}
            tool={DeskTool.CAMERA}
            wheelZoom={false}
            showViewPresets={false}
            label={t(
              "BugCoin으로 꾸미는 버그리의 3D 공간 예시",
            )}
          />
        ) : (
          <div className="flex h-65 items-end justify-start p-8 sm:h-105">
            <Bugri mood="happy" />
          </div>
        )}
      </div>
    </div>
  );
}
