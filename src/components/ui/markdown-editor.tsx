"use client";

import { styles } from "@/components/ui/styles";
import { useId, useRef, useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Button, Tabs } from "@/components/ui/index";

export function MarkdownEditor({
  value,
  onChange,
  limit = 10000,
  label = "학습 내용",
  preserveOverflow = false,
}: {
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  label?: string;
  preserveOverflow?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({ start: 0, end: 0 });
  const [tab, setTab] = useState("작성");
  const [picker, setPicker] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const [error, setError] = useState("");
  const count = Array.from(value).length;
  function insertCode() {
    const { start, end } = selection.current;
    const selected = value.slice(start, end);
    const longest = Math.max(
      2,
      ...(selected.match(/`+/g) ?? []).map(
        (run) => run.length,
      ),
    );
    const fence = "`".repeat(longest + 1);
    const prefix = `${start && value[start - 1] !== "\n" ? "\n\n" : ""}${fence}${language}\n`;
    const inserted = `${prefix}${selected}\n${fence}\n`;
    const next =
      value.slice(0, start) + inserted + value.slice(end);
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
        start + prefix.length,
        start + prefix.length + selected.length,
      );
    });
  }
  return (
    <div className={styles["markdown-editor"]}>
      <div
        className={styles["editor-title"]}
        id={`${id}-label`}
      >
        {label} <span aria-hidden="true">Markdown</span>
      </div>
      <Tabs
        items={["작성", "미리보기"]}
        value={tab}
        onChange={setTab}
      >
        {tab === "작성" ? (
          <>
            <div className={styles["editor-tools"]}>
              <Button
                size="sm"
                variant="ghost"
                aria-expanded={picker}
                onClick={() => {
                  if (!picker)
                    selection.current = {
                      start:
                        input.current?.selectionStart ??
                        value.length,
                      end:
                        input.current?.selectionEnd ??
                        value.length,
                    };
                  setPicker(!picker);
                }}
              >
                코드 블록
              </Button>
              <span>제목 # · 강조 ** · 목록 -</span>
            </div>
            {picker && (
              <div className={styles["editor-picker"]}>
                <label htmlFor={`${id}-language`}>
                  삽입할 코드 언어
                </label>
                <select
                  id={`${id}-language`}
                  value={language}
                  onChange={(event) =>
                    setLanguage(event.target.value)
                  }
                >
                  {[
                    "typescript",
                    "javascript",
                    "java",
                    "python",
                    "sql",
                    "html",
                    "css",
                    "json",
                    "bash",
                    "text",
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <Button size="sm" onClick={insertCode}>
                  삽입
                </Button>
              </div>
            )}
            <textarea
              ref={input}
              aria-labelledby={`${id}-label`}
              aria-describedby={`${id}-count ${id}-error`}
              aria-invalid={count > limit}
              value={value}
              onChange={(event) => {
                onChange(
                  preserveOverflow
                    ? event.target.value
                    : Array.from(event.target.value)
                        .slice(0, limit)
                        .join(""),
                );
                setError("");
              }}
              rows={9}
              placeholder={
                "오늘 배운 내용을 Markdown으로 적어보세요.\n\n# 제목\n- 배운 점\n\n코드는 코드 블록 버튼으로 추가할 수 있어요."
              }
            />
          </>
        ) : (
          <div className={styles["markdown-preview"]}>
            {value.trim() ? (
              <Markdown
                skipHtml
                rehypePlugins={[
                  [
                    rehypeHighlight,
                    { detect: false, ignoreMissing: true },
                  ],
                ]}
                components={{
                  img: ({ alt }) => (
                    <span>[이미지: {alt ?? ""}]</span>
                  ),
                }}
              >
                {value}
              </Markdown>
            ) : (
              <p className={styles["preview-placeholder"]}>
                내용을 작성하면 여기에 미리보기가 표시돼요.
              </p>
            )}
          </div>
        )}
      </Tabs>
      <div
        className={styles["editor-footer"]}
        id={`${id}-count`}
      >
        <span>
          Markdown 기호 포함 · 코드는 실행되지 않아요
        </span>
        {Number.isFinite(limit) && (
          <span>
            {count.toLocaleString()} /{" "}
            {limit.toLocaleString()}
            {preserveOverflow ? "자" : ""}
          </span>
        )}
      </div>
      <p
        className={"error-text"}
        id={`${id}-error`}
        aria-live="polite"
      >
        {error}
      </p>
    </div>
  );
}
