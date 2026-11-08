"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui";
import { quizCardStyles } from "@/components/ui/quiz-card/styles";

type CardAction =
  | {
      href: string;
      onClick?: MouseEventHandler<HTMLAnchorElement>;
      disabled?: boolean;
    }
  | {
      href?: never;
      onClick: MouseEventHandler<HTMLButtonElement>;
      disabled?: boolean;
      label: string;
    };

export function QuizCard({
  title,
  label,
  action,
  badges,
  metadata,
  footer,
  settings,
  go,
  density = "default",
}: {
  density?: "default" | "compact";
  title: string;
  label?: string;
  action: CardAction;
  badges?: ReactNode;
  metadata?: ReactNode;
  footer?: ReactNode;
  /** Show a go-to icon in the title row; the whole card already acts as that link. */
  go?: boolean;
  settings?: {
    label: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  };
}) {
  const compact = density === "compact";

  const heading = (
    <div
      className={
        compact
          ? quizCardStyles.compactTitle
          : quizCardStyles.title
      }
    >
      <span
        aria-hidden="true"
        className={quizCardStyles.notebook}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-7"
        >
          <rect
            x="6"
            y="4"
            width="17"
            height="21"
            rx="4"
            className="fill-surface"
          />
          <path d="M4 9h4m-4 6h4m-4 6h4M12 10h6m-6 5h6m-6 5h3" />
          <path
            d="m22 2 .7 2.3L25 5l-2.3.7L22 8l-.7-2.3L19 5l2.3-.7Z"
            className="fill-lime stroke-primary"
            strokeWidth="1.2"
          />
        </svg>
      </span>
      <span
        className={`min-w-0 break-words [overflow-wrap:anywhere] ${compact ? "line-clamp-2" : ""}`}
      >
        {title}
      </span>
      {go && !action.disabled && (
        <svg
          aria-hidden="true"
          data-card-go=""
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={quizCardStyles.go}
        >
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      )}
    </div>
  );

  return (
    <article
      className={
        compact
          ? quizCardStyles.compactCard
          : quizCardStyles.card
      }
      aria-label={label}
    >
      {action.href !== undefined ? (
        <Link
          href={action.href}
          title={compact ? title : undefined}
          aria-label={title}
          aria-disabled={action.disabled || undefined}
          tabIndex={action.disabled ? -1 : undefined}
          onClick={(event) => {
            if (action.disabled) {
              event.preventDefault();
              return;
            }
            action.onClick?.(event);
          }}
          className={`${quizCardStyles.access} ${settings ? "pr-13" : ""}`}
        >
          {heading}
        </Link>
      ) : (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          title={compact ? title : undefined}
          aria-label={action.label}
          className={`${quizCardStyles.access} ${settings ? "pr-13" : ""}`}
        >
          {heading}
        </button>
      )}
      <div className="pointer-events-none">
        {badges && (
          <div className="mt-2 flex flex-wrap gap-2">
            {badges}
          </div>
        )}
        {metadata && (
          <div className="mt-2 break-words text-sm text-muted [overflow-wrap:anywhere]">
            {metadata}
          </div>
        )}
      </div>
      {settings && (
        <Button
          variant="ghost"
          size="sm"
          aria-label={settings.label}
          onClick={settings.onClick}
          disabled={settings.disabled}
          className={quizCardStyles.settings}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="m10 3-.5 2a7 7 0 0 0-2 1.2l-2-.6-2 3.4L5 10.5a7 7 0 0 0 0 3L3.5 15l2 3.4 2-.6a7 7 0 0 0 2 1.2l.5 2h4l.5-2a7 7 0 0 0 2-1.2l2 .6 2-3.4-1.5-1.5a7 7 0 0 0 0-3L20.5 9l-2-3.4-2 .6a7 7 0 0 0-2-1.2L14 3Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Button>
      )}
      {footer && (
        <div className={quizCardStyles.footer}>
          {footer}
        </div>
      )}
    </article>
  );
}
