"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/api/errors";
import { Button, Toast } from "@/components/ui";
import { NoteEditorField } from "@/components/notes/note-editor-field";
import { useCreateNote } from "@/components/notes/queries";
import {
  checkNoteDraft,
  type NoteDraftIssue,
} from "@/components/notes/rules";
import { useTranslation } from "@/lib/i18n/use-translation";

const toastDuration = 8_000;

export function QuickNote({ userId }: { userId: string }) {
  const t = useTranslation();

  const create = useCreateNote(userId);
  const [draft, setDraft] = useState("");
  const [issue, setIssue] = useState<NoteDraftIssue | null>(
    null,
  );
  const [savedId, setSavedId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!savedId) return;

    const timer = setTimeout(
      () => setSavedId(null),
      toastDuration,
    );

    return () => clearTimeout(timer);
  }, [savedId]);

  function submit() {
    if (create.isPending) return;

    const found = checkNoteDraft(draft);

    setIssue(found);
    create.reset();

    if (found) return;

    create.mutate(draft, {
      onSuccess: ({ noteId }) => {
        setDraft("");
        setSavedId(noteId);
      },
    });
  }

  return (
    <section
      aria-labelledby="quick-note-heading"
      className="rounded-surface border border-line bg-surface p-4 sm:p-5"
    >
      <h2
        id="quick-note-heading"
        className="mb-3 text-lg font-semibold"
      >
        {t("빠른 메모")}
      </h2>
      <NoteEditorField
        label={t("메모")}
        value={draft}
        issue={issue}
        apiError={
          create.error
            ? t(getErrorMessage(create.error))
            : undefined
        }
        onChange={(value) => {
          setDraft(value);
          setIssue(null);
        }}
        onSubmit={submit}
        className="[&_textarea]:field-sizing-content [&_textarea]:max-h-[50vh] [&_textarea]:min-h-32!"
      />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4">
        <p className="min-w-0 flex-1 text-xs leading-5 text-muted">
          {t(
            "비밀키·개인정보는 적지 마세요. 지금은 이 브라우저의 Mock 데이터로만 저장돼요.",
          )}
        </p>
        <Button
          className="self-end"
          loading={create.isPending}
          onClick={submit}
        >
          {t("메모 저장")}
        </Button>
      </div>
      {savedId && (
        <Toast
          message="저장했어요"
          action={
            <>
              <span aria-hidden="true">·</span>
              <Link
                href={`/notes/${encodeURIComponent(savedId)}?${new URLSearchParams({ user: userId })}`}
                className="rounded font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                {t("퀴즈로 만들기")}
              </Link>
            </>
          }
          onClose={() => setSavedId(null)}
        />
      )}
    </section>
  );
}
