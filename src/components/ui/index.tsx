"use client";
import { type UiMessage } from "@/lib/i18n/messages";

import { useTranslation } from "@/lib/i18n/use-translation";

import {
  searchFieldStyle,
  styles,
} from "@/components/ui/styles";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type SelectHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

type Tone = "neutral" | "success" | "warning" | "danger";

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${styles["ui-button"]} ${variant} ${size} ${className}`}
    >
      {loading && (
        <span
          className={styles["spinner"]}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span className={`${styles["ui-badge"]} ${tone}`}>
      {children}
    </span>
  );
}

export function Tag({
  children,
  selected = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      className={styles["ui-tag"]}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

export function TextField({
  label,
  hideLabel = false,
  error,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hideLabel?: boolean;
  error?: string;
  hint?: string;
}) {
  const t = useTranslation();
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className={styles["ui-field"]}>
      <label
        htmlFor={fieldId}
        className={hideLabel ? "sr-only" : undefined}
      >
        {label}
      </label>
      <input
        {...props}
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={
          error || hint ? `${fieldId}-help` : undefined
        }
      />
      {(error || hint) && (
        <small
          id={`${fieldId}-help`}
          className={error ? "error-text" : ""}
        >
          {error ? t(error) : hint}
        </small>
      )}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  limit = 10000,
  showCount = true,
  id: suppliedId,
  placeholder = "오늘 배운 내용을 자유롭게 적어보세요. 코드도 좋아요.",
  rows = 5,
  disabled,
  className,
  onKeyDown,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  limit?: number;
  showCount?: boolean;
  id?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
}) {
  const t = useTranslation();

  const generated = useId();
  const id = suppliedId ?? generated;
  const { length: count } = Array.from(value);

  return (
    <div className={styles["ui-field"]}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => {
          const characters = Array.from(event.target.value);

          onChange(
            Number.isFinite(limit)
              ? characters.slice(0, limit).join("")
              : characters.join(""),
          );
        }}
        aria-describedby={
          showCount ? `${id}-count` : undefined
        }
        placeholder={t(placeholder)}
        rows={rows}
        disabled={disabled}
        className={className}
        onKeyDown={onKeyDown}
      />
      {showCount && (
        <small id={`${id}-count`} className={"counter"}>
          {count.toLocaleString()} /{" "}
          {limit.toLocaleString()}
        </small>
      )}
    </div>
  );
}

export function Select({
  label,
  options,
  layout = "stacked",
  id,
  ...props
}: Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  label: string;
  layout?: "stacked" | "inline";
  options: readonly (
    string | { value: string; label: string }
  )[];
}) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div
      className={
        layout === "inline"
          ? styles["ui-select-inline"]
          : styles["ui-field"]
      }
    >
      <label htmlFor={fieldId}>{label}</label>
      <select {...props} id={fieldId}>
        {options.map((option) => {
          const { value, label: text } =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles["ui-switch"]}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export function Checkbox({
  label,
  variant = "inline",
  checked,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  variant?: "inline" | "choice";
}) {
  return (
    <label
      className={
        variant === "choice"
          ? `${styles["ui-choice"]} ${checked ? "selected" : ""}`
          : styles["ui-check"]
      }
    >
      <input {...props} checked={checked} type="checkbox" />
      <span className="min-w-0 break-words">{label}</span>
    </label>
  );
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={`${styles["ui-avatar"]} ${size}`}
      aria-label={name}
    >
      {Array.from(name)[0]}
    </span>
  );
}

export function Card({
  children,
  className = "",
  variant = "solid",
}: {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "note";
}) {
  return (
    <article
      className={`${styles["ui-card"]} ${variant === "note" ? "!border-2 !border-dashed !border-control-line !bg-canvas" : ""} ${className}`}
    >
      {children}
    </article>
  );
}

export function Alert({
  title,
  children,
  tone = "success",
}: {
  title: string;
  children?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className={`${styles["ui-alert"]} ${tone}`}>
      <span aria-hidden="true">
        {tone === "success"
          ? "✓"
          : tone === "danger"
            ? "!"
            : "i"}
      </span>
      <div>
        <strong>{title}</strong>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles["ui-empty"]}>
      <span aria-hidden="true">✳</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Skeleton() {
  const t = useTranslation();

  return (
    <div
      className={styles["ui-skeleton"]}
      role="status"
      aria-label={t("불러오는 중")}
    >
      <span />
      <span />
      <span />
    </div>
  );
}

export function Progress({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className={styles["ui-progress"]}>
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <progress max={100} value={value}>
        {value}%
      </progress>
    </div>
  );
}

export function Tabs({
  items,
  value,
  onChange,
  children,
  label = "컴포넌트 미리보기",
  disabled = false,
  className = "",
  panelClassName = "",
}: {
  label?: string;
  disabled?: boolean;
  items: string[];
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const t = useTranslation();

  const id = useId();
  const index = items.indexOf(value);
  const pendingTabFocus = useRef<string | null>(null);

  useEffect(() => {
    if (pendingTabFocus.current !== value) return;

    document.getElementById(`${id}-${index}`)?.focus();
    pendingTabFocus.current = null;
  }, [id, index, value]);

  return (
    <div className={`min-w-0 ${className}`}>
      <div
        className={styles["ui-tabs"]}
        role="tablist"
        aria-label={t(label)}
      >
        {items.map((item, i) => (
          <button
            type="button"
            disabled={disabled}
            key={t(item)}
            role="tab"
            id={`${id}-${i}`}
            aria-controls={`${id}-panel`}
            aria-selected={item === value}
            aria-disabled={disabled}
            tabIndex={item === value ? 0 : -1}
            onClick={() => {
              if (!disabled) onChange(item);
            }}
            onKeyDown={(event) => {
              if (disabled) return;
              let next = i;

              if (event.key === "ArrowRight")
                next = (i + 1) % items.length;
              else if (event.key === "ArrowLeft")
                next =
                  (i + items.length - 1) % items.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End")
                next = items.length - 1;
              else return;
              event.preventDefault();
              pendingTabFocus.current = items[next];
              onChange(items[next]);
              document
                .getElementById(`${id}-${next}`)
                ?.focus();
            }}
          >
            {t(item)}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${index}`}
        tabIndex={0}
        className={`${styles["tab-panel"]} ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "standard",
  initialFocusSelector,
  layout = "default",
}: {
  layout?: "default" | "conversation";
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "standard" | "room";
  initialFocusSelector?: string;
}) {
  const t = useTranslation();

  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const { current: dialog } = ref;

    if (open) {
      dialog?.showModal();
      if (initialFocusSelector)
        dialog
          ?.querySelector<HTMLElement>(initialFocusSelector)
          ?.focus();
    } else dialog?.close();

    return () => dialog?.close();
  }, [open, initialFocusSelector]);

  return (
    <dialog
      ref={ref}
      className={
        layout === "conversation"
          ? styles["conversation-modal"]
          : `${styles["ui-modal"]} ${size === "room" ? styles["modal-room"] : styles["modal-standard"]}`
      }
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles["modal-header"]}>
        <h2 id={id}>{title}</h2>
        <Button
          variant="ghost"
          aria-label={t("닫기")}
          onClick={onClose}
        >
          ×
        </Button>
      </div>
      {children}
    </dialog>
  );
}

export function Toast({
  placement = "floating",
  message,
  onClose,
}: {
  message: UiMessage;
  placement?: "floating" | "inline";
  onClose: () => void;
}) {
  const t = useTranslation();

  return (
    <div
      role="status"
      className={
        placement === "inline"
          ? "flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-2 text-sm text-primary [&_button]:ml-auto [&_button]:min-h-11 [&_button]:min-w-11 [&_button]:shrink-0 [&_button]:rounded-lg [&_button]:text-xl"
          : styles["ui-toast"]
      }
    >
      <span aria-hidden="true">✓</span>
      {t(message)}
      <button
        type="button"
        aria-label={t("알림 닫기")}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export function Choice({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`${styles["ui-choice"]} ${checked ? "selected" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
}

export function Pagination({
  page,
  total,
  onChange,
  compact = false,
}: {
  compact?: boolean;
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const t = useTranslation();

  return (
    <nav
      className={styles["pagination"]}
      aria-label={t("페이지 이동")}
    >
      <Button
        variant="ghost"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label={t("이전 페이지")}
      >
        ←
      </Button>
      {compact ? (
        <span
          role="status"
          className="px-2 text-sm tabular-nums"
        >
          {t("{0} / {1} 페이지", { 0: page, 1: total })}
        </span>
      ) : (
        Array.from({ length: total }, (_, i) => (
          <button
            type="button"
            key={i}
            aria-label={t("{0}페이지", { 0: i + 1 })}
            aria-current={
              page === i + 1 ? "page" : undefined
            }
            onClick={() => onChange(i + 1)}
          >
            {i + 1}
          </button>
        ))
      )}
      <Button
        variant="ghost"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        aria-label={t("다음 페이지")}
      >
        →
      </Button>
    </nav>
  );
}

export function SearchField({
  className,
  ...props
}: Omit<
  Parameters<typeof TextField>[0],
  "type" | "hideLabel"
>) {
  return (
    <div
      className={`${searchFieldStyle} ${className ?? ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute left-3 top-3.5 z-10 size-5 text-muted"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" strokeLinecap="round" />
      </svg>
      <TextField {...props} type="search" hideLabel />
    </div>
  );
}
