"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ApiClientError } from "@/api/client";
import { getErrorMessage } from "@/api/errors";
import type { Note } from "@/api/contracts";
import {
  Button,
  EmptyState,
  Skeleton,
  Toast,
} from "@/components/ui";
import { MarkdownContent } from "@/features/quiz-authoring/markdown-content";
import { useLeaveGuard } from "@/components/notes/use-leave-guard";
import { ConfirmDialog } from "@/components/notes/confirm-dialog";
import { NoteEditorField } from "@/components/notes/note-editor-field";
import { NoteQuizzes } from "@/components/notes/note-quizzes";
import { NoteTags } from "@/components/notes/note-tags";
import { NotesGate } from "@/components/notes/notes-gate";
import {
  useDeleteNote,
  useNote,
  useUpdateNote,
} from "@/components/notes/queries";
import {
  checkNoteDraft,
  type NoteDraftIssue,
} from "@/components/notes/rules";
import { pageTitle } from "@/components/ui/styles";
import {
  useLocale,
  useTranslation,
} from "@/lib/i18n/use-translation";

const linkStyle =
  "inline-flex min-h-11 items-center rounded text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary";

function NoteBody({
  userId,
  note,
}: {
  userId: string;
  note: Note;
}) {
  const t = useTranslation();
  const locale = useLocale();
  const router = useRouter();

  const update = useUpdateNote(userId, note.noteId);
  const remove = useDeleteNote(userId, note.noteId);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [issue, setIssue] = useState<NoteDraftIssue | null>(
    null,
  );
  const [confirm, setConfirm] = useState<
    "delete" | "discard" | null
  >(null);
  const [saved, setSaved] = useState(false);
  const [leaveHref, setLeaveHref] = useState<string | null>(
    null,
  );

  const editor = useRef<HTMLDivElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const focusAfter = useRef<"editor" | "button" | null>(
    null,
  );

  const dirty = editing && draft !== note.content;

  const block = useCallback((href: string) => {
    setLeaveHref(href);
    setConfirm("discard");
  }, []);

  useLeaveGuard(dirty, block);

  // Keep keyboard focus on the thing the user just acted on.
  useEffect(() => {
    if (focusAfter.current === "editor")
      editor.current?.querySelector("textarea")?.focus();
    else if (focusAfter.current === "button")
      editButton.current?.focus();

    focusAfter.current = null;
  }, [editing]);

  const listHref = `/notes?${new URLSearchParams({ user: userId })}`;

  function startEditing() {
    setDraft(note.content);
    setIssue(null);
    setSaved(false);
    update.reset();
    focusAfter.current = "editor";
    setEditing(true);
  }

  function stopEditing() {
    focusAfter.current = "button";
    setEditing(false);
    setConfirm(null);
    setIssue(null);
    update.reset();
  }

  function save() {
    if (update.isPending) return;

    const found = checkNoteDraft(draft);

    setIssue(found);
    update.reset();

    if (found) return;

    update.mutate(
      { content: draft, expectedVersion: note.version },
      {
        onSuccess: () => {
          focusAfter.current = "button";
          setEditing(false);
          setSaved(true);
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <time
          dateTime={note.createdAt}
          className="text-xs tabular-nums text-muted"
        >
          {new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(note.createdAt))}
        </time>
        {!editing && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              ref={editButton}
              variant="secondary"
              onClick={startEditing}
            >
              {t("수정")}
            </Button>
            <Button
              variant="danger"
              onClick={() => setConfirm("delete")}
            >
              {t("삭제")}
            </Button>
          </div>
        )}
      </div>
      {saved && !editing && (
        <Toast
          placement="inline"
          message="저장했어요"
          onClose={() => setSaved(false)}
        />
      )}
      {editing ? (
        <>
          <div ref={editor}>
            <NoteEditorField
              className="[&_textarea]:field-sizing-content [&_textarea]:max-h-[60vh] [&_textarea]:min-h-40!"
              label={t("메모")}
              value={draft}
              issue={issue}
              apiError={
                update.error
                  ? t(getErrorMessage(update.error))
                  : undefined
              }
              onChange={(value) => {
                setDraft(value);
                setIssue(null);
              }}
              onSubmit={save}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                dirty
                  ? setConfirm("discard")
                  : stopEditing()
              }
            >
              {t("취소")}
            </Button>
            <Button
              loading={update.isPending}
              onClick={save}
            >
              {t("저장")}
            </Button>
          </div>
        </>
      ) : (
        <article
          aria-label={t("메모 본문")}
          className="rounded-surface border border-line bg-surface p-4 sm:p-5"
        >
          <MarkdownContent>{note.content}</MarkdownContent>
        </article>
      )}
      <NoteTags
        userId={userId}
        hashtagIds={note.hashtagIds}
      />
      {!editing && (
        <NoteQuizzes userId={userId} note={note} />
      )}
      <ConfirmDialog
        open={confirm === "delete"}
        title={t("이 메모를 삭제할까요?")}
        description={
          note.confirmedCount + note.pendingCount === 0
            ? undefined
            : note.pendingCount > 0
              ? t(
                  "연결된 퀴즈 {0}개(확인 안 한 퀴즈 {1}개 포함)도 함께 삭제돼요. 이미 푼 기록은 풀이 내역에 남아요.",
                  {
                    0:
                      note.confirmedCount +
                      note.pendingCount,
                    1: note.pendingCount,
                  },
                )
              : t(
                  "연결된 퀴즈 {0}개도 함께 삭제돼요. 이미 푼 기록은 풀이 내역에 남아요.",
                  { 0: note.confirmedCount },
                )
        }
        confirmLabel={t("삭제")}
        cancelLabel={t("취소")}
        loading={remove.isPending}
        error={
          remove.error
            ? t(getErrorMessage(remove.error))
            : undefined
        }
        onClose={() => {
          setConfirm(null);
          remove.reset();
        }}
        onConfirm={() =>
          remove.mutate(undefined, {
            onSuccess: () => router.push(listHref),
          })
        }
      />
      <ConfirmDialog
        open={confirm === "discard"}
        title={t("저장하지 않은 변경을 버릴까요?")}
        confirmLabel={t("변경 버리기")}
        cancelLabel={t("계속 수정")}
        onClose={() => {
          setConfirm(null);
          setLeaveHref(null);
        }}
        onConfirm={() => {
          if (leaveHref) {
            const href = leaveHref;

            setLeaveHref(null);
            setConfirm(null);
            setEditing(false);
            router.push(href);

            return;
          }

          stopEditing();
        }}
      />
    </div>
  );
}

function NoteDetail({
  userId,
  noteId,
}: {
  userId: string;
  noteId: string;
}) {
  const t = useTranslation();

  const { data, error, isPending, isFetching, refetch } =
    useNote(userId, noteId);

  const listHref = `/notes?${new URLSearchParams({ user: userId })}`;

  if (isPending) return <Skeleton />;

  if (error) {
    const unavailable =
      error instanceof ApiClientError &&
      error.status === 404;

    return (
      <EmptyState
        title={
          unavailable
            ? t("접근할 수 없는 메모예요")
            : t(getErrorMessage(error))
        }
        description={
          unavailable
            ? t(
                "없거나 삭제된 메모이거나, 다른 사용자의 메모예요.",
              )
            : ""
        }
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            {!unavailable && (
              <Button
                variant="secondary"
                loading={isFetching}
                onClick={() => void refetch()}
              >
                {t("다시 시도")}
              </Button>
            )}
            <Link href={listHref} className={linkStyle}>
              {t("내 노트로 돌아가기")}
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <NoteBody
      key={data.noteId}
      userId={userId}
      note={data}
    />
  );
}

export function NoteDetailScreen({
  noteId,
}: {
  noteId: string;
}) {
  const t = useTranslation();

  return (
    <div className="w-full min-w-0 space-y-4">
      <h1 className={pageTitle}>{t("메모")}</h1>
      <NotesGate>
        {(userId) => (
          <NoteDetail
            key={noteId}
            userId={userId}
            noteId={noteId}
          />
        )}
      </NotesGate>
    </div>
  );
}
