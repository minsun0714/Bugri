import type {
  DeskTransforms,
  DeskOrder,
  Equipment,
  Product,
  Request,
} from "@/api/contracts";
import { Button, Coin } from "@/components/ui";
import { EditableDeskScene } from "@/components/shop/editable-desk-scene";
import { useProductTrial } from "@/components/shop/use-product-trial";

export function ProductTrial(props: {
  product: Product;
  equipment: Equipment;
  transforms: DeskTransforms;
  order: DeskOrder;
  saveOrder: (
    request: Request<"reorderDesk">,
  ) => Promise<unknown>;
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
    layerOrder,
    reorder,
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
      <EditableDeskScene
        key={revision}
        selectedName={selectedName}
        current={editor.current}
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
        layerOrder={layerOrder}
        onReorder={reorder}
        selected={editor.selected}
        tool={editor.tool}
        disabled={editor.blocked}
        onSelect={select}
        onDeselect={editor.deselect}
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
