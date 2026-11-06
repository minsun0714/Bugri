"use client";

import { styles } from "./styles";
import { useId, useRef, useState } from "react";

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const full = value.length >= 3;
  return (
    <div className={styles["ui-field"]}>
      <label htmlFor={id}>해시태그</label>
      <div className={styles["tag-input-shell"]}>
        {value.map((tag) => (
          <span className={styles["tag-input-chip"]} key={tag}>
            <span># {tag}</span>
            <button
              type="button"
              aria-label={`${tag} 삭제`}
              onClick={() => {
                onChange(value.filter((item) => item !== tag));
                setError("");
                requestAnimationFrame(() => input.current?.focus());
              }}
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
            full ? "최대 3개까지 추가할 수 있어요" : "태그 입력 후 Enter"
          }
          aria-describedby={`${id}-hint ${id}-error`}
          aria-invalid={!!error}
          onChange={(event) => {
            setDraft(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (
              event.key !== "Enter" ||
              event.nativeEvent.isComposing ||
              event.keyCode === 229
            )
              return;
            event.preventDefault();
            const tag = draft.trim().replace(/^#+/, "").trim();
            if (!tag) {
              setError("태그를 입력해주세요.");
              return;
            }
            if (full) return;
            if (value.includes(tag)) {
              setError("이미 추가한 태그예요.");
              return;
            }
            onChange([...value, tag]);
            setDraft("");
            setError("");
          }}
        />
      </div>
      <div className={styles["tag-input-help"]} id={`${id}-hint`}>
        <span>
          {full
            ? "태그를 삭제하면 새 태그를 추가할 수 있어요."
            : "Enter로 하나씩 추가해주세요."}
        </span>
        <span>{value.length} / 3개</span>
      </div>
      <small id={`${id}-error`} className={"error-text"} aria-live="polite">
        {error}
      </small>
    </div>
  );
}
