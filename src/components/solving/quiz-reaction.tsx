"use client";

import { useId } from "react";
import { QuizReaction } from "@/api/constants";
import { useDemoSession } from "@/components/navigation/demo-session";
import { Button } from "@/components/ui";
import { useQuizReaction } from "@/components/solving/reaction-queries";

export function QuizReactionControl({
  userId,
  quizId,
  align = "right",
}: {
  userId: string | null;
  quizId: string;
  align?: "left" | "right";
}) {
  const countId = useId();
  const { signIn } = useDemoSession();
  const { query, update } = useQuizReaction(userId, quizId);
  const selected = userId
    ? (query.data?.reaction ?? null)
    : null;

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-2">
      <div
        role="group"
        aria-label="문제 평가"
        className={`flex flex-wrap gap-2 ${align === "left" ? "justify-start" : "justify-end"}`}
      >
        {[
          {
            value: QuizReaction.LIKE,
            label: "좋아요",
            count: query.data?.likeCount,
          },
          {
            value: QuizReaction.DISLIKE,
            label: "싫어요",
            count: query.data?.dislikeCount,
          },
        ].map(({ value, label, count }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            aria-label={label}
            aria-describedby={`${countId}-${value}`}
            aria-pressed={selected === value}
            disabled={
              userId !== null &&
              (!query.data ||
                query.isFetching ||
                update.isPending)
            }
            className="[&.ui-button:hover:not(:disabled)]:transform-none [&.ui-button:active:not(:disabled)]:transform-none [&.ui-button.sm]:min-w-11 [&.ui-button.sm]:min-h-11 [&.ui-button.sm]:px-3 [&.ui-button.sm]:py-0 [&.ghost[aria-pressed=true]]:border-primary [&.ghost[aria-pressed=true]]:bg-accent-soft"
            onClick={() => {
              if (!userId) {
                signIn();
                return;
              }
              update.mutate(
                selected === value ? null : value,
              );
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                value === QuizReaction.DISLIKE
                  ? "size-5 rotate-180"
                  : "size-5"
              }
            >
              <path
                d="M8 10 12 3c2 0 3 1.5 2.5 3.5L14 9h5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.6 20H8V10Z"
                fill={
                  selected === value
                    ? "currentColor"
                    : "none"
                }
              />
              <rect
                x="3"
                y="10"
                width="5"
                height="10"
                rx="1.5"
              />
            </svg>
            <span
              id={`${countId}-${value}`}
              className="tabular-nums"
            >
              {count === undefined ? "—" : count}
              <span className="sr-only">명</span>
            </span>
          </Button>
        ))}
      </div>
      <p role="status" className="sr-only">
        {!userId
          ? ""
          : update.isPending
            ? "평가 저장 중"
            : query.isPending
              ? "평가 불러오는 중"
              : selected === QuizReaction.LIKE
                ? "좋아요 선택됨"
                : selected === QuizReaction.DISLIKE
                  ? "싫어요 선택됨"
                  : "선택한 평가 없음"}
      </p>
      {query.isError && (
        <div
          className={`flex flex-wrap items-center gap-2 ${align === "left" ? "justify-start" : "justify-end"}`}
        >
          <p
            role="alert"
            className="text-sm text-danger-ink"
          >
            평가를 불러오지 못했어요.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void query.refetch()}
          >
            다시 불러오기
          </Button>
        </div>
      )}
      {userId && update.isError && (
        <p
          role="alert"
          className={`text-sm text-danger-ink ${align === "left" ? "text-left" : "text-right"}`}
        >
          평가를 저장하지 못했어요. 버튼을 눌러 다시 시도해
          주세요.
        </p>
      )}
    </div>
  );
}
