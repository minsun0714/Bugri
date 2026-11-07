import type {
  Equipment,
  DeskTransforms,
  Request,
} from "@/api/contracts";
import { tableHeight } from "@/lib/desk-spatial";
import { Category, DeskTool } from "@/api/constants";
import { Button } from "@/components/ui";
import { artworkNames } from "@/components/shop/artwork";
import { ThreeView } from "@/components/shop/three-view";
import { useSpatialEditor } from "@/components/shop/use-spatial-editor";

export function DeskEditor({
  equipment,
  transforms,
  save,
  disabled,
}: {
  equipment: Equipment;
  transforms: DeskTransforms;
  save: (
    request: Request<"transformEquipment">,
  ) => Promise<unknown>;
  disabled: boolean;
}) {
  const editor = useSpatialEditor({
    equipment,
    transforms,
    save,
    disabled,
  });
  return (
    <div>
      <ThreeView
        equipment={equipment}
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
      <p className="px-3 pt-3 text-xs leading-5 text-muted">
        상품을 클릭해 선택하고 드래그해 옮기세요. 선택
        테두리 위의 작은 화살표를 드래그해 회전하세요. 빈
        공간을 드래그하면 시점이 회전합니다.
      </p>
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
            {artworkNames[equipment[category]!]} 선택
          </Button>
        ))}
      </div>
      {editor.selected && editor.current && (
        <div className="space-y-3 rounded-2xl bg-canvas p-3">
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
            className="block text-xs text-muted"
          >
            X {editor.current.x.toFixed(2)} · Y{" "}
            {editor.current.y.toFixed(2)} · Z{" "}
            {editor.current.z.toFixed(2)} · 회전{" "}
            {editor.current.rotationY}°
          </output>
          <p className="text-xs text-muted">
            선택 버튼에서 방향키로 이동 · Alt+방향키 회전 ·
            Shift+↑↓ 높이 · Enter 저장 · Esc 취소
          </p>
        </div>
      )}
      <div
        role="status"
        className="p-2 text-center text-xs text-primary"
      >
        {editor.saving ? "배치 저장 중…" : editor.message}
      </div>
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
