"use client";

import { styles } from "@/components/ui/styles";
import { useId } from "react";
import { useTagInput } from "@/components/ui/hooks/use-tag-input";

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const id = useId();
  const {
    input,
    draft,
    error,
    full,
    changeDraft,
    removeTag,
    handleKeyDown,
  } = useTagInput({ value, onChange });

  return (
    <div className={styles["ui-field"]}>
      <label htmlFor={id}>해시태그</label>
      <div className={styles["tag-input-shell"]}>
        {value.map((tag) => (
          <span
            className={styles["tag-input-chip"]}
            key={tag}
          >
            <span># {tag}</span>
            <button
              type="button"
              aria-label={`${tag} 삭제`}
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={input}
          id={id}
          value={draft}
          disabled={full}
          placeholder={
            full
              ? "최대 3개까지 추가할 수 있어요"
              : "태그 입력 후 Enter"
          }
          aria-describedby={`${id}-hint ${id}-error`}
          aria-invalid={!!error}
          onChange={({ target: { value } }) =>
            changeDraft(value)
          }
          onKeyDown={handleKeyDown}
        />
      </div>
      <div
        className={styles["tag-input-help"]}
        id={`${id}-hint`}
      >
        <span>
          {full
            ? "태그를 삭제하면 새 태그를 추가할 수 있어요."
            : "Enter로 하나씩 추가해주세요."}
        </span>
        <span>{value.length} / 3개</span>
      </div>
      <small
        id={`${id}-error`}
        className={"error-text"}
        aria-live="polite"
      >
        {error}
      </small>
    </div>
  );
}
