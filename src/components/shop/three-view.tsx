"use client";

import { defaultTransforms } from "@/lib/desk-spatial";
import { isMovable } from "@/lib/desk-layout";

import { useEffect, useRef, useState } from "react";
import type {
  SceneState,
  createDeskEngine,
} from "@/components/shop/three/engine";
import { DeskView } from "@/api/constants";
import { Button } from "@/components/ui";
import { artworkNames } from "@/components/shop/artwork";

type Engine = ReturnType<typeof createDeskEngine>;
type Props = Omit<SceneState, "onError" | "onCamera"> & {
  label?: string;
};

export function ThreeView(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const latest = useRef(props);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const [angle, setAngle] = useState(45);
  const label = props.label ?? "내 데스크";
  const names =
    Object.values(props.equipment)
      .map((id) => artworkNames[id] ?? id)
      .join(", ") || "기본 데스크";

  useEffect(() => {
    latest.current = props;
    engine.current?.sync({
      ...props,
      onError: () => setFailed(true),
      onCamera: setAngle,
    });
  }, [props]);

  useEffect(() => {
    let cancelled = false;
    let instance: Engine | null = null;
    import("@/components/shop/three/engine")
      .then(({ createDeskEngine }) => {
        if (cancelled || !host.current) return;
        instance = createDeskEngine(host.current, {
          ...latest.current,
          onError: () => setFailed(true),
          onCamera: setAngle,
        });
        engine.current = instance;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      instance?.dispose();
      engine.current = null;
    };
  }, [retry]);

  return (
    <div role="group" aria-label={`${label} · ${names}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2">
        <div className="flex gap-1">
          {[
            [DeskView.ANGLED, "45도 시점"],
            [DeskView.FRONT, "정면"],
            [DeskView.TOP, "위에서"],
          ].map(([view, text]) => (
            <Button
              key={view}
              variant="ghost"
              size="sm"
              disabled={!ready || failed}
              onClick={() =>
                engine.current?.view(view as DeskView)
              }
            >
              {text}
            </Button>
          ))}
        </div>
        <output
          aria-label="카메라 방위각"
          className="text-xs text-muted"
        >
          {angle}°
        </output>
      </div>
      <div
        ref={host}
        role="img"
        aria-label="3D 데스크 캔버스"
        data-renderer={
          ready && !failed ? "webgl" : "unavailable"
        }
        className="relative h-[320px] overflow-hidden rounded-2xl bg-canvas sm:h-[420px]"
      />
      <ul aria-label="3D 배치 정보" className="sr-only">
        {Object.entries(props.equipment).map(
          ([category, id]) => {
            if (!isMovable(category)) return null;
            const transform =
              props.transforms[category] ??
              defaultTransforms[category];
            return (
              <li key={category}>
                {artworkNames[id]}: X{" "}
                {transform.x.toFixed(2)}, 높이{" "}
                {transform.y.toFixed(2)}, Z{" "}
                {transform.z.toFixed(2)}, 회전{" "}
                {transform.rotationY}°
              </li>
            );
          },
        )}
      </ul>
      {!ready && !failed && (
        <p role="status" className="p-3 text-xs text-muted">
          3D 공간을 준비하고 있어요…
        </p>
      )}
      {failed && (
        <div
          role="alert"
          className="p-3 text-sm text-muted"
        >
          <p>
            3D 화면을 열 수 없어요. 브라우저의 그래픽 가속
            설정을 확인해 주세요. 구매·배치 기록은 그대로
            유지됩니다.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setFailed(false);
              setReady(false);
              setRetry((value) => value + 1);
            }}
          >
            3D 다시 열기
          </Button>
        </div>
      )}
    </div>
  );
}
