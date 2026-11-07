import { useRef, useState } from "react";
import { Category } from "@/api/constants";
import { initialPreviewTransform } from "@/components/shop/preview-placement";
import { defaultTransforms } from "@/lib/desk-spatial";
import type {
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
}: {
  product: Product;
  equipment: Equipment;
  transforms: DeskTransforms;
  pending: boolean;
  equip: (request: Request<"equip">) => Promise<unknown>;
  move: (
    request: Request<"transformEquipment">,
  ) => Promise<unknown>;
}) {
  const { category, productId } = product;
  const movable = isMovable(category) ? category : null;
  const [space] = useState(() => ({
    equipment: { ...equipment },
    transforms: { ...transforms },
  }));
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
  const lock = useRef(false);
  const editor = useSpatialEditor({
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
  const current = movable
    ? (editor.effective[movable] ??
      defaultTransforms[movable])
    : null;
  const signature = JSON.stringify(current);
  const unchanged =
    equipment[category] === productId &&
    (applied === signature ||
      (applied === null &&
        JSON.stringify(
          transforms[category as keyof DeskTransforms] ??
            null,
        ) === signature));

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
    space,
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
