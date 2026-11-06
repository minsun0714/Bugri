import type {
  Equipment,
  DeskPositions,
  Request,
} from "@/api/contracts";
import { Button } from "@/components/ui";
import {
  artworkNames,
  DeskScene,
} from "@/components/shop/artwork";
import { useDeskDrag } from "@/components/shop/use-desk-drag";
import { deskBounds } from "@/lib/desk-layout";

export function DeskEditor({
  equipment,
  positions,
  save,
  disabled,
}: {
  equipment: Equipment;
  positions: DeskPositions;
  save: (
    request: Request<"moveEquipment">,
  ) => Promise<unknown>;
  disabled: boolean;
}) {
  const drag = useDeskDrag({ positions, save, disabled });
  return (
    <div>
      <DeskScene
        equipment={equipment}
        positions={positions}
        renderItem={(category, productId, children) => {
          const { x, y } = drag.position(category);
          const bounds = deskBounds[category];
          return (
            <g
              key={category}
              data-product-id={productId}
              role="button"
              aria-label={`${artworkNames[productId]} 이동`}
              aria-disabled={drag.blocked}
              tabIndex={drag.blocked ? -1 : 0}
              transform={`translate(${x} ${y})`}
              className="group touch-none cursor-grab select-none focus:outline-none active:cursor-grabbing"
              onPointerDown={(event) =>
                drag.start(event, category, productId)
              }
              onPointerMove={drag.update}
              onPointerUp={drag.finish}
              onPointerCancel={drag.cancelPointer}
              onLostPointerCapture={drag.cancelPointer}
              onKeyDown={(event) =>
                drag.keyDown(event, category, productId)
              }
            >
              {children}
              <rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                rx="8"
                fill="transparent"
                className="stroke-transparent group-hover:stroke-primary/40 group-focus-visible:stroke-primary"
                strokeWidth="2"
              />
            </g>
          );
        }}
      />
      <p className="px-3 text-center text-xs leading-5 text-muted">
        장착한 상품을 끌어 놓으세요. 키보드 방향키로 이동 ·
        Enter 저장 · Esc 취소. 배경은 고정됩니다.
      </p>
      <div
        role="status"
        className="px-3 pt-2 text-center text-xs text-primary"
      >
        {drag.saving ? "배치 저장 중…" : drag.message}
      </div>
      {drag.error && (
        <p
          role="alert"
          className="px-3 pt-2 text-sm text-coral"
        >
          배치를 저장하지 못했어요. 이동한 위치는
          유지됩니다. 다시 저장해 주세요.
        </p>
      )}
      {drag.draft && (
        <div className="flex justify-center gap-2 p-3">
          <Button
            size="sm"
            disabled={drag.blocked}
            onClick={() => void drag.commit()}
          >
            {drag.error ? "배치 다시 저장" : "배치 저장"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={drag.blocked}
            onClick={drag.cancel}
          >
            이동 취소
          </Button>
        </div>
      )}
    </div>
  );
}
