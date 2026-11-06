import { useRef, useState } from "react";

import { insertMarkdownCodeBlock } from "@/lib/markdown";

type MarkdownEditorOptions = {
  value: string;
  onChange: (value: string) => void;
  limit: number;
  preserveOverflow?: boolean;
};

export function useMarkdownEditor({
  value,
  onChange,
  limit,
  preserveOverflow = false,
}: MarkdownEditorOptions) {
  const input = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({
    start: 0,
    end: 0,
  });
  const [tab, setTab] = useState("작성");
  const [picker, setPicker] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const [error, setError] = useState("");
  const { length: count } = Array.from(value);

  function insertCode() {
    const {
      value: next,
      selectionStart,
      selectionEnd,
    } = insertMarkdownCodeBlock({
      value,
      ...selection.current,
      language,
    });

    if (Array.from(next).length > limit) {
      setError(
        "코드 블록을 추가하면 글자 수 제한을 초과해요.",
      );

      return;
    }
    onChange(next);
    setPicker(false);
    setError("");
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(
        selectionStart,
        selectionEnd,
      );
    });
  }

  function togglePicker() {
    if (!picker)
      selection.current = {
        start:
          input.current?.selectionStart ?? value.length,
        end: input.current?.selectionEnd ?? value.length,
      };
    setPicker(!picker);
  }

  function changeValue(value: string) {
    onChange(
      preserveOverflow
        ? value
        : Array.from(value).slice(0, limit).join(""),
    );
    setError("");
  }

  return {
    input,
    tab,
    setTab,
    picker,
    language,
    setLanguage,
    error,
    count,
    insertCode,
    togglePicker,
    changeValue,
  };
}
