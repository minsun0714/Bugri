"use client";

import { useEffect, useRef } from "react";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  NoteDraftIssue,
  noteLength,
  noteMaxLength,
} from "@/components/notes/rules";

/** Shared by the quick note and the detail editor. Overflow stays visible so the user can trim it. */
export function NoteEditorField({
  label,
  value,
  issue,
  apiError,
  onChange,
  onSubmit,
  className = "",
}: {
  label: string;
  value: string;
  issue: NoteDraftIssue | null;
  apiError?: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}) {
  const t = useTranslation();

  const excess = noteLength(value) - noteMaxLength;

  const message =
    issue === NoteDraftIssue.BLANK
      ? t("메모 내용을 입력해 주세요.")
      : issue === NoteDraftIssue.TOO_LONG
        ? t(
            "{0}자 초과했어요. 메모는 코드 블록을 포함해 최대 10,000자까지 저장할 수 있어요.",
            { 0: excess.toLocaleString() },
          )
        : apiError;

  const alert = useRef<HTMLParagraphElement>(null);

  // A long draft can push the message below the fold; bring it into view.
  useEffect(() => {
    if (message)
      alert.current?.scrollIntoView?.({ block: "nearest" });
  }, [message]);

  return (
    <div
      className={`[&_.editor-title]:sr-only ${className}`}
    >
      <MarkdownEditor
        label={label}
        value={value}
        preserveOverflow
        placeholder={t(
          "업무 중 배운 것을 바로 적어 두세요. 코드는 코드 블럭 버튼으로 넣을 수 있어요.",
        )}
        onChange={onChange}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            (event.metaKey || event.ctrlKey)
          ) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      {message && (
        <p
          ref={alert}
          role="alert"
          className="mt-2 text-sm font-medium text-danger-ink"
        >
          {message}
        </p>
      )}
    </div>
  );
}
