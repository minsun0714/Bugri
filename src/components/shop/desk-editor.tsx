import { useDeskOrder } from "@/components/shop/use-desk-order";
import { SceneObject } from "@/components/shop/zdog/scene-state";
import type {
  Equipment,
  DeskOrder,
  DeskTransforms,
  Request,
} from "@/api/contracts";
import { tableHeight } from "@/lib/desk-spatial";
import {
  Category,
  DeskTool,
  DeskObject,
} from "@/api/constants";
import { Button } from "@/components/ui";
import { artworkNames } from "@/components/shop/artwork";
import { ThreeView } from "@/components/shop/three-view";
import { useSpatialEditor } from "@/components/shop/use-spatial-editor";

export function DeskEditor({
  equipment,
  transforms,
  save,
  saveBugri,
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
  order: DeskOrder;
  saveOrder: (
    request: Request<"reorderDesk">,
  ) => Promise<unknown>;
  disabled: boolean;
}) {
  const layers = useDeskOrder({
    order,
    equipment,
    save: saveOrder,
    disabled,
  });
  const editor = useSpatialEditor({
    equipment: { ...equipment, BUGRI: "bugri" },
    transforms,
    save: ({ category, productId, transform }) =>
      category === DeskObject.BUGRI
        ? saveBugri({ transform })
        : save({ category, productId, transform }),
    disabled: disabled || layers.saving,
  });
  return (
    <div>
      <ThreeView
        equipment={equipment}
        layerOrder={layers.effective}
        onReorder={(target, action) => {
          if (target !== SceneObject.PREVIEW)
            void layers.reorder(target, action);
        }}
        transforms={editor.effective}
        selected={editor.selected}
        tool={editor.tool}
        disabled={editor.blocked}
        readOnly={false}
        directManipulation
        onDeselect={editor.deselect}
        onSelect={editor.select}
        onPreview={editor.preview}
        onCommit={editor.commit}
        onCancel={editor.cancel}
      />

      <div className="flex flex-wrap gap-2 p-3">
        {editor.categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={
              editor.selected === category
                ? "primary"
                : "ghost"
            }
            aria-pressed={editor.selected === category}
            disabled={editor.blocked || editor.error}
            onClick={() => {
              editor.select(category);
              if (editor.tool === DeskTool.CAMERA)
                editor.setTool(DeskTool.MOVE);
            }}
            onKeyDown={editor.keyDown}
          >
            {category === DeskObject.BUGRI
              ? "버그리"
              : artworkNames[equipment[category]!]}{" "}
            선택
          </Button>
        ))}
      </div>
      {editor.selected && editor.current && (
        <div
          className={
            editor.selected === Category.DESK
              ? "sr-only"
              : "space-y-3 rounded-2xl bg-canvas p-3"
          }
        >
          {editor.selected !== Category.DESK && (
            <>
              <label className="flex items-center gap-3 text-xs">
                아이템 높이
                <input
                  aria-label="아이템 높이"
                  type="range"
                  min="0"
                  max={Math.max(
                    4,
                    Math.ceil(editor.current.y),
                  )}
                  step="0.05"
                  value={editor.current.y}
                  disabled={editor.blocked}
                  className="min-w-0 flex-1 accent-primary"
                  onChange={(event) =>
                    editor.preview(editor.selected!, {
                      ...editor.current!,
                      y: Number(event.target.value),
                    })
                  }
                />
                <input
                  aria-label="높이 직접 입력"
                  type="number"
                  min="0"
                  step="0.05"
                  value={editor.current.y}
                  disabled={editor.blocked}
                  className="w-20 rounded-lg border border-line bg-surface px-2 py-1"
                  onChange={(event) => {
                    if (
                      Number.isFinite(
                        event.target.valueAsNumber,
                      )
                    )
                      editor.preview(editor.selected!, {
                        ...editor.current!,
                        y: event.target.valueAsNumber,
                      });
                  }}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={editor.blocked}
                  onClick={() =>
                    editor.preview(editor.selected!, {
                      ...editor.current!,
                      y: 0,
                    })
                  }
                >
                  바닥에 놓기
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={editor.blocked}
                  onClick={() =>
                    editor.preview(editor.selected!, {
                      ...editor.current!,
                      y: tableHeight,
                    })
                  }
                >
                  책상 위에 놓기
                </Button>
              </div>
            </>
          )}
          <output
            aria-label="선택 상품 배치"
            className="sr-only"
          >
            X {editor.current.x.toFixed(2)} · Y{" "}
            {editor.current.y.toFixed(2)} · Z{" "}
            {editor.current.z.toFixed(2)} · 회전{" "}
            {editor.current.rotationY}°
          </output>
        </div>
      )}
      <div
        role="status"
        className="p-2 text-center text-xs text-primary"
      >
        {editor.saving ? "배치 저장 중…" : editor.message}
      </div>
      {layers.error && (
        <div
          role="alert"
          className="p-2 text-sm text-coral"
        >
          겹침 순서를 저장하지 못했어요. 변경한 순서는
          유지됩니다.
          <Button
            size="sm"
            onClick={() => void layers.retry()}
          >
            순서 다시 저장
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={layers.cancel}
          >
            순서 변경 취소
          </Button>
        </div>
      )}
      {editor.error && (
        <p role="alert" className="p-2 text-sm text-coral">
          3D 배치를 저장하지 못했어요. 변경한 위치와 회전은
          유지됩니다.
        </p>
      )}
      {editor.draft && (
        <div className="flex justify-center gap-2 p-2">
          <Button
            size="sm"
            disabled={editor.blocked}
            onClick={() => void editor.commit()}
          >
            {editor.error ? "배치 다시 저장" : "배치 저장"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={editor.blocked}
            onClick={editor.cancel}
          >
            변경 취소
          </Button>
        </div>
      )}
    </div>
  );
}
