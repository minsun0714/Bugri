"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { moveDeskIndependently } from "@/lib/desk-independent";
import { useDeskOrder } from "@/components/shop/use-desk-order";
import { SceneObject } from "@/components/shop/zdog/scene-state";
import type {
  Equipment,
  DeskOrder,
  DeskTransforms,
  Request,
} from "@/api/contracts";
import { Category, DeskObject } from "@/api/constants";
import { Button } from "@/components/ui";
import { useProductNames } from "@/components/shop/use-product-names";
import { EditableDeskScene } from "@/components/shop/editable-desk-scene";
import { sceneKeyDown } from "@/components/shop/scene-keyboard";
import { useSpatialEditor } from "@/components/shop/use-spatial-editor";

export function DeskEditor({
  equipment,
  transforms,
  save,
  saveBugri,
  saveDesk,
  order,
  saveOrder,
  disabled,
}: {
  equipment: Equipment;
  transforms: DeskTransforms;
  save: (
    request: Request<"transformEquipment">,
  ) => Promise<unknown>;
  saveBugri: (
    request: Request<"transformBugri">,
  ) => Promise<unknown>;
  saveDesk: (
    request: Request<"transformDesk">,
  ) => Promise<unknown>;
  order: DeskOrder;
  saveOrder: (
    request: Request<"reorderDesk">,
  ) => Promise<unknown>;
  disabled: boolean;
}) {
  const t = useTranslation();
  const artworkNames = useProductNames();

  const layers = useDeskOrder({
    order,
    equipment,
    save: saveOrder,
    disabled,
  });
  const editor = useSpatialEditor({
    equipment: {
      DESK: "default",
      ...equipment,
      BUGRI: "bugri",
    },
    transforms,
    save: ({ category, productId, transform }) =>
      category === DeskObject.BUGRI
        ? saveBugri({ transform })
        : category === Category.DESK
          ? saveDesk({
              productId: equipment.DESK ?? null,
              transform,
            })
          : save({ category, productId, transform }),
    disabled: disabled || layers.saving,
  });
  const sceneTransforms =
    editor.effective.DESK &&
    editor.effective.DESK !== transforms.DESK
      ? moveDeskIndependently(
          equipment,
          transforms,
          editor.effective.DESK,
        )
      : editor.effective;
  return (
    <div>
      <EditableDeskScene
        selectedName={
          editor.selected === DeskObject.BUGRI
            ? t("버그리")
            : (artworkNames[
                equipment[editor.selected!] ?? ""
              ] ??
              (editor.selected === Category.DESK
                ? t("기본 데스크")
                : ""))
        }
        current={editor.current}
        onKeyDown={(event) =>
          sceneKeyDown(event, {
            blocked: editor.blocked || editor.error,
            selected: editor.selected,
            targets: editor.categories.map((category) => ({
              category,
              preview: false,
            })),
            select: editor.select,
            keyDown: editor.keyDown,
          })
        }
        allowDefaultDesk
        equipment={equipment}
        layerOrder={layers.effective}
        onReorder={(target, action) => {
          if (target !== SceneObject.PREVIEW)
            void layers.reorder(target, action);
        }}
        transforms={sceneTransforms}
        selected={editor.selected}
        tool={editor.tool}
        disabled={
          editor.blocked || editor.error || layers.error
        }
        onDeselect={editor.deselect}
        onSelect={editor.select}
        onPreview={editor.preview}
        onCommit={editor.commit}
        onCancel={editor.cancel}
      />

      <div role="status" className="sr-only">
        {editor.saving
          ? t("배치 저장 중…")
          : t(editor.message)}
      </div>
      {layers.error && (
        <div
          role="alert"
          className="break-keep p-2 text-sm text-foreground"
        >
          {t(
            "겹침 순서를 저장하지 못했어요. 변경한 순서는 유지됩니다.",
          )}
          <Button
            size="sm"
            onClick={() => void layers.retry()}
          >
            {t("순서 다시 저장")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={layers.cancel}
          >
            {t("순서 변경 취소")}
          </Button>
        </div>
      )}
      {editor.error && (
        <p
          role="alert"
          className="break-keep p-2 text-sm text-foreground"
        >
          {t(
            "3D 배치를 저장하지 못했어요. 변경한 위치와 회전은 유지됩니다.",
          )}
        </p>
      )}
      {editor.error && (
        <div className="flex justify-center gap-2 p-2">
          <Button
            size="sm"
            disabled={editor.blocked}
            onClick={() => void editor.commit()}
          >
            {t("배치 다시 저장")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={editor.blocked}
            onClick={editor.cancel}
          >
            {t("변경 취소")}
          </Button>
        </div>
      )}
    </div>
  );
}
