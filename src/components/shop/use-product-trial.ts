import { useRef, useState } from "react";
import { DeskTool } from "@/api/constants";
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
  const [local, setLocal] = useState(transforms);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState<string | null>(
    null,
  );
  const lock = useRef(false);
  const editor = useSpatialEditor({
    equipment: { ...equipment, [category]: productId },
    transforms: local,
    disabled: pending || applying,
    initialSelected: movable,
    initialTool: movable ? DeskTool.MOVE : DeskTool.CAMERA,
    save: async ({ category, transform }) => {
      setLocal((previous) => ({
        ...previous,
        [category]: transform,
      }));
    },
  });
  const signature = JSON.stringify(editor.current);
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
    const transform = editor.current;
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
    apply,
    unchanged,
    error,
    message: applied === signature ? message : "",
    movable,
  };
}
