"use client";

import { useEffect, useRef, useState } from "react";
import { QuizStatus } from "@/api/constants";
import {
  Button,
  Card,
  EmptyState,
  Tabs,
  TextArea,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/notes/confirm-dialog";
import { ContentFields } from "@/features/quiz-authoring/content-fields";
import { ContentPreview } from "@/features/quiz-authoring/content-preview";
import { RequestError } from "@/features/quiz-authoring/feedback";
import {
  useQuizWork,
  type QuizWorkProps,
} from "@/features/quiz-authoring/hooks/use-quiz-work";
import { MarkdownContent } from "@/features/quiz-authoring/markdown-content";
import { useTranslation } from "@/lib/i18n/use-translation";

const WorkMode = {
  PREVIEW: "미리보기",
  EDIT: "직접 수정",
  CHAT: "LLM으로 수정",
} as const;

type WorkMode = (typeof WorkMode)[keyof typeof WorkMode];

/** PENDING quizzes of one memo: preview, edit, refine with the LLM, save or delete each, or save the rest at once. */
export function QuizWork(props: QuizWorkProps) {
  const t = useTranslation();

  const [modes, setModes] = useState<
    Record<string, WorkMode>
  >({});

  const [confirmDelete, setConfirmDelete] = useState(false);

  const work = useQuizWork(props);

  const {
    quizzes,
    quiz,
    selectedIndex,
    select,
    pendingCount,
    draftCount,
    hasDraft,
    editing,
    errors,
    prompt,
    notice,
    error,
    busy,
    changePrompt,
    edit,
    cancelEdit,
    applyEdit,
    refine,
    remove,
    save,
    saveAll,
    reload,
  } = work;

  const quizId = quiz?.quizId ?? "";
  const saved = quiz?.status === QuizStatus.CONFIRMED;

  const selectedMode = modes[quizId] ?? WorkMode.PREVIEW;

  const mode =
    selectedMode === WorkMode.EDIT && !editing
      ? WorkMode.PREVIEW
      : selectedMode;

  const chatOpen = mode === WorkMode.CHAT && !saved;
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current: log } = chatLogRef;

    if (chatOpen && log) log.scrollTop = log.scrollHeight;
  }, [chatOpen, quiz?.version]);

  const tabLabels = quizzes.map((item, index) =>
    t(
      item.status === QuizStatus.CONFIRMED
        ? "퀴즈 {0} · 저장됨"
        : "퀴즈 {0}",
      { 0: index + 1 },
    ),
  );

  function setMode(next: WorkMode) {
    setModes((current) => ({ ...current, [quizId]: next }));
  }

  const chatWorkspace = quiz ? (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label={t("버그리와 대화")}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line pb-4">
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => setMode(WorkMode.PREVIEW)}
        >
          <span aria-hidden="true">←</span>
          {t("퀴즈로 돌아가기")}
        </Button>
        <div className="min-w-0 text-right">
          <p className="text-xs text-muted">
            {t("퀴즈")}
            {selectedIndex + 1}
          </p>
          <h2 className="truncate text-sm font-semibold text-foreground">
            {quiz.revision.title}
          </h2>
        </div>
      </header>

      <div
        ref={chatLogRef}
        className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto py-5"
        role="log"
        aria-label={t("대화 내용")}
      >
        <div
          aria-label={t("첫 사용자 메시지")}
          className="max-w-[90%] justify-self-end rounded-2xl bg-primary/10 px-5 py-4"
        >
          <span className="mb-2 block text-xs font-semibold text-muted">
            {t("나")}
          </span>
          <MarkdownContent>
            {quiz.revision.sourceContent}
          </MarkdownContent>
        </div>

        {quiz.history.length ? (
          <ol
            className="grid gap-4"
            aria-label={t("추가 요청 기록")}
          >
            {quiz.history.map(
              ({ prompt: sent, content }, index) => (
                <li key={index} className="grid gap-3">
                  <p className="max-w-[90%] justify-self-end whitespace-pre-wrap break-words rounded-2xl bg-primary/10 px-4 py-3 text-sm">
                    {sent}
                  </p>
                  <div className="max-w-[90%] rounded-2xl border border-line bg-canvas px-5 py-4 text-sm">
                    <span className="mb-2 block text-xs font-semibold text-primary">
                      {t("버그리")}
                    </span>
                    <p className="mb-2 font-semibold text-foreground">
                      {content.title}
                    </p>
                    <MarkdownContent>
                      {content.question.prompt}
                    </MarkdownContent>
                  </div>
                </li>
              ),
            )}
          </ol>
        ) : (
          <div className="max-w-[90%] rounded-2xl border border-line bg-canvas px-5 py-4 text-sm">
            <span className="mb-2 block text-xs font-semibold text-primary">
              {t("버그리")}
            </span>
            <p className="mb-2 font-semibold text-foreground">
              {quiz.revision.title}
            </p>
            <MarkdownContent>
              {quiz.revision.question.prompt}
            </MarkdownContent>
          </div>
        )}
      </div>

      <form
        className="flex shrink-0 flex-wrap items-end justify-end gap-3 border-t border-line bg-surface px-2 pt-4 pb-2"
        onSubmit={(event) => {
          event.preventDefault();
          refine();
        }}
      >
        <div className="min-w-0 flex-1">
          <TextArea
            label={t("퀴즈 {0}에 추가 요청", {
              0: selectedIndex + 1,
            })}
            placeholder={t("예시를 추가해줘")}
            value={prompt}
            disabled={busy}
            rows={2}
            limit={Number.POSITIVE_INFINITY}
            showCount={false}
            className="max-h-32 min-h-16 resize-none!"
            onChange={changePrompt}
            onKeyDown={(event) => {
              if (
                event.key !== "Enter" ||
                event.shiftKey ||
                event.nativeEvent.isComposing
              )
                return;

              event.preventDefault();

              if (prompt.trim() && !busy)
                event.currentTarget.form?.requestSubmit();
            }}
          />
        </div>
        <Button
          size="sm"
          type="submit"
          aria-label={t("요청 보내기")}
          title={t("요청 보내기")}
          loading={busy}
          disabled={!prompt.trim()}
          className="size-10 min-h-10! p-0!"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={busy ? "hidden" : "size-4"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </Button>
      </form>
    </section>
  ) : null;

  return (
    <section
      className="flex min-h-0 flex-1 flex-col gap-4"
      aria-label={t("확인 안 한 퀴즈")}
    >
      {notice && (
        <p role="status" className="text-primary">
          {t(notice)}
        </p>
      )}

      <RequestError error={error} />

      {!!error && (
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={reload}
          >
            {t("최신 퀴즈 다시 불러오기")}
          </Button>
        </div>
      )}

      {quiz && chatOpen && chatWorkspace}

      {quiz && !chatOpen && (
        <Tabs
          label={t("퀴즈 선택")}
          items={tabLabels}
          value={tabLabels[selectedIndex]}
          disabled={busy}
          className="flex min-h-0 flex-1 flex-col [&_[role=tablist]]:shrink-0"
          panelClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
          onChange={(label) =>
            select(tabLabels.indexOf(label))
          }
        >
          <Card
            className="grid gap-6 text-foreground"
            aria-label={t("버그리 응답")}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mb-1 text-xs text-muted">
                  {t("문제")}
                  {selectedIndex + 1} / {quizzes.length}
                </p>
                <h2 className="text-lg font-semibold">
                  {quiz.revision.title}
                </h2>
              </div>
              <div className="ml-auto flex flex-wrap justify-end gap-1">
                {!saved &&
                  [WorkMode.EDIT, WorkMode.CHAT].map(
                    (label) => (
                      <Button
                        key={label}
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        aria-expanded={mode === label}
                        aria-controls={
                          label === WorkMode.EDIT
                            ? "quiz-editing"
                            : undefined
                        }
                        onClick={() => {
                          const next =
                            mode === label
                              ? WorkMode.PREVIEW
                              : label;

                          setMode(next);

                          if (
                            next === WorkMode.EDIT &&
                            !editing
                          )
                            edit(work.startContent!);
                        }}
                      >
                        {t(label)}
                      </Button>
                    ),
                  )}
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busy}
                  onClick={() => setConfirmDelete(true)}
                >
                  {t("퀴즈 삭제")}
                </Button>
              </div>
            </div>

            {mode !== WorkMode.EDIT && (
              <ContentPreview content={quiz.revision} />
            )}

            {mode === WorkMode.EDIT && editing && (
              <div
                id="quiz-editing"
                className="border-t border-line pt-5"
              >
                <fieldset
                  disabled={busy}
                  className="min-w-0"
                >
                  <ContentFields
                    content={editing}
                    source={quiz.revision.sourceContent}
                    showSource={false}
                    tags={props.tags}
                    errors={errors}
                    onChange={edit}
                    onSource={() => {}}
                  />
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <Button
                      size="sm"
                      onClick={applyEdit}
                      loading={busy}
                    >
                      {t("수정 반영")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        cancelEdit();
                        setMode(WorkMode.PREVIEW);
                      }}
                    >
                      {t("수정 취소")}
                    </Button>
                  </div>
                </fieldset>
              </div>
            )}

            {!editing &&
              (saved ? (
                <p className="border-t border-line pt-3 text-right text-xs text-muted">
                  {t("저장됨")}
                </p>
              ) : (
                <div className="flex flex-wrap items-center justify-end gap-3">
                  {hasDraft && (
                    <p
                      role="status"
                      className="mr-auto text-xs text-muted"
                    >
                      {t(
                        "추가 요청을 보내거나 지운 뒤 저장하세요.",
                      )}
                    </p>
                  )}
                  <Button
                    size="sm"
                    disabled={busy || hasDraft}
                    onClick={save}
                  >
                    {t("저장")}
                  </Button>
                </div>
              ))}
          </Card>
        </Tabs>
      )}

      {!quiz && (
        <EmptyState
          title={t("남은 퀴즈가 없습니다")}
          description=""
        />
      )}

      {pendingCount > 0 && !chatOpen && (
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
          {draftCount > 0 && (
            <p
              role="status"
              className="mr-auto text-xs text-muted"
            >
              {t(
                "미반영 수정이 있는 퀴즈는 반영하거나 취소한 뒤 저장하세요.",
              )}
            </p>
          )}
          <Button
            disabled={busy || draftCount > 0}
            loading={busy}
            onClick={saveAll}
          >
            {t("남은 퀴즈 모두 저장 ({0})", {
              0: pendingCount,
            })}
          </Button>
        </footer>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={t("“{0}” 퀴즈를 삭제할까요?", {
          0: quiz?.revision.title ?? "",
        })}
        confirmLabel={t("삭제")}
        cancelLabel={t("취소")}
        loading={busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          remove();
        }}
      />
    </section>
  );
}
