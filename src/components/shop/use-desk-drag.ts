import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type {
  DeskPosition,
  DeskPositions,
  Request,
} from "@/api/contracts";
import {
  clampPosition,
  type MovableCategory,
} from "@/lib/desk-layout";

type Draft = Request<"moveEquipment"> & {
  category: MovableCategory;
};
type Drag = {
  pointerId: number;
  origin: DeskPosition;
  initial: DeskPosition;
  category: MovableCategory;
  productId: string;
};

function scenePoint(
  event: PointerEvent<SVGGElement>,
): DeskPosition | null {
  const { currentTarget, clientX, clientY } = event;
  const svg = currentTarget.ownerSVGElement;
  const matrix = svg?.getScreenCTM();
  if (!svg || !matrix) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const { x, y } = point.matrixTransform(matrix.inverse());
  return { x, y };
}

export function useDeskDrag({
  positions,
  save,
  disabled,
}: {
  positions: DeskPositions;
  save: (
    request: Request<"moveEquipment">,
  ) => Promise<unknown>;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const drag = useRef<Drag | null>(null);
  const lock = useRef(false);
  const current = useRef<Draft | null>(null);
  const blocked = disabled || saving;

  function preview(next: Draft | null) {
    current.current = next;
    setDraft(next);
    setError(false);
    setMessage("");
  }

  function cancel() {
    if (lock.current) return;
    drag.current = null;
    preview(null);
    setMessage("이동을 취소했어요.");
  }

  async function commit(next = current.current) {
    if (!next || lock.current || disabled) return;
    lock.current = true;
    setSaving(true);
    setError(false);
    try {
      await save(next);
      preview(null);
      setMessage("배치를 저장했어요.");
    } catch {
      // Keep the user's proposed position available for an explicit retry.
      setError(true);
      setMessage("");
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }

  function position(category: MovableCategory) {
    return draft?.category === category
      ? draft.position
      : (positions[category] ?? { x: 0, y: 0 });
  }

  function start(
    event: PointerEvent<SVGGElement>,
    category: MovableCategory,
    productId: string,
  ) {
    if (
      blocked ||
      lock.current ||
      drag.current ||
      event.button !== 0 ||
      !event.isPrimary
    )
      return;
    const origin = scenePoint(event);
    if (!origin) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      origin,
      initial: position(category),
      category,
      productId,
    };
  }

  function update(event: PointerEvent<SVGGElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId)
      return;
    const point = scenePoint(event);
    if (!point) return;
    const { category, productId, origin, initial } = active;
    preview({
      category,
      productId,
      position: clampPosition(category, {
        x: initial.x + point.x - origin.x,
        y: initial.y + point.y - origin.y,
      }),
    });
  }

  function finish(event: PointerEvent<SVGGElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    update(event);
    drag.current = null;
    if (
      event.currentTarget.hasPointerCapture(event.pointerId)
    )
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    void commit();
  }

  function keyDown(
    event: KeyboardEvent<SVGGElement>,
    category: MovableCategory,
    productId: string,
  ) {
    if (blocked || lock.current) return;
    const { key, shiftKey } = event;
    if (key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      void commit();
      return;
    }
    const vectors: Record<string, DeskPosition> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const vector = vectors[key];
    if (!vector) return;
    event.preventDefault();
    const initial = position(category);
    const step = shiftKey ? 1 : 10;
    preview({
      category,
      productId,
      position: clampPosition(category, {
        x: initial.x + vector.x * step,
        y: initial.y + vector.y * step,
      }),
    });
  }

  return {
    draft,
    error,
    message,
    saving,
    blocked,
    position,
    start,
    update,
    finish,
    cancel,
    commit,
    keyDown,
    cancelPointer: (event: PointerEvent<SVGGElement>) => {
      if (drag.current?.pointerId === event.pointerId)
        cancel();
    },
  };
}
