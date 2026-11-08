"use client";

import { QuizReaction } from "@/api/constants";
import { Button } from "@/components/ui";
import { useQuizReaction } from "@/components/solving/reaction-queries";

export function QuizReactionControl({
  userId,
  quizId,
}: {
  userId: string;
  quizId: string;
}) {
  const { query, update } = useQuizReaction(userId, quizId);
  const selected = query.data?.reaction ?? null;

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="문제 평가"
        className="flex flex-wrap justify-end gap-2"
      >
        {[
          { value: QuizReaction.LIKE, label: "좋아요" },
          { value: QuizReaction.DISLIKE, label: "싫어요" },
        ].map(({ value, label }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            aria-pressed={selected === value}
            disabled={
              !query.data ||
              query.isFetching ||
              update.isPending
            }
            className="[&.ui-button.sm]:min-h-11 [&.ghost[aria-pressed=true]]:border-primary [&.ghost[aria-pressed=true]]:bg-accent-soft"
            onClick={() =>
              update.mutate(
                selected === value ? null : value,
              )
            }
          >
            {label}
            {selected === value && (
              <span aria-hidden="true">✓</span>
            )}
          </Button>
        ))}
      </div>
      <p role="status" className="sr-only">
        {update.isPending
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
        <div className="flex flex-wrap items-center justify-end gap-2">
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
      {update.isError && (
        <p
          role="alert"
          className="text-right text-sm text-danger-ink"
        >
          평가를 저장하지 못했어요. 버튼을 눌러 다시 시도해
          주세요.
        </p>
      )}
    </div>
  );
}
