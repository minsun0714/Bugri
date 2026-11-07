import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { quizCardStyles } from "@/components/ui/quiz-card/styles";

type CardAction =
  | {
      href: string;
      onClick?: MouseEventHandler<HTMLAnchorElement>;
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
  actionText,
}: {
  title: string;
  label?: string;
  action: CardAction;
  badges?: ReactNode;
  metadata?: ReactNode;
  footer?: ReactNode;
  actionText?: string;
}) {
  const heading = (
    <>
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
      <span className="min-w-0 break-words [overflow-wrap:anywhere]">
        {title}
      </span>
      <span
        aria-hidden="true"
        className={quizCardStyles.arrow}
      >
        →
      </span>
    </>
  );
  const details = (
    <>
      {badges && (
        <span className="mt-3 flex flex-wrap gap-2">
          {badges}
        </span>
      )}
      {metadata && (
        <span className="mt-3 block break-words text-sm text-muted [overflow-wrap:anywhere]">
          {metadata}
        </span>
      )}
      {actionText && (
        <span className="mt-3 block text-right text-xs font-semibold text-primary">
          {actionText}
        </span>
      )}
    </>
  );

  return (
    <article
      className={quizCardStyles.card}
      aria-label={label}
    >
      {action.href !== undefined ? (
        <>
          <Link
            href={action.href}
            onClick={action.onClick}
            className={quizCardStyles.title}
          >
            {heading}
          </Link>
          {details}
        </>
      ) : (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          aria-label={action.label}
          className="group block w-full rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={quizCardStyles.title}>
            {heading}
          </span>
          {details}
        </button>
      )}
      {footer}
    </article>
  );
}
