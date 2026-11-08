"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ReviewQuiz } from "@/api/contracts";
import { Modal, Skeleton } from "@/components/ui";
import { Tooltip } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/notes/confirm-dialog";
import {
  apiFor,
  useHashtags,
  useRefreshAfterQuizChange,
} from "@/components/notes/queries";
import { QuizWork } from "@/features/quiz-authoring/quiz-work";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Work modal for a memo's PENDING quizzes. Closing keeps them for later; only unapplied edits ask first. */
export function NoteQuizDialog({
  userId,
  noteId,
  quizzes,
  initialQuizId,
  onClose,
}: {
  userId: string;
  noteId: string;
  quizzes: ReviewQuiz[];
  initialQuizId?: string;
  onClose: () => void;
}) {
  const t = useTranslation();

  const [dirty, setDirty] = useState(false);
  const [discarding, setDiscarding] = useState(false);

  const refresh = useRefreshAfterQuizChange(userId);

  const tags = useHashtags(userId);

  const { data: api } = useQuery({
    queryKey: ["notes", userId, "api"],
    queryFn: () => apiFor(userId),
    staleTime: Infinity,
  });

  function close() {
    if (dirty) setDiscarding(true);
    else onClose();
  }

  return (
    <>
      <Modal
        open
        onClose={close}
        title={t("버그리와 퀴즈 다듬기")}
        layout="conversation"
      >
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          role="region"
          aria-label={t("퀴즈 작업 본문")}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-muted">Mock</span>
            <Tooltip label={t("작업 공간 도움말")}>
              {t(
                "추가 요청은 선택한 퀴즈에 반영됩니다. 실제 LLM 연결과 실시간 스트리밍은 아직 적용되지 않았습니다.",
              )}
            </Tooltip>
          </div>
          {api && tags.data ? (
            <QuizWork
              api={api}
              noteId={noteId}
              tags={tags.data}
              initialQuizzes={quizzes}
              initialQuizId={initialQuizId}
              onChanged={() => void refresh()}
              onDirty={setDirty}
              onClose={onClose}
            />
          ) : (
            <Skeleton />
          )}
        </div>
      </Modal>
      <ConfirmDialog
        open={discarding}
        title={t("저장하지 않은 변경을 버릴까요?")}
        confirmLabel={t("변경 버리기")}
        cancelLabel={t("계속 수정")}
        onClose={() => setDiscarding(false)}
        onConfirm={() => {
          setDiscarding(false);
          onClose();
        }}
      />
    </>
  );
}
