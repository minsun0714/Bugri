import type {
  DeskTransforms,
  Equipment,
  Product,
  Request,
} from "@/api/contracts";
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
  const { product, owned, buy } = props;
  const {
    editor,
    reset,
    revision,
    keyDown,
    selectedName,
    previewSelected,
    select,
    previewTransform,
    commitTransform,
    space,
    itemFrame,
    preview,
    replacesExisting,
    apply,
    unchanged,
    error,
    message,
  } = useProductTrial(props);

  return (
    <>
      <ThreeView
        key={revision}
        onKeyDown={keyDown}
        label="장착 미리보기"
        equipment={
          preview
            ? space.equipment
            : {
                ...space.equipment,
                [product.category]: product.productId,
              }
        }
        transforms={space.transforms}
        itemFrame={itemFrame}
        preview={preview}
        previewSelected={previewSelected}
        allowDefaultDesk
        wheelZoom
        selected={editor.selected}
        tool={editor.tool}
        disabled={editor.blocked}
        readOnly={false}
        directManipulation
        onSelect={select}
        onDeselect={editor.deselect}
        showViewPresets={false}
        onPreview={previewTransform}
        onCommit={commitTransform}
        onCancel={editor.cancel}
      />
      <div className="mt-3 space-y-3 px-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={editor.blocked}
          onClick={reset}
        >
          초기화
        </Button>
        <output aria-label="선택 상품" className="sr-only">
          {selectedName}
        </output>
        {editor.current && (
          <output
            aria-label="선택 상품 배치"
            className="sr-only"
          >
            X {editor.current.x.toFixed(2)} · Y{" "}
            {editor.current.y.toFixed(2)} · Z{" "}
            {editor.current.z.toFixed(2)} · 회전{" "}
            {editor.current.rotationY}°
          </output>
        )}
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
                  : replacesExisting
                    ? "기존 상품과 교체"
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
