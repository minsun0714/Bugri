"use client";

import { useEffect, useRef, useState } from "react";
import { QuizScope, QuizStatus } from "@/api/constants";
import { ContentFields } from "@/features/quiz-authoring/content-fields";
import { useAuthoringQuery } from "@/features/quiz-authoring/hooks/use-authoring-api";
import {
  Button,
  Card,
  TextArea,
  Tabs,
} from "@/components/ui";
import { MarkdownContent } from "@/features/quiz-authoring/markdown-content";
import { ContentPreview } from "@/features/quiz-authoring/content-preview";
import { RequestError } from "@/features/quiz-authoring/feedback";
import { styles } from "@/features/quiz-authoring/styles";
import {
  useGeneration,
  type GenerationProps,
} from "@/features/quiz-authoring/hooks/use-generation";

export function Generation(props: GenerationProps) {
  const [modes, setModes] = useState<
    Record<number, string>
  >({});
  const {
    batch,
    publish,
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

      if (!saved) return "상태 확인 중";
      if (saved.status === QuizStatus.PUBLIC)
        return "공개됨";
      if (saved.status === QuizStatus.PRIVATE)
        return "비공개";
      return "임시저장됨";
    },
  );
  const tabLabels = batch.candidates.map(
    (_, index) =>
      `퀴즈 ${index + 1}${savedLabels[index] ? ` · ${savedLabels[index]}` : ""}`,
  );
  const manageHref = `/quizzes/authoring/manage?user=${encodeURIComponent(props.userId ?? "learner")}`;
  const closeChat = () =>
    setModes((current) => ({
      ...current,
      [selectedIndex]: "미리보기",
    }));
  const chatWorkspace = candidate ? (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-label="버그리와 대화"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line pb-4">
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={closeChat}
        >
          <span aria-hidden="true">←</span>
          퀴즈로 돌아가기
        </Button>
        <div className="min-w-0 text-right">
          <p className="text-xs text-muted">
            퀴즈 {selectedIndex + 1}
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
        aria-label="대화 내용"
      >
        <div
          aria-label="첫 사용자 메시지"
          className="max-w-[90%] justify-self-end rounded-2xl bg-primary/10 px-5 py-4"
        >
          <span className="mb-2 block text-xs font-semibold text-muted">
            나
          </span>
          <MarkdownContent>
            {batch.sourceContent}
          </MarkdownContent>
        </div>

        {candidate.history?.length ? (
          <ol
            className="grid gap-4"
            aria-label="추가 요청 기록"
          >
            {candidate.history.map(
              ({ prompt: sent, content }, index) => (
                <li key={index} className="grid gap-3">
                  <p className="max-w-[90%] justify-self-end whitespace-pre-wrap break-words rounded-2xl bg-primary/10 px-4 py-3 text-sm">
                    {sent}
                  </p>
                  <div className="max-w-[90%] rounded-2xl border border-line bg-canvas px-5 py-4 text-sm">
                    <span className="mb-2 block text-xs font-semibold text-primary">
                      버그리
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
              버그리
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
            label={`퀴즈 ${selectedIndex + 1}에 추가 요청`}
            placeholder="예시를 추가해줘"
            value={prompt}
            disabled={busy}
            rows={2}
            limit={Number.POSITIVE_INFINITY}
            showCount={false}
            className="max-h-32 min-h-16 resize-none!"
            onChange={changePrompt}
          />
        </div>
        <Button
          size="sm"
          type="submit"
          loading={busy}
          disabled={!prompt.trim()}
        >
          요청 보내기
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
      aria-label="생성 결과 상세"
    >
      {!props.embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            생성 결과
          </h1>
          <a
            className="text-sm font-semibold text-primary"
            href={`/quizzes/authoring?user=${encodeURIComponent(props.userId ?? "learner")}`}
          >
            대화로 돌아가기
          </a>
        </div>
      )}
      {notice && (
        <p role="status" className="text-primary">
          {notice}
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
            최신 후보 다시 불러오기
          </Button>
        </div>
      )}
      {batch && candidate && chatOpen && chatWorkspace}
      {batch && candidate && !chatOpen && (
        <section
          className={`${styles.stack} ${props.embedded ? "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1" : ""}`}
          aria-label="생성 후보"
        >
          <Tabs
            label="퀴즈 선택"
            items={tabLabels}
            value={tabLabels[selectedIndex]}
            disabled={busy}
            onChange={(label) =>
              setSelectedIndex(tabLabels.indexOf(label))
            }
          >
            <div className="grid min-w-0 gap-5">
              <div className="min-w-0">
                <Card
                  className="grid gap-6 text-foreground"
                  aria-label="버그리 응답"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs text-muted">
                        문제 {selectedIndex + 1} /{" "}
                        {batch.candidates.length}
                      </p>
                      <h2 className="text-lg font-semibold">
                        {candidate.content.title}
                      </h2>
                    </div>
                    {!candidate.savedQuizId && (
                      <div className="ml-auto flex flex-wrap justify-end gap-1">
                        {["직접 수정", "LLM으로 수정"].map(
                          (label) => (
                            <Button
                              key={label}
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
                              {label}
                            </Button>
                          ),
                        )}
                      </div>
                    )}
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
                              수정 반영
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                            >
                              수정 취소
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
                        <a
                          className="font-semibold text-primary underline"
                          href={`${manageHref}&quiz=${encodeURIComponent(candidate.savedQuizId)}`}
                        >
                          검토·승인
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            disabled={
                              busy || !!prompt.trim()
                            }
                            onClick={publish}
                          >
                            바로 공개
                          </Button>
                        </div>
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
                            임시저장
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
    </section>
  );
}
