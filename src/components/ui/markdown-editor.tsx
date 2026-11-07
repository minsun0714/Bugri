"use client";

import { Dropdown } from "@/components/ui/dropdown";
import { styles } from "@/components/ui/styles";
import { useId } from "react";
import { useMarkdownEditor } from "@/components/ui/hooks/use-markdown-editor";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Button, Tabs } from "@/components/ui/index";

export function MarkdownEditor({
  value,
  onChange,
  limit = 10000,
  label = "학습 내용",
  preserveOverflow = false,
  layout = "tabs",
  className = "",
}: {
  layout?: "tabs" | "split";
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  label?: string;
  preserveOverflow?: boolean;
  className?: string;
}) {
  const id = useId();
  const {
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
  } = useMarkdownEditor({
    value,
    onChange,
    limit,
    preserveOverflow,
  });

  const editor = (
    <div
      className={styles["editor-shell"]}
      role="group"
      aria-label="Markdown 작성"
    >
      <div className={styles["editor-tools"]}>
        <Button
          size="sm"
          variant="secondary"
          aria-expanded={picker}
          onClick={togglePicker}
        >
          + 코드 블럭
        </Button>
      </div>
      {picker && (
        <div className={styles["editor-picker"]}>
          <Dropdown
            label="삽입할 코드 언어"
            value={language}
            onValueChange={setLanguage}
            options={[
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
            ].map((value) => ({ value, label: value }))}
          />
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
        onChange={({ target: { value } }) =>
          changeValue(value)
        }
        rows={9}
        placeholder={
          "오늘 배운 내용을 Markdown으로 적어보세요.\n\n# 제목\n- 배운 점\n\n코드는 코드 블록 버튼으로 추가할 수 있어요."
        }
      />
    </div>
  );

  const preview = (
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
  );

  return (
    <div
      className={`${styles["markdown-editor"]} ${className}`}
    >
      <div
        className={styles["editor-title"]}
        id={`${id}-label`}
      >
        {label} <span aria-hidden="true">Markdown</span>
      </div>
      {layout === "split" ? (
        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <section
            aria-label="작성"
            className="min-w-0 rounded-2xl border border-line bg-surface p-4"
          >
            <h2 className="mb-3 text-sm font-semibold">
              작성
            </h2>
            {editor}
          </section>
          <section
            aria-label="미리보기"
            className="min-w-0 rounded-2xl border border-line bg-surface p-4"
          >
            <h2 className="mb-3 text-sm font-semibold">
              미리보기
            </h2>
            {preview}
          </section>
        </div>
      ) : (
        <Tabs
          items={["작성", "미리보기"]}
          value={tab}
          onChange={setTab}
        >
          {tab === "작성" ? editor : preview}
        </Tabs>
      )}
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
