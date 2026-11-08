"use client";

import { useState } from "react";
import { getErrorMessage } from "@/api/errors";
import type {
  QuizContent,
  ReviewQuiz,
} from "@/api/contracts";
import { Button, Modal, Skeleton } from "@/components/ui";
import {
  useHashtags,
  useUpdateQuiz,
} from "@/components/notes/queries";
import { ConfirmDialog } from "@/components/notes/confirm-dialog";
import { ContentFields } from "@/features/quiz-authoring/content-fields";
import {
  editableContent,
  validateEditor,
} from "@/features/quiz-authoring/validation";
import { useTranslation } from "@/lib/i18n/use-translation";

/** Direct edit of a CONFIRMED quiz. The change applies from the next solve; finished results stay as they were. */
export function EditQuizDialog({
  userId,
  quiz,
  onClose,
}: {
  userId: string;
  quiz: ReviewQuiz;
  onClose: () => void;
}) {
  const t = useTranslation();

  const tags = useHashtags(userId);
  const update = useUpdateQuiz(userId);

  const saved = editableContent(quiz.revision);

  const [content, setContent] =
    useState<QuizContent>(saved);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [discarding, setDiscarding] = useState(false);

  const dirty =
    JSON.stringify(content) !== JSON.stringify(saved);

  function close() {
    if (dirty) setDiscarding(true);
    else onClose();
  }

  function save() {
    if (update.isPending || !tags.data) return;

    const issues = validateEditor(
      content,
      quiz.revision.sourceContent,
      tags.data,
    );

    setErrors(issues);

    if (Object.keys(issues).length) return;

    update.mutate(
      {
        quizId: quiz.quizId,
        expectedVersion: quiz.version,
        content,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <>
      <Modal
        open
        onClose={close}
        title={t("퀴즈 수정")}
        size="room"
      >
        {tags.data ? (
          <div className="grid gap-4">
            {update.error && (
              <p
                role="alert"
                className="text-sm font-medium text-danger-ink"
              >
                {t(getErrorMessage(update.error))}
              </p>
            )}
            <fieldset
              disabled={update.isPending}
              className="min-w-0"
            >
              <ContentFields
                content={content}
                source={quiz.revision.sourceContent}
                showSource={false}
                tags={tags.data}
                errors={errors}
                onChange={setContent}
                onSource={() => {}}
              />
            </fieldset>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={close}>
                {t("취소")}
              </Button>
              <Button
                loading={update.isPending}
                onClick={save}
              >
                {t("저장")}
              </Button>
            </div>
          </div>
        ) : (
          <Skeleton />
        )}
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
