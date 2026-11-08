"use client";

import { Button, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Confirmation in the shared Modal; never window.confirm. */
export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  cancelLabel,
  loading = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {error && (
          <p
            role="alert"
            className="text-sm font-medium text-danger-ink"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel || t("취소")}
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
