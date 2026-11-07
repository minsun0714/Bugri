"use client";

import { useState } from "react";
import { ContentFields } from "@/features/quiz-authoring/content-fields";
import { useAuthoringQuery } from "@/features/quiz-authoring/hooks/use-authoring-api";
import {
  Button,
  Card,
  TextField,
  Tabs,
} from "@/components/ui";
import { Tooltip } from "@/components/ui/tooltip";
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
    hasDrafts,
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
  const tags = useAuthoringQuery(
    props.api,
    props.userId ?? "learner",
    "discoverHashtags",
    {},
  );
  const tabLabels = batch.candidates.map(
    ({ savedQuizId }, index) =>
      `퀴즈 ${index + 1}${savedQuizId ? " · 저장됨" : ""}`,
  );
  const manageHref = `/quizzes/authoring/manage?user=${encodeURIComponent(props.userId ?? "learner")}`;

  return (
    <section
      id="generate"
      className={styles.stack}
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
        <div>
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
      {batch && candidate && (
        <section
          className={styles.stack}
          aria-label="생성 후보"
        >
          {!editing && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-muted">
              <span>
                {
                  batch.candidates.filter(
                    ({ savedQuizId }) => savedQuizId,
                  ).length
                }{" "}
                / {batch.candidates.length}개 저장됨
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={
                  busy ||
                  hasDrafts ||
                  batch.candidates.every(
                    ({ savedQuizId }) => !!savedQuizId,
                  )
                }
                onClick={() => save()}
              >
                남은 후보 모두 저장
              </Button>
            </div>
          )}
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
                  </div>
                  {editing && mode !== "직접 수정" && (
                    <p
                      role="status"
                      className="text-xs text-muted"
                    >
                      직접 수정한 내용이 아직 반영되지
                      않았습니다.
                    </p>
                  )}
                  <Tabs
                    label="수정 방식"
                    items={
                      candidate.savedQuizId
                        ? ["미리보기"]
                        : [
                            "미리보기",
                            "직접 수정",
                            "LLM으로 수정",
                          ]
                    }
                    value={
                      candidate.savedQuizId
                        ? "미리보기"
                        : mode
                    }
                    disabled={busy}
                    onChange={(nextMode) => {
                      setModes((current) => ({
                        ...current,
                        [selectedIndex]: nextMode,
                      }));
                      if (
                        nextMode === "직접 수정" &&
                        !editing
                      )
                        edit(candidate.content);
                    }}
                  >
                    <div className="grid min-w-0 gap-5">
                      {chatOpen &&
                        !candidate.savedQuizId && (
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
                        )}
                      {chatOpen &&
                        !candidate.savedQuizId &&
                        !!candidate.history?.length && (
                          <ol
                            className="grid gap-3"
                            aria-label="추가 요청 기록"
                          >
                            {candidate.history.map(
                              (
                                { prompt: sent, content },
                                index,
                              ) => (
                                <li
                                  key={index}
                                  className="grid gap-2"
                                >
                                  <p className="max-w-[90%] justify-self-end whitespace-pre-wrap break-words rounded-2xl bg-primary/10 px-4 py-3 text-sm">
                                    {sent}
                                  </p>
                                  {index <
                                    candidate.history!
                                      .length -
                                      1 && (
                                    <details className="text-sm text-muted">
                                      <summary className="cursor-pointer">
                                        응답 {index + 1} ·{" "}
                                        {content.title}
                                      </summary>
                                      <div className="mt-3">
                                        <ContentPreview
                                          content={content}
                                        />
                                      </div>
                                    </details>
                                  )}
                                </li>
                              ),
                            )}
                          </ol>
                        )}

                      <div className="min-w-0">
                        {chatOpen &&
                          !candidate.savedQuizId && (
                            <form
                              className="flex flex-wrap items-end gap-3 rounded-2xl border border-primary/20 bg-surface p-4"
                              onSubmit={(event) => {
                                event.preventDefault();
                                refine();
                              }}
                            >
                              <div className="min-w-0 flex-1">
                                <TextField
                                  label={`퀴즈 ${selectedIndex + 1}에 추가 요청`}
                                  placeholder="예시를 추가해줘"
                                  value={prompt}
                                  disabled={
                                    busy || !!editing
                                  }
                                  onChange={(event) =>
                                    changePrompt(
                                      event.target.value,
                                    )
                                  }
                                />
                              </div>
                              <Button
                                size="sm"
                                type="submit"
                                loading={busy}
                                disabled={
                                  !prompt.trim() ||
                                  !!editing
                                }
                              >
                                요청 보내기
                              </Button>
                            </form>
                          )}
                      </div>
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
                          <div className="mt-4 flex gap-3">
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
                      ) : (
                        <ContentPreview
                          content={candidate.content}
                        />
                      )}
                    </div>
                  </Tabs>
                  {!editing &&
                    (candidate.savedQuizId ? (
                      <div className="flex items-center gap-3 border-t border-line pt-3 text-xs text-muted">
                        <span>저장 완료</span>
                        <a
                          className="font-semibold text-primary underline"
                          href={`${manageHref}&quiz=${encodeURIComponent(candidate.savedQuizId)}`}
                        >
                          검토·승인
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
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
                          <Tooltip label="바로 공개 도움말">
                            현재 퀴즈의
                            문제·정답·해설·태그를 확인했다는
                            뜻으로, 이 퀴즈 한 개를 저장하고
                            모두에게 공개합니다.
                          </Tooltip>
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
                          <Tooltip label="저장 도움말">
                            공개하지 않고 검토할 퀴즈로
                            저장합니다.
                          </Tooltip>
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
