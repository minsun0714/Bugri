"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { sceneKeyDown } from "@/components/shop/scene-keyboard";
import {
  deskItems,
  normalizeOrder,
  changeOrder,
} from "@/lib/desk-order";
import {
  SceneObject,
  type SceneTarget,
} from "@/components/shop/zdog/scene-state";
import type { LayerAction } from "@/api/constants";
import { artworkNames } from "@/components/shop/artwork";
import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Category, DeskObject } from "@/api/constants";
import { initialPreviewTransform } from "@/components/shop/preview-placement";
import {
  defaultTransforms,
  type SpatialTarget,
} from "@/lib/desk-spatial";
import type {
  DeskOrder,
  DeskTransform,
  DeskTransforms,
  Equipment,
  Product,
  Request,
} from "@/api/contracts";
import { isMovable } from "@/lib/desk-layout";
import { errorMessage } from "@/components/shop/errors";
import { useSpatialEditor } from "@/components/shop/use-spatial-editor";

export function useProductTrial({
  product,
  equipment,
  transforms,
  pending,
  equip,
  move,
  order,
  saveOrder,
}: {
  product: Product;
  equipment: Equipment;
  transforms: DeskTransforms;
  order: DeskOrder;
  saveOrder: (
    request: Request<"reorderDesk">,
  ) => Promise<unknown>;
  pending: boolean;
  equip: (request: Request<"equip">) => Promise<unknown>;
  move: (
    request: Request<"transformEquipment">,
  ) => Promise<unknown>;
}) {
  const t = useTranslation();

  const { category, productId } = product;
  const movable = isMovable(category) ? category : null;
  const [space] = useState(() => ({
    equipment: { ...equipment },
    transforms: { ...transforms },
    order: [...order],
  }));
  const [localOrder, setLocalOrder] = useState<
    SceneTarget[]
  >(space.order);
  const [spaceLocal, setSpaceLocal] = useState(
    space.transforms,
  );
  const [previewSelected, setPreviewSelected] =
    useState(true);
  const [local, setLocal] = useState<DeskTransforms>(() =>
    movable
      ? {
          [movable]: initialPreviewTransform(
            movable,
            equipment,
            transforms,
          ),
        }
      : {},
  );
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState<string | null>(
    null,
  );
  const [revision, setRevision] = useState(0);
  const lock = useRef(false);
  const previewEditor = useSpatialEditor({
    equipment: { [category]: productId },
    transforms: local,
    disabled: pending || applying,
    save: async ({ category, transform }) => {
      setLocal((previous) => ({
        ...previous,
        [category]: transform,
      }));
    },
  });
  const spaceEditor = useSpatialEditor({
    equipment: {
      DESK: "default",
      BUGRI: "bugri",
      ...space.equipment,
    },
    transforms: spaceLocal,
    disabled: pending || applying,
    save: async ({ category, transform }) => {
      setSpaceLocal((previous) => ({
        ...previous,
        [category]: transform,
      }));
    },
  });
  const editor = previewSelected
    ? previewEditor
    : spaceEditor;
  function select(
    category: SpatialTarget,
    preview = false,
  ) {
    setPreviewSelected(preview);
    (preview ? previewEditor : spaceEditor).select(
      category,
    );
  }
  function previewTransform(
    category: SpatialTarget,
    transform: DeskTransform,
    preview = false,
  ) {
    (preview ? previewEditor : spaceEditor).preview(
      category,
      transform,
    );
  }
  function commitTransform(
    category: SpatialTarget,
    transform: DeskTransform,
    preview = false,
  ) {
    return (preview ? previewEditor : spaceEditor).commit(
      category,
      transform,
    );
  }
  const targets = [
    ...(movable
      ? [{ category: movable, preview: true }]
      : []),
    ...spaceEditor.categories.map((category) => ({
      category,
      preview: false,
    })),
  ];
  function keyDown(event: KeyboardEvent) {
    sceneKeyDown(event, {
      blocked: editor.blocked,
      selected: editor.selected,
      previewSelected,
      targets,
      select,
      keyDown: editor.keyDown,
    });
  }

  function reset() {
    if (
      pending ||
      applying ||
      previewEditor.blocked ||
      spaceEditor.blocked
    )
      return;
    previewEditor.reset();
    spaceEditor.reset();
    setLocal(
      movable
        ? {
            [movable]: initialPreviewTransform(
              movable,
              space.equipment,
              space.transforms,
            ),
          }
        : {},
    );
    setSpaceLocal(space.transforms);
    setLocalOrder(space.order);
    setPreviewSelected(true);
    setApplied(null);
    setError("");
    setMessage("");
    setRevision((value) => value + 1);
  }
  const selectedName = editor.selected
    ? previewSelected
      ? product.name
      : editor.selected === DeskObject.BUGRI
        ? t("버그리")
        : (artworkNames[
            space.equipment[editor.selected] ?? ""
          ] ?? t("기본 데스크"))
    : "";
  const current = movable
    ? (previewEditor.effective[movable] ??
      defaultTransforms[movable])
    : null;
  const available: SceneTarget[] = [
    ...deskItems(space.equipment),
    ...(movable ? [SceneObject.PREVIEW] : []),
  ];
  function reorder(
    target: SceneTarget,
    action: LayerAction,
  ) {
    setLocalOrder((previous) =>
      changeOrder(previous, available, target, action),
    );
  }
  const signature = JSON.stringify([current, localOrder]);
  const unchanged =
    equipment[category] === productId &&
    (applied === signature ||
      (applied === null &&
        localOrder.length === 0 &&
        JSON.stringify(
          transforms[category as keyof DeskTransforms] ??
            null,
        ) === JSON.stringify(current)));

  async function apply() {
    if (lock.current || pending) return;
    lock.current = true;
    setApplying(true);
    setError("");
    setMessage("");
    let equipped = false;
    const transform = current;
    try {
      await equip({ category, productId });
      equipped = true;
      if (movable && transform)
        await move({
          category: movable,
          productId,
          transform,
        });
      if (movable && localOrder.length) {
        const trialOrder = normalizeOrder(
          localOrder,
          available,
        ).filter((target) => target !== movable);
        const previewIndex = trialOrder.indexOf(
          SceneObject.PREVIEW,
        );
        const actualOrder = normalizeOrder(
          space.order,
          deskItems({
            ...space.equipment,
            [movable]: productId,
          }),
        ).filter((target) => target !== movable);
        actualOrder.splice(
          Math.min(previewIndex, actualOrder.length),
          0,
          movable,
        );
        await saveOrder({ order: actualOrder });
      }
      setApplied(signature);
      setMessage("장착과 배치를 저장했어요.");
    } catch (error) {
      setError(
        equipped
          ? "상품은 장착됐지만 배치를 저장하지 못했어요. 미리보기 위치는 유지됩니다. 다시 적용해 주세요."
          : errorMessage(error),
      );
    } finally {
      lock.current = false;
      setApplying(false);
    }
  }

  return {
    editor,
    layerOrder: localOrder,
    reorder,
    keyDown,
    reset,
    revision,
    selectedName,
    spaceEditor,
    previewSelected,
    select,
    previewTransform,
    commitTransform,
    space: { ...space, transforms: spaceEditor.effective },
    itemFrame:
      space.transforms.DESK ?? defaultTransforms.DESK,
    preview:
      movable && current
        ? {
            category: movable,
            productId,
            transform: current,
          }
        : undefined,
    replacesExisting:
      category === Category.DESK ||
      Boolean(space.equipment[category]),
    apply,
    unchanged,
    error,
    message: applied === signature ? message : "",
    movable,
  };
}
