"use client";

import { styles } from "@/components/ui/styles";

import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
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
  error,
  hint,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
}) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className={styles["ui-field"]}>
      <label htmlFor={fieldId}>{label}</label>
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
          {error || hint}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  limit?: number;
}) {
  const id = useId();
  const { length: count } = Array.from(value);

  return (
    <div className={styles["ui-field"]}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(event) =>
          onChange(
            Array.from(event.target.value)
              .slice(0, limit)
              .join(""),
          )
        }
        aria-describedby={`${id}-count`}
        placeholder="오늘 배운 내용을 자유롭게 적어보세요. 코드도 좋아요."
        rows={5}
      />
      <small id={`${id}-count`} className={"counter"}>
        {count.toLocaleString()} / {limit.toLocaleString()}
      </small>
    </div>
  );
}

export function Select({
  label,
  options,
  id,
  ...props
}: Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  label: string;
  options: (string | { value: string; label: string })[];
}) {
  const generated = useId();
  const fieldId = id ?? generated;

  return (
    <div className={styles["ui-field"]}>
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
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className={styles["ui-check"]}>
      <input {...props} type="checkbox" />
      {label}
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
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`${styles["ui-card"]} ${className}`}
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
  return (
    <div
      className={styles["ui-skeleton"]}
      role="status"
      aria-label="불러오는 중"
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
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  const index = items.indexOf(value);

  return (
    <div>
      <div
        className={styles["ui-tabs"]}
        role="tablist"
        aria-label="컴포넌트 미리보기"
      >
        {items.map((item, i) => (
          <button
            type="button"
            key={item}
            role="tab"
            id={`${id}-${i}`}
            aria-controls={`${id}-panel`}
            aria-selected={item === value}
            tabIndex={item === value ? 0 : -1}
            onClick={() => onChange(item)}
            onKeyDown={(event) => {
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
              onChange(items[next]);
              document
                .getElementById(`${id}-${next}`)
                ?.focus();
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${index}`}
        tabIndex={0}
        className={styles["tab-panel"]}
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
  layout = "default",
}: {
  layout?: "default" | "conversation";
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const { current: dialog } = ref;

    if (open) dialog?.showModal();
    else dialog?.close();

    return () => dialog?.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={
        layout === "conversation"
          ? styles["conversation-modal"]
          : styles["ui-modal"]
      }
      aria-labelledby={id}
      onCancel={onClose}
      onClose={({ currentTarget }) => {
        if (!currentTarget.open) onClose();
      }}
    >
      <div className={styles["modal-header"]}>
        <h2 id={id}>{title}</h2>
        <Button
          variant="ghost"
          aria-label="닫기"
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
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div role="status" className={styles["ui-toast"]}>
      <span aria-hidden="true">✓</span>
      {message}
      <button
        type="button"
        aria-label="알림 닫기"
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

export function Coin({ amount }: { amount: number }) {
  return (
    <span className={styles["ui-coin"]}>
      <span aria-hidden="true">B</span>
      {amount.toLocaleString()} <small>BugCoin</small>
    </span>
  );
}

export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav
      className={styles["pagination"]}
      aria-label="페이지 이동"
    >
      <Button
        variant="ghost"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="이전 페이지"
      >
        ←
      </Button>
      {Array.from({ length: total }, (_, i) => (
        <button
          type="button"
          key={i}
          aria-label={`${i + 1}페이지`}
          aria-current={page === i + 1 ? "page" : undefined}
          onClick={() => onChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <Button
        variant="ghost"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        aria-label="다음 페이지"
      >
        →
      </Button>
    </nav>
  );
}
