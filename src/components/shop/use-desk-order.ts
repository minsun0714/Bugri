import { useRef, useState } from "react";
import type {
  DeskItem,
  DeskOrder,
  Equipment,
} from "@/api/contracts";
import type { LayerAction } from "@/api/constants";
import { changeOrder, deskItems } from "@/lib/desk-order";

export function useDeskOrder({
  order,
  equipment,
  save,
  disabled,
}: {
  order: DeskOrder;
  equipment: Equipment;
  save: (request: { order: DeskOrder }) => Promise<unknown>;
  disabled: boolean;
}) {
  const [draft, setDraft] = useState<DeskOrder | null>(
    null,
  );
  const [confirmed, setConfirmed] = useState<{
    base: DeskOrder;
    order: DeskOrder;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const lock = useRef(false);
  const effective =
    draft ??
    (confirmed?.base === order ? confirmed.order : order);
  async function persist(next: DeskOrder) {
    if (disabled || lock.current) return;
    lock.current = true;
    setDraft(next);
    setSaving(true);
    setError(false);
    try {
      await save({ order: next });
      setConfirmed({ base: order, order: next });
      setDraft(null);
    } catch {
      setError(true);
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return {
    effective,
    saving,
    error,
    reorder: (target: DeskItem, action: LayerAction) =>
      persist(
        changeOrder(
          effective,
          deskItems(equipment),
          target,
          action,
        ),
      ),
    retry: () => draft && persist(draft),
    cancel: () => {
      if (!saving) {
        setDraft(null);
        setError(false);
      }
    },
  };
}
