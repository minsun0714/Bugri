import type {
  DeskTransforms,
  Equipment,
  Product,
  Request,
} from "@/api/contracts";
import { Category, DeskTool } from "@/api/constants";
import { Button, Coin } from "@/components/ui";
import { ThreeView } from "@/components/shop/three-view";
import { useProductTrial } from "@/components/shop/use-product-trial";

export function ProductTrial(props: {
  product: Product;
  equipment: Equipment;
  transforms: DeskTransforms;
  owned: boolean;
  pending: boolean;
  buy: () => Promise<unknown>;
  equip: (request: Request<"equip">) => Promise<unknown>;
  move: (
    request: Request<"transformEquipment">,
  ) => Promise<unknown>;
}) {
  const { product, equipment, owned, buy } = props;
  const {
    editor,
    apply,
    unchanged,
    error,
    message,
    movable,
  } = useProductTrial(props);

  return (
    <>
      <div
        className="mb-3 flex flex-wrap gap-2"
        aria-label="미리보기 도구"
      >
        {[
          [DeskTool.MOVE, "상품 이동"],
          [DeskTool.ROTATE, "상품 회전"],
          [DeskTool.HEIGHT, "높이 조절"],
          [DeskTool.CAMERA, "시점 회전"],
        ].map(([tool, label]) => (
          <Button
            key={tool}
            size="sm"
            variant={
              editor.tool === tool ? "primary" : "secondary"
            }
            aria-pressed={editor.tool === tool}
            disabled={
              editor.blocked ||
              (!movable && tool !== DeskTool.CAMERA) ||
              (product.category === Category.DESK &&
                tool === DeskTool.HEIGHT)
            }
            onClick={() => editor.setTool(tool as DeskTool)}
          >
            {label}
          </Button>
        ))}
      </div>
      <ThreeView
        label="장착 미리보기"
        equipment={{
          ...equipment,
          [product.category]: product.productId,
        }}
        transforms={editor.effective}
        selected={editor.selected}
        tool={editor.tool}
        disabled={editor.blocked}
        readOnly={false}
        showViewPresets={false}
        onPreview={editor.preview}
        onCommit={editor.commit}
        onCancel={editor.cancel}
      />
      <div className="mt-3 space-y-3 px-2">
        {editor.current && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onKeyDown={editor.keyDown}
              onClick={() => editor.setTool(DeskTool.MOVE)}
              disabled={editor.blocked}
            >
              {product.name} 선택
            </Button>
            <label className="flex items-center gap-3 text-xs">
              아이템 회전
              <input
                aria-label="아이템 회전"
                type="range"
                min="0"
                max="359"
                value={editor.current.rotationY}
                disabled={editor.blocked}
                className="min-w-0 flex-1 accent-primary"
                onChange={(event) =>
                  editor.preview(movable!, {
                    ...editor.current!,
                    rotationY: Number(event.target.value),
                  })
                }
              />
              <span>{editor.current.rotationY}°</span>
            </label>
            <output
              aria-label="선택 상품 배치"
              className="block text-xs text-muted"
            >
              X {editor.current.x.toFixed(2)} · Y{" "}
              {editor.current.y.toFixed(2)} · Z{" "}
              {editor.current.z.toFixed(2)} · 회전{" "}
              {editor.current.rotationY}°
            </output>
          </>
        )}
        <p>
          {movable
            ? "선택한 상품을 드래그해 배치하세요. 시점 회전 도구로 방을 둘러볼 수 있어요. 선택 버튼에서 방향키로도 조절할 수 있어요."
            : "시점 회전 도구로 방을 둘러보세요."}{" "}
          미리보기는 실제 장착 상태를 바꾸지 않아요.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Coin amount={product.price} />
          {owned ? (
            <Button
              disabled={
                editor.blocked || (unchanged && !error)
              }
              onClick={() => void apply()}
            >
              {error
                ? "배치 다시 적용"
                : unchanged
                  ? "장착 중"
                  : "내 데스크에 장착"}
            </Button>
          ) : (
            <Button
              disabled={editor.blocked}
              onClick={() => void buy()}
            >
              구매하기
            </Button>
          )}
        </div>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </div>
    </>
  );
}
