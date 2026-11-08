"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { Tooltip } from "@/components/ui/tooltip";
import { Dropdown } from "@/components/ui/dropdown";
import { styles } from "@/components/ui/styles";
import {
  useId,
  useSyncExternalStore,
  type KeyboardEventHandler,
} from "react";
import { useMarkdownEditor } from "@/components/ui/hooks/use-markdown-editor";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Button, Tabs } from "@/components/ui/index";

const desktopQuery = "(min-width: 1024px)";

function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia?.(desktopQuery);

  media?.addEventListener("change", onChange);
  return () =>
    media?.removeEventListener("change", onChange);
}

function getDesktopSnapshot() {
  return window.matchMedia?.(desktopQuery).matches ?? false;
}

function getServerDesktopSnapshot() {
  return false;
}

export function MarkdownEditor({
  value,
  onChange,
  limit = 10000,
  label = "학습 내용",
  placeholder,
  preserveOverflow = false,
  layout = "tabs",
  className = "",
  onKeyDown,
  density = "default",
}: {
  density?: "default" | "compact";
  layout?: "tabs" | "split" | "responsive";
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  label?: string;
  placeholder?: string;
  preserveOverflow?: boolean;
  className?: string;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
}) {
  const t = useTranslation();

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

  const desktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot,
  );
  const split =
    layout === "split" ||
    (layout === "responsive" && desktop);

  const responsiveSplit =
    layout === "responsive" && desktop;

  const compact = density === "compact";
  const codeButton = (
    <Button
      size="sm"
      variant="secondary"
      aria-expanded={picker}
      onClick={togglePicker}
    >
      {t("+ 코드 블럭")}
    </Button>
  );

  const editor = (
    <div
      className={`${styles["editor-shell"]} ${responsiveSplit ? "flex flex-1 flex-col [&_textarea]:flex-1" : ""}`}
      role="group"
      aria-label={t("Markdown 작성")}
    >
      {!compact && (
        <div className={styles["editor-tools"]}>
          {codeButton}
        </div>
      )}
      {picker && (
        <div className={styles["editor-picker"]}>
          <Dropdown
            label={t("삽입할 코드 언어")}
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
            {t("삽입")}
          </Button>
        </div>
      )}
      <textarea
        ref={input}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-count ${id}-error`}
        aria-invalid={count > limit}
        value={value}
        onKeyDown={onKeyDown}
        onChange={({ target: { value } }) =>
          changeValue(value)
        }
        rows={compact ? 5 : 9}
        placeholder={
          placeholder ??
          t(
            "오늘 배운 내용을 Markdown으로 적어보세요.\n\n# 제목\n- 배운 점\n\n코드는 코드 블록 버튼으로 추가할 수 있어요.",
          )
        }
      />
    </div>
  );

  const preview = (
    <div
      className={`${styles["markdown-preview"]} ${layout === "responsive" ? "min-w-0 max-w-full [&_pre]:max-w-full" : ""} ${responsiveSplit ? "flex-1" : ""} ${layout === "responsive" && !desktop && !value.trim() ? "!min-h-0" : ""}`}
    >
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
              <span>
                {t("[이미지:")}
                {alt ?? ""}]
              </span>
            ),
          }}
        >
          {value}
        </Markdown>
      ) : (
        <p className={styles["preview-placeholder"]}>
          {t("내용을 작성하면 여기에 미리보기가 표시돼요.")}
        </p>
      )}
    </div>
  );

  return (
    <div
      className={`${styles["markdown-editor"]} ${compact ? styles["markdown-editor-compact"] : ""} ${className}`}
    >
      {compact ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span id={`${id}-label`}>{t(label)}</span>
          <div className="flex items-center gap-1">
            <Tooltip label={t("Markdown 작성 도움말")}>
              {t(
                "제목은 #, 목록은 -로 시작할 수 있어요. 코드는 실행되지 않아요.",
              )}
            </Tooltip>
          </div>
        </div>
      ) : (
        <div
          className={styles["editor-title"]}
          id={`${id}-label`}
        >
          {t(label)}{" "}
          <span aria-hidden="true">Markdown</span>
        </div>
      )}
      {split ? (
        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <section
            aria-label={t("작성")}
            className={`min-w-0 rounded-surface border border-line bg-surface p-4 ${responsiveSplit ? "flex flex-col" : ""}`}
          >
            <h2 className="mb-3 text-sm font-semibold">
              {t("작성")}
            </h2>
            {editor}
          </section>
          <section
            aria-label={t("미리보기")}
            className={`min-w-0 rounded-surface border border-line bg-surface p-4 ${responsiveSplit ? "flex flex-col" : ""}`}
          >
            <h2 className="mb-3 text-sm font-semibold">
              {t("미리보기")}
            </h2>
            {preview}
          </section>
        </div>
      ) : (
        <Tabs
          label={
            layout === "responsive" ? label : undefined
          }
          items={["작성", "미리보기"]}
          value={tab}
          onChange={setTab}
        >
          {tab === "작성" ? editor : preview}
        </Tabs>
      )}
      <div
        className={
          compact ? "sr-only" : styles["editor-footer"]
        }
        id={`${id}-count`}
      >
        <span>
          {t("Markdown 기호 포함 · 코드는 실행되지 않아요")}
        </span>
        {Number.isFinite(limit) && (
          <span>
            {count.toLocaleString()} /{" "}
            {limit.toLocaleString()}
            {preserveOverflow ? t("자") : ""}
          </span>
        )}
      </div>
      <p
        className={"error-text"}
        id={`${id}-error`}
        aria-live="polite"
      >
        {t(error)}
      </p>
    </div>
  );
}
