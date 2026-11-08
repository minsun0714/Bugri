"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { QuizScope, QuizStatus } from "@/api/constants";
import {
  Button,
  Card,
  EmptyState,
  Tabs,
  TextArea,
} from "@/components/ui";
import { pageTitle } from "@/components/ui/styles";
import { ContentFields } from "@/features/quiz-authoring/content-fields";
import { ContentPreview } from "@/features/quiz-authoring/content-preview";
import { RequestError } from "@/features/quiz-authoring/feedback";
import { useAuthoringQuery } from "@/features/quiz-authoring/hooks/use-authoring-api";
import {
  useGeneration,
  type GenerationProps,
} from "@/features/quiz-authoring/hooks/use-generation";
import { MarkdownContent } from "@/features/quiz-authoring/markdown-content";
import { styles } from "@/features/quiz-authoring/styles";
import { useEffect, useRef, useState } from "react";

export function Generation(props: GenerationProps) {
  const t = useTranslation();

  const [modes, setModes] = useState<
    Record<number, string>
  >({});
  const {
    batch,
    removeCandidate,
    notice,
    editing,
    edit,
    cancelEdit,
    applyEdit,
    candidate,
    selectedIndex,
    setSelectedIndex,
    prompt,
    changePrompt,
    error,
    busy,
    refine,
    reload,
    save,
  } = useGeneration(props);
  const selectedMode = modes[selectedIndex] ?? "미리보기";
  const mode =
    selectedMode === "직접 수정" && !editing
      ? "미리보기"
      : selectedMode;
  const chatOpen = mode === "LLM으로 수정";
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current: log } = chatLogRef;

    if (chatOpen && log) log.scrollTop = log.scrollHeight;
  }, [chatOpen, candidate?.candidateId]);

  const tags = useAuthoringQuery(
    props.api,
    props.userId ?? "learner",
    "discoverHashtags",
    {},
  );
  const savedQuizzes = useAuthoringQuery(
    props.api,
    props.userId ?? "learner",
    "quizzes",
    { scope: QuizScope.OWN },
    batch.candidates.some(
      ({ savedQuizId }) => !!savedQuizId,
    ),
  );
  const savedLabels = batch.candidates.map(
    ({ savedQuizId }) => {
      if (!savedQuizId) return "";

      const saved = savedQuizzes.data?.find(
        ({ quizId }) => quizId === savedQuizId,
      );

      if (!saved) return t("상태 확인 중");
      if (saved.status !== QuizStatus.PENDING)
        return t("승인됨");
      return t("임시저장됨");
    },
  );
  const tabLabels = batch.candidates.map((_, index) =>
    t("퀴즈 {0}{1}", {
      0: index + 1,
      1: savedLabels[index]
        ? ` · ${savedLabels[index]}`
        : "",
    }),
  );
  const manageHref = `/quizzes/authoring/manage?user=${encodeURIComponent(props.userId ?? "learner")}`;
  const allHandled =
    batch.candidates.length > 0 &&
    batch.candidates.every(
      ({ savedQuizId }) => savedQuizId,
    );
  const [firstHandled] = batch.candidates;
  const reviewHref = firstHandled?.savedQuizId
    ? `${manageHref}&quiz=${encodeURIComponent(firstHandled.savedQuizId)}`
    : manageHref;
  const closeChat = () =>
    setModes((current) => ({
      ...current,
      [selectedIndex]: "미리보기",
    }));
  const deleteCurrent = () => {
    setModes({});
    removeCandidate();
  };
  const chatWorkspace = candidate ? (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label={t("버그리와 대화")}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line pb-4">
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={closeChat}
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
            {candidate.content.title}
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
            {batch.sourceContent}
          </MarkdownContent>
        </div>

        {candidate.history?.length ? (
          <ol
            className="grid gap-4"
            aria-label={t("추가 요청 기록")}
          >
            {candidate.history.map(
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
              {candidate.content.title}
            </p>
            <MarkdownContent>
              {candidate.content.question.prompt}
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
      id="generate"
      className={
        props.embedded
          ? "flex min-h-0 flex-1 flex-col gap-6"
          : styles.stack
      }
      aria-label={t("생성 결과 상세")}
    >
      {!props.embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className={pageTitle}>{t("생성 결과")}</h1>
          <a
            className="text-sm font-semibold text-primary"
            href={`/quizzes/authoring?user=${encodeURIComponent(props.userId ?? "learner")}`}
          >
            {t("대화로 돌아가기")}
          </a>
        </div>
      )}
      {notice && (
        <p role="status" className="text-primary">
          {t(notice)}
        </p>
      )}
      <RequestError error={error} />
      {!!error && batch && (
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={reload}
          >
            {t("최신 후보 다시 불러오기")}
          </Button>
        </div>
      )}
      {allHandled && (
        <div className="flex shrink-0 justify-end">
          <a
            href={reviewHref}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-primary-edge bg-primary-solid px-4 py-2 text-sm font-semibold text-on-primary shadow-[0_3px_0_var(--color-primary-edge)]"
          >
            {t("검토·승인")}
          </a>
        </div>
      )}
      {batch && candidate && chatOpen && chatWorkspace}
      {batch && candidate && !chatOpen && (
        <section
          className={
            props.embedded
              ? "flex min-h-0 flex-1 flex-col"
              : styles.stack
          }
          aria-label={t("생성 후보")}
        >
          <Tabs
            label={t("퀴즈 선택")}
            items={tabLabels}
            value={tabLabels[selectedIndex]}
            disabled={busy}
            className={
              props.embedded
                ? "flex min-h-0 flex-1 flex-col [&_[role=tablist]]:shrink-0"
                : undefined
            }
            panelClassName={
              props.embedded
                ? "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
                : undefined
            }
            onChange={(label) =>
              setSelectedIndex(tabLabels.indexOf(label))
            }
          >
            <div className="grid min-w-0 gap-5">
              <div className="min-w-0">
                <Card
                  className="grid gap-6 text-foreground"
                  aria-label={t("버그리 응답")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs text-muted">
                        {t("문제")}
                        {selectedIndex + 1} /{" "}
                        {batch.candidates.length}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {candidate.content.title}
                      </h2>
                    </div>
                    <div className="ml-auto flex flex-wrap justify-end gap-1">
                      {!candidate.savedQuizId &&
                        ["직접 수정", "LLM으로 수정"].map(
                          (label) => (
                            <Button
                              key={t(label)}
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              aria-expanded={mode === label}
                              aria-controls={
                                label === "직접 수정"
                                  ? "candidate-editing"
                                  : undefined
                              }
                              onClick={() => {
                                const nextMode =
                                  mode === label
                                    ? "미리보기"
                                    : label;

                                setModes((current) => ({
                                  ...current,
                                  [selectedIndex]: nextMode,
                                }));
                                if (
                                  nextMode ===
                                    "직접 수정" &&
                                  !editing
                                )
                                  edit(candidate.content);
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
                        onClick={() => {
                          if (
                            !window.confirm(
                              t(
                                "“{0}” 퀴즈를 삭제할까요?{1}",
                                {
                                  0: candidate.content
                                    .title,
                                  1: candidate.savedQuizId
                                    ? t(
                                        " 저장하거나 공개한 퀴즈도 목록에서 사라집니다.",
                                      )
                                    : "",
                                },
                              ),
                            )
                          )
                            return;
                          deleteCurrent();
                        }}
                      >
                        {t("퀴즈 삭제")}
                      </Button>
                    </div>
                  </div>
                  {mode !== "직접 수정" && (
                    <ContentPreview
                      content={candidate.content}
                    />
                  )}
                  <div
                    id="candidate-editing"
                    className={
                      mode !== "미리보기" &&
                      !candidate.savedQuizId
                        ? "border-t border-line pt-5"
                        : undefined
                    }
                  >
                    <div className="grid min-w-0 gap-5">
                      {mode === "직접 수정" && editing ? (
                        <fieldset
                          disabled={busy}
                          className="min-w-0"
                        >
                          <ContentFields
                            content={editing}
                            source={batch.sourceContent}
                            showSource={false}
                            tags={tags.data ?? []}
                            errors={{}}
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
                              onClick={cancelEdit}
                            >
                              {t("수정 취소")}
                            </Button>
                          </div>
                        </fieldset>
                      ) : null}
                    </div>
                  </div>
                  {!editing &&
                    (candidate.savedQuizId ? (
                      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-3 text-xs text-muted">
                        <span>
                          {savedLabels[selectedIndex]}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            disabled={
                              busy || !!prompt.trim()
                            }
                            onClick={() =>
                              save(candidate.candidateId)
                            }
                          >
                            {t("임시저장")}
                          </Button>
                        </div>
                      </div>
                    ))}
                </Card>
              </div>
            </div>
          </Tabs>
        </section>
      )}
      {batch && !candidate && (
        <EmptyState
          title={t("남은 퀴즈가 없습니다")}
          description={t(
            "새 퀴즈를 만들면 다시 다듬을 수 있습니다.",
          )}
        />
      )}
    </section>
  );
}
