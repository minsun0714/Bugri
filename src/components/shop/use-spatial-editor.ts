import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Category, DeskTool } from "@/api/constants";
import type {
  DeskTransform,
  DeskTransforms,
  Equipment,
  Request,
} from "@/api/contracts";
import {
  constrainTransform,
  defaultTransforms,
} from "@/lib/desk-spatial";
import { type MovableCategory } from "@/lib/desk-layout";

type Draft = Request<"transformEquipment">;
export function useSpatialEditor({
  equipment,
  transforms,
  save,
  disabled,
  initialSelected = null,
  initialTool = DeskTool.CAMERA,
}: {
  equipment: Equipment;
  transforms: DeskTransforms;
  save: (request: Draft) => Promise<unknown>;
  disabled: boolean;
  initialSelected?: MovableCategory | null;
  initialTool?: DeskTool;
}) {
  const [selected, setSelected] =
    useState<MovableCategory | null>(initialSelected);
  const [tool, setTool] = useState<DeskTool>(initialTool);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmed, setConfirmed] = useState<{
    request: Draft;
    base: DeskTransforms;
  } | null>(null);
  const latest = useRef<Draft | null>(null);
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const blocked = disabled || saving;
  // Keep the successful placement visible while the query's previous immutable
  // snapshot is still rendered. A new snapshot (including external edits) wins.
  const visibleDraft =
    draft ??
    (confirmed?.base === transforms
      ? confirmed.request
      : null);
  const effective = visibleDraft
    ? {
        ...transforms,
        [visibleDraft.category]: visibleDraft.transform,
      }
    : transforms;
  const current = selected
    ? (effective[selected] ?? defaultTransforms[selected])
    : null;

  function select(category: MovableCategory) {
    if (blocked || error) return;
    setSelected(category);
    setTool(DeskTool.MOVE);
  }
  function preview(
    category: MovableCategory,
    transform: DeskTransform,
  ) {
    if (blocked || lock.current || !equipment[category])
      return;
    const next = {
      category,
      productId: equipment[category]!,
      transform: constrainTransform(category, transform),
    };
    latest.current = next;
    setDraft(next);
    setMessage("");
    setError(false);
  }
  async function commit(
    category?: MovableCategory,
    transform?: DeskTransform,
  ) {
    if (blocked || lock.current) return;
    const next =
      category && transform && equipment[category]
        ? {
            category,
            productId: equipment[category]!,
            transform: constrainTransform(
              category,
              transform,
            ),
          }
        : latest.current;
    if (!next) return;
    lock.current = true;
    setSaving(true);
    setError(false);
    try {
      await save(next);
      setConfirmed({ request: next, base: transforms });
      latest.current = null;
      setDraft(null);
      setMessage("3D 배치를 저장했어요.");
    } catch {
      setError(true);
      setDraft(next);
      latest.current = next;
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  function cancel() {
    if (lock.current) return;
    latest.current = null;
    setDraft(null);
    setError(false);
    setMessage("변경을 취소했어요.");
  }
  function reset() {
    if (blocked || lock.current) return;
    latest.current = null;
    setDraft(null);
    setConfirmed(null);
    setSelected(null);
    setTool(DeskTool.CAMERA);
    setError(false);
    setMessage("");
  }
  function keyDown(event: KeyboardEvent) {
    if (!selected || !current || blocked) return;
    const { key } = event;
    if (key === "Enter") {
      event.preventDefault();
      void commit();
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(key)
    )
      return;
    event.preventDefault();
    if (tool === DeskTool.HEIGHT || event.shiftKey) {
      if (
        selected !== Category.DESK &&
        (key === "ArrowUp" || key === "ArrowDown")
      )
        preview(selected, {
          ...current,
          y: current.y + (key === "ArrowUp" ? 0.1 : -0.1),
        });
    } else if (tool === DeskTool.ROTATE || event.altKey)
      preview(selected, {
        ...current,
        rotationY:
          current.rotationY +
          (key === "ArrowLeft" || key === "ArrowDown"
            ? -15
            : 15),
      });
    else
      preview(selected, {
        ...current,
        x:
          current.x +
          (key === "ArrowLeft"
            ? -0.1
            : key === "ArrowRight"
              ? 0.1
              : 0),
        z:
          current.z +
          (key === "ArrowUp"
            ? -0.1
            : key === "ArrowDown"
              ? 0.1
              : 0),
      });
  }
  const categories = [
    Category.KEYBOARD,
    Category.MONITOR,
    Category.ACCESSORY,
    Category.DESK,
  ].filter((category) => equipment[category]);
  return {
    selected,
    select,
    deselect: () => {
      if (!blocked && !error) setSelected(null);
    },
    tool,
    setTool,
    draft,
    effective,
    current,
    blocked,
    saving,
    error,
    message,
    preview,
    commit,
    cancel,
    reset,
    keyDown,
    categories,
  };
}
