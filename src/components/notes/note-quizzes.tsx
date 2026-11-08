"use client";

import Link from "next/link";
import { useState } from "react";
import { QuizStatus } from "@/api/constants";
import { getErrorMessage } from "@/api/errors";
import type { Note, ReviewQuiz } from "@/api/contracts";
import { Badge, Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/notes/confirm-dialog";
import {
  useDeleteQuiz,
  useGenerateQuizzes,
  useNoteQuizzes,
} from "@/components/notes/queries";
import { EditQuizDialog } from "@/features/quiz-authoring/edit-quiz-dialog";
import { NoteQuizDialog } from "@/features/quiz-authoring/note-quiz-dialog";
import { useTranslation } from "@/lib/i18n/use-translation";

type Work = {
  quizzes: ReviewQuiz[];
  initialQuizId?: string;
};

/** Memo detail: continue unconfirmed quizzes, create new ones, and manage the confirmed ones. */
export function NoteQuizzes({
  userId,
  note,
}: {
  userId: string;
  note: Note;
}) {
  const t = useTranslation();

  const { noteId, pendingCount } = note;

  const generate = useGenerateQuizzes(userId, noteId);
  const remove = useDeleteQuiz(userId);

  const pending = useNoteQuizzes(
    userId,
    noteId,
    QuizStatus.PENDING,
  );

  const confirmed = useNoteQuizzes(
    userId,
    noteId,
    QuizStatus.CONFIRMED,
  );

  const [work, setWork] = useState<Work | null>(null);
  const [editing, setEditing] = useState<ReviewQuiz | null>(
    null,
  );
  const [deleting, setDeleting] =
    useState<ReviewQuiz | null>(null);

  const format = {
    SINGLE_CHOICE: t("객관식 · 하나 선택"),
    MULTIPLE_CHOICE: t("객관식 · 모두 선택"),
    TRUE_FALSE: t("OX 문제"),
    SHORT_ANSWER: t("단답형"),
  } as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          loading={generate.isPending}
          onClick={() => {
            generate.reset();

            generate.mutate(undefined, {
              onSuccess: ({ created, pending: all }) =>
                setWork({
                  quizzes: all,
                  initialQuizId: created[0]?.quizId,
                }),
            });
          }}
        >
          {t("퀴즈로 만들기")}
        </Button>
        {generate.isPending && (
          <p role="status" className="text-sm text-primary">
            {t("퀴즈를 만들고 있어요…")}
          </p>
        )}
        {pendingCount > 0 && (
          <Button
            variant="secondary"
            disabled={!pending.data}
            onClick={() =>
              pending.data &&
              setWork({ quizzes: pending.data })
            }
          >
            {t("확인 안 한 퀴즈 {0}개 · 이어서 확인", {
              0: pendingCount,
            })}
          </Button>
        )}
      </div>
      {generate.error && (
        <p
          role="alert"
          className="text-sm font-medium text-danger-ink"
        >
          {t(getErrorMessage(generate.error))}
        </p>
      )}
      <section
        aria-labelledby="note-quizzes-heading"
        className="pt-4"
      >
        <h2
          id="note-quizzes-heading"
          className="mb-2 text-lg font-semibold"
        >
          {t("이 메모의 퀴즈")}
        </h2>
        {confirmed.data?.length ? (
          <ul className="divide-y divide-line/70 rounded-surface border border-line bg-surface">
            {confirmed.data.map((quiz) => {
              const { quizId, revision } = quiz;

              return (
                <li
                  key={quizId}
                  className="grid gap-2 px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3"
                >
                  <Link
                    href={`/solve?${new URLSearchParams({ user: userId, quiz: quizId })}`}
                    className="min-w-0 rounded text-sm font-semibold text-primary [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-primary sm:flex-1"
                  >
                    {revision.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 sm:contents">
                    <Badge>
                      {format[revision.question.type]}
                    </Badge>
                    <div className="ml-auto flex gap-1 sm:ml-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={t("{0} 수정", {
                          0: revision.title,
                        })}
                        onClick={() => setEditing(quiz)}
                      >
                        {t("수정")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger-ink"
                        aria-label={t("{0} 삭제", {
                          0: revision.title,
                        })}
                        onClick={() => setDeleting(quiz)}
                      >
                        {t("삭제")}
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          !confirmed.isPending &&
          pendingCount === 0 && (
            <p className="text-sm text-muted">
              {t("퀴즈 없음")}
            </p>
          )
        )}
      </section>
      {work && (
        <NoteQuizDialog
          userId={userId}
          noteId={noteId}
          quizzes={work.quizzes}
          initialQuizId={work.initialQuizId}
          onClose={() => setWork(null)}
        />
      )}
      {editing && (
        <EditQuizDialog
          userId={userId}
          quiz={editing}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        title={t("“{0}” 퀴즈를 삭제할까요?", {
          0: deleting?.revision.title ?? "",
        })}
        confirmLabel={t("삭제")}
        cancelLabel={t("취소")}
        loading={remove.isPending}
        error={
          remove.error
            ? t(getErrorMessage(remove.error))
            : undefined
        }
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.quizId, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </div>
  );
}
