import type { ComponentProps } from "react";
import type { DeskTransform } from "@/api/contracts";
import { ThreeView } from "@/components/shop/three-view";

type Props = Omit<
  ComponentProps<typeof ThreeView>,
  | "readOnly"
  | "directManipulation"
  | "wheelZoom"
  | "showViewPresets"
> & {
  selectedName: string;
  current: DeskTransform | null;
};

export function EditableDeskScene({
  selectedName,
  current,
  ...props
}: Props) {
  return (
    <>
      <ThreeView
        {...props}
        readOnly={false}
        directManipulation
        wheelZoom
        showViewPresets={false}
      />
      <output aria-label="선택 상품" className="sr-only">
        {selectedName}
      </output>
      {current && (
        <output
          aria-label="선택 상품 배치"
          className="sr-only"
        >
          X {current.x.toFixed(2)} · Y{" "}
          {current.y.toFixed(2)} · Z {current.z.toFixed(2)}{" "}
          · 회전 {current.rotationY}°
        </output>
      )}
    </>
  );
}
