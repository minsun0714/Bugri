"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import {
  deskItems,
  normalizeOrder,
} from "@/lib/desk-order";
import { roomTheme } from "@/components/shop/room-theme";

import { defaultTransforms } from "@/lib/desk-spatial";
import { isMovable } from "@/lib/desk-layout";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEventHandler,
  type CSSProperties,
} from "react";
import {
  SceneObject,
  type DeskSceneState,
  type SelectionBounds,
} from "@/components/shop/zdog/scene-state";
import { SelectionOverlay } from "@/components/shop/selection-overlay";
import { constrainTransform } from "@/lib/desk-spatial";
import type { createDeskEngine } from "@/components/shop/zdog/engine";
import {
  DeskView,
  DeskTool,
  Category,
  DeskObject,
  type LayerAction,
} from "@/api/constants";
import { Button } from "@/components/ui";
import { artworkNames } from "@/components/shop/artwork";

type Engine = ReturnType<typeof createDeskEngine>;
type Props = Omit<
  DeskSceneState,
  "onError" | "onCamera"
> & {
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onReorder?: (
    target: import("@/components/shop/zdog/scene-state").SceneTarget,
    action: LayerAction,
  ) => void;
  label?: string;
  showViewPresets?: boolean;
};

export function ThreeView(props: Props) {
  const t = useTranslation();

  const descriptionId = useId();
  const host = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const latest = useRef(props);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const [camera, setCamera] = useState({
    yaw: 45,
    pitch: 30,
  });
  function updateCamera(yaw: number, pitch: number) {
    setCamera({ yaw, pitch });
  }
  const [selection, setSelection] =
    useState<SelectionBounds | null>(null);
  function updateSelection(next: SelectionBounds | null) {
    setSelection((previous) =>
      JSON.stringify(previous) === JSON.stringify(next)
        ? previous
        : next,
    );
  }
  function step(tool: DeskTool, direction: number) {
    const { selected, transforms, disabled } = props;
    if (!selected || disabled) return;
    const current =
      props.previewSelected &&
      props.preview?.category === selected
        ? props.preview.transform
        : (transforms[selected] ??
          defaultTransforms[selected]);
    const transform = constrainTransform(selected, {
      ...current,
      ...(tool === DeskTool.ROTATE
        ? { rotationY: current.rotationY + direction * 15 }
        : { y: current.y + direction * 0.1 }),
    });
    props.onPreview?.(
      selected,
      transform,
      props.previewSelected,
    );
    props.onCommit?.(
      selected,
      transform,
      props.previewSelected,
    );
  }
  const label = props.label ?? t("내 데스크");
  const names =
    [
      ...Object.values(props.equipment).map(
        (id) => artworkNames[id] ?? id,
      ),
      ...(props.preview?.category === Category.DESK &&
      !props.equipment.DESK
        ? [t("기본 데스크")]
        : []),
      ...(props.preview
        ? [
            artworkNames[props.preview.productId] ??
              props.preview.productId,
          ]
        : []),
    ].join(", ") || t("기본 데스크");

  useEffect(() => {
    latest.current = props;
    engine.current?.sync({
      ...props,
      onError: () => setFailed(true),
      onCamera: updateCamera,
      onSelectionBounds: updateSelection,
    });
  }, [props]);

  useEffect(() => {
    let cancelled = false;
    let instance: Engine | null = null;
    import("@/components/shop/zdog/engine")
      .then(({ createDeskEngine }) => {
        if (cancelled || !host.current || !viewport.current)
          return;
        instance = createDeskEngine(
          host.current,
          {
            ...latest.current,
            onError: () => setFailed(true),
            onCamera: updateCamera,
            onSelectionBounds: updateSelection,
          },
          viewport.current,
        );
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

  // The canvas is owned by the scene engine, so synchronize its accessible name separately.
  useEffect(() => {
    host.current
      ?.querySelector("canvas")
      ?.setAttribute("aria-label", t("3D 데스크 캔버스"));
  }, [ready, t]);

  return (
    <div role="group" aria-label={`${label} · ${names}`}>
      <div
        className={
          props.showViewPresets === false
            ? "sr-only"
            : "mb-2 flex flex-wrap items-center justify-between gap-2 px-2"
        }
      >
        {props.showViewPresets !== false && (
          <div className="flex gap-1">
            {[
              [DeskView.ANGLED, t("45도 시점")],
              [DeskView.FRONT, t("정면")],
              [DeskView.TOP, t("위에서")],
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
        )}
        <output
          aria-label={t("카메라 방위각")}
          className="sr-only"
        >
          {camera.yaw}°
        </output>
        <output
          aria-label={t("카메라 높낮이 각도")}
          className="sr-only"
        >
          {camera.pitch}°
        </output>
      </div>
      <div ref={viewport} className="relative">
        <div
          ref={host}
          style={
            {
              "--room-backdrop": roomTheme(
                props.equipment.BACKGROUND,
              ).backdrop,
            } as CSSProperties
          }
          tabIndex={props.onKeyDown ? 0 : undefined}
          onKeyDown={props.onKeyDown}
          onPointerDown={
            props.onKeyDown
              ? (event) => event.currentTarget.focus()
              : undefined
          }
          role="img"
          data-disabled={props.disabled}
          aria-label={t("3D 데스크 캔버스")}
          aria-describedby={descriptionId}
          data-renderer={
            ready && !failed ? "canvas" : "unavailable"
          }
          className="relative h-[320px] overflow-hidden rounded-2xl bg-[image:var(--room-backdrop)] sm:h-[420px]"
        />
        {selection &&
          (props.previewSelected
            ? SceneObject.PREVIEW
            : props.selected) === selection.category &&
          props.directManipulation &&
          !props.readOnly &&
          !failed && (
            <SelectionOverlay
              key={selection.category}
              onReorder={
                props.onReorder
                  ? (action) =>
                      props.onReorder?.(
                        selection.category,
                        action,
                      )
                  : undefined
              }
              bounds={selection}
              disabled={props.disabled}
              onStart={(event, tool) => {
                event.preventDefault();
                event.currentTarget.focus();
                engine.current?.beginHandle(
                  event.nativeEvent,
                  tool,
                );
              }}
              onStep={step}
            />
          )}
      </div>
      <p id={descriptionId} className="sr-only">
        {t("버그리가 공간에서 함께하고 있어요.")}
        {props.onKeyDown &&
          t(
            " Home 키로 첫 상품을 선택하고 PageDown/PageUp 키로 상품을 바꿉니다. 방향키로 이동하고 Alt와 방향키로 회전합니다. Shift와 위아래 방향키로 높이를 조절하고 Enter로 저장, Escape로 취소합니다.",
          )}
      </p>
      <output
        aria-label={t("겹침 순서")}
        className="sr-only"
      >
        {normalizeOrder(props.layerOrder ?? [], [
          ...deskItems(props.equipment),
          ...(props.preview ? [SceneObject.PREVIEW] : []),
        ])
          .map((target) =>
            target === SceneObject.PREVIEW
              ? artworkNames[props.preview!.productId]
              : target === DeskObject.BUGRI
                ? t("버그리")
                : (artworkNames[
                    props.equipment[target] ?? ""
                  ] ?? t("기본 데스크")),
          )
          .join(" · ")}
      </output>
      <ul
        aria-label={t("3D 배치 정보")}
        className="sr-only"
      >
        {Object.entries(props.equipment).map(
          ([category, id]) => {
            if (!isMovable(category)) return null;
            const transform =
              props.transforms[category] ??
              defaultTransforms[category];
            return (
              <li key={category}>
                {artworkNames[id]}: X{" "}
                {transform.x.toFixed(2)}
                {t(", 높이")} {transform.y.toFixed(2)}, Z{" "}
                {transform.z.toFixed(2)}
                {t(", 회전")} {transform.rotationY}°
              </li>
            );
          },
        )}
        <li>
          {t("버그리: X")}{" "}
          {(
            props.transforms.BUGRI ??
            defaultTransforms.BUGRI
          ).x.toFixed(2)}
          {t(", 높이")}{" "}
          {(
            props.transforms.BUGRI ??
            defaultTransforms.BUGRI
          ).y.toFixed(2)}
          , Z{" "}
          {(
            props.transforms.BUGRI ??
            defaultTransforms.BUGRI
          ).z.toFixed(2)}
          {t(", 회전")}{" "}
          {
            (
              props.transforms.BUGRI ??
              defaultTransforms.BUGRI
            ).rotationY
          }
          °
        </li>
      </ul>
      {!ready && !failed && (
        <p role="status" className="p-3 text-xs text-muted">
          {t("3D 공간을 준비하고 있어요…")}
        </p>
      )}
      {failed && (
        <div
          role="alert"
          className="p-3 text-sm text-muted"
        >
          <p>
            {t(
              "데스크를 불러오지 못했어요. 다시 열어 주세요. 구매·배치 기록은 그대로 유지됩니다.",
            )}
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
            {t("3D 다시 열기")}
          </Button>
        </div>
      )}
    </div>
  );
}
