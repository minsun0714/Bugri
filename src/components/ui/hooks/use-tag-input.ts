"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { normalizeTagInput } from "@/lib/tags";

type TagInputOptions = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export function useTagInput({
  value,
  onChange,
}: TagInputOptions) {
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const full = value.length >= 3;

  function changeDraft(value: string) {
    setDraft(value);
    setError("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
    setError("");
    requestAnimationFrame(() => input.current?.focus());
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    const {
      key,
      nativeEvent: { isComposing },
      keyCode,
    } = event;

    if (key !== "Enter" || isComposing || keyCode === 229)
      return;

    event.preventDefault();

    const tag = normalizeTagInput(draft);

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
  }

  return {
    input,
    draft,
    error,
    full,
    changeDraft,
    removeTag,
    handleKeyDown,
  };
}
