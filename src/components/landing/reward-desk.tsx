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
  // The last 150svh is dedicated to painting the room; never rewind.
  const backgroundReveal = Math.min(
    1,
    Math.max(0, (progress - 1) / 0.625),
  );

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
        setProgress(1.625);
        return;
      }
      const { top, height } =
        section.getBoundingClientRect();
      const next = Math.min(
        1.625,
        Math.max(
          0,
          (-top / (height - innerHeight)) * 1.625,
        ),
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

  const arrivalTimes = useRef(new Map<string, number>());
  const [arrivals, setArrivals] = useState<
    Record<string, number>
  >({});
  const unlocked = furnishings.filter(
    ({ start }) => progress >= start,
  ).length;

  useEffect(() => {
    if (!unlocked) return;
    const reduced = matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const now = performance.now();
    for (const { category } of furnishings.slice(
      0,
      unlocked,
    )) {
      if (!arrivalTimes.current.has(category))
        arrivalTimes.current.set(category, now);
    }
    let frame = 0;
    const animate = (time: number) => {
      const next: Record<string, number> = {};
      let pending = false;
      for (const [
        category,
        started,
      ] of arrivalTimes.current) {
        const amount =
          reduced.matches ||
          innerHeight < 700 ||
          !CSS.supports("animation-timeline", "view()")
            ? 1
            : Math.min(1, (time - started) / 900);
        next[category] = amount;
        if (amount < 1) pending = true;
      }
      setArrivals(next);
      if (pending) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [unlocked]);

  const equipment: Equipment = {
    [Category.DESK]: "desk-1",
  };
  if (progress >= 1)
    equipment[Category.BACKGROUND] = "background-1";
  const transforms: DeskTransforms = {};

  for (const {
    category,
    productId,
    start,
  } of furnishings) {
    if (progress < start) continue;
    equipment[category] = productId;
    const landing = arrivals[category] ?? 0;
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
        <span className="absolute left-1/2 top-0 grid size-9 place-items-center rounded-full border-[3px] border-coin-edge bg-coin-body font-bold text-coin-ink motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-reward-coin motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-timeline:--learning-story] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-range:contain_0%_contain_61.538%]">
          B
        </span>
        <span className="absolute left-[65%] top-8 grid size-9 place-items-center rounded-full border-[3px] border-coin-edge bg-coin-body font-bold text-coin-ink motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-reward-coin-late motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-timeline:--learning-story] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-range:contain_0%_contain_61.538%]">
          B
        </span>
      </div>
      <div className="h-[min(44svh,460px)] overflow-hidden [&_[data-renderer]]:h-[min(44svh,460px)] [&_[data-renderer]]:scale-125 md:h-[min(50svh,520px)] md:[&_[data-renderer]]:h-[min(50svh,520px)] [&_canvas]:pointer-events-none [&_[data-renderer]]:pointer-events-none">
        {progress >= 0.56 ? (
          <ThreeView
            backgroundReveal={backgroundReveal}
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
