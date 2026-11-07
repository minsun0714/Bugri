"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
  constrain,
  createScene,
  initialScene,
  planeDelta,
  type Model,
  type SceneState,
} from "@/components/shop/zdog/scene";

export function ZdogPrototype() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<
    typeof createScene
  > | null>(null);
  const [state, setState] = useState(initialScene);
  const [mode, setMode] = useState<"camera" | Model>(
    "camera",
  );
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const latest = useRef(state);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    state: SceneState;
  } | null>(null);

  useEffect(() => {
    latest.current = state;
    engine.current?.render(state);
  }, [state]);

  useEffect(() => {
    if (!canvas.current) return;
    let observer: ResizeObserver | undefined;
    const frame = requestAnimationFrame(() => {
      if (!canvas.current) return;
      try {
        engine.current = createScene(canvas.current);
        engine.current.render(latest.current);
        observer = new ResizeObserver(() =>
          engine.current?.render(latest.current),
        );
        observer.observe(canvas.current);
        setReady(true);
      } catch {
        setError(true);
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);

  const selected = mode === "camera" ? "keyboard" : mode;
  const placement = state[selected];
  const update = (
    x: number,
    z: number,
    angle = placement.angle,
  ) =>
    setState({
      ...state,
      [selected]: constrain(selected, { x, z, angle }),
    });
  const cancel = () => {
    if (drag.current) setState(drag.current.state);
    drag.current = null;
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <Link href="/shop" className="text-sm text-primary">
        ← 상점
      </Link>
      <h1 className="mt-6 text-2xl">작은 데스크 실험실</h1>
      <p className="mt-2 text-sm text-muted">
        시점과 물건을 돌려 앞·옆·뒷면을 살펴보세요. 시제품
        배치는 저장되지 않습니다.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {(["camera", "keyboard", "monitor"] as const).map(
          (value) => (
            <Button
              key={value}
              variant={
                mode === value ? "primary" : "secondary"
              }
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              {value === "camera"
                ? "시점 회전"
                : value === "keyboard"
                  ? "키보드 이동"
                  : "모니터 이동"}
            </Button>
          ),
        )}
      </div>
      <canvas
        ref={canvas}
        width={800}
        height={460}
        tabIndex={0}
        aria-label="입체 데스크 시제품"
        aria-describedby="desk-help"
        data-ready={ready}
        className="mt-4 block w-full touch-none rounded-3xl border border-line bg-surface"
        onPointerDown={(event) => {
          if (event.button !== 0 || drag.current) return;
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(
            event.pointerId,
          );
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            state,
          };
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId)
            return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (mode === "camera") {
            setState({
              ...start.state,
              yaw: start.state.yaw + dx * 0.5,
              pitch: Math.max(
                10,
                Math.min(80, start.state.pitch - dy * 0.3),
              ),
            });
          } else {
            const delta = planeDelta(
              dx,
              dy,
              start.state,
              engine.current?.getZoom() ?? 1,
            );
            const value = start.state[mode];
            setState({
              ...start.state,
              [mode]: constrain(mode, {
                ...value,
                x: value.x + delta.x,
                z: value.z + delta.z,
              }),
            });
          }
        }}
        onPointerUp={(event) => {
          if (drag.current?.id !== event.pointerId) return;
          drag.current = null;
          event.currentTarget.releasePointerCapture(
            event.pointerId,
          );
        }}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            cancel();
            return;
          }
          const directions: Record<
            string,
            [number, number]
          > = {
            ArrowLeft: [-5, 0],
            ArrowRight: [5, 0],
            ArrowUp: [0, -5],
            ArrowDown: [0, 5],
          };
          const direction = directions[event.key];
          if (!direction) return;
          event.preventDefault();
          const [x, z] = direction;
          if (mode === "camera")
            setState({
              ...state,
              yaw: state.yaw + x,
              pitch: Math.max(
                10,
                Math.min(80, state.pitch - z),
              ),
            });
          else update(placement.x + x, placement.z + z);
        }}
      />
      {error && (
        <p role="alert">
          시제품을 열지 못했어요. 페이지를 새로고침해
          주세요.
        </p>
      )}
      <p id="desk-help" className="mt-3 text-sm text-muted">
        모드를 선택하고 화면을 드래그하세요. 방향키로도
        조작할 수 있고, 드래그 중 Esc를 누르면 취소됩니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            ["정면", 0],
            ["45도", 45],
            ["옆면", 90],
            ["뒷면", 180],
          ] as const
        ).map(([label, yaw]) => (
          <Button
            key={label}
            variant="secondary"
            onClick={() =>
              setState({ ...state, yaw, pitch: 25 })
            }
          >
            {label}
          </Button>
        ))}
        <Button
          variant="ghost"
          onClick={() => {
            setState(initialScene());
            setMode("camera");
          }}
        >
          처음으로
        </Button>
      </div>
      <label className="mt-6 block text-sm">
        상품 회전
        <input
          aria-label="상품 회전"
          type="range"
          min="0"
          max="359"
          value={placement.angle}
          onChange={(event) =>
            update(
              placement.x,
              placement.z,
              Number(event.target.value),
            )
          }
          className="mt-3 block w-full accent-primary"
        />
      </label>
      <output
        aria-label="선택 상품 배치"
        className="mt-2 block text-sm text-muted"
      >
        {selected === "keyboard" ? "키보드" : "모니터"} · X{" "}
        {placement.x} / Z {placement.z} · {placement.angle}°
      </output>
    </main>
  );
}
