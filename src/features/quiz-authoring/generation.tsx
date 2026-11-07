"use client";

import { ContentFields } from "@/features/quiz-authoring/content-fields";
import { useAuthoringQuery } from "@/features/quiz-authoring/hooks/use-authoring-api";
import { Button, Card, TextField } from "@/components/ui";
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
  const {
    batch,
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
  const tags = useAuthoringQuery(
    props.api,
    props.userId ?? "learner",
    "discoverHashtags",
    {},
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
      <details className="rounded-2xl border border-line bg-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted">
          학습 내용
        </summary>
        <div className="mt-4">
          <MarkdownContent>
            {batch.sourceContent}
          </MarkdownContent>
        </div>
      </details>
      <RequestError error={error} />
      {!!error && batch && (
        <div>
          <Button
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
          <div
            className="flex flex-wrap gap-2"
            aria-label="퀴즈 선택"
          >
            {batch.candidates.map((item, index) => (
              <Button
                key={index}
                size="sm"
                variant={
                  selectedIndex === index
                    ? "primary"
                    : "secondary"
                }
                aria-pressed={selectedIndex === index}
                disabled={busy || !!editing}
                onClick={() => setSelectedIndex(index)}
              >
                퀴즈 {index + 1}
                {item.savedQuizId ? " · 저장됨" : ""}
              </Button>
            ))}
          </div>
          <div className="grid min-w-0 gap-5">
            <div className="min-w-0">
              <Card className="grid gap-4">
                <h2 className="text-lg">
                  {candidate.content.title}
                </h2>
                {editing ? (
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
                        onClick={applyEdit}
                        loading={busy}
                      >
                        수정 반영
                      </Button>
                      <Button
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
                {!candidate.savedQuizId && !editing && (
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() => edit(candidate.content)}
                  >
                    직접 수정
                  </Button>
                )}
                <div className={styles.actions}>
                  <Button
                    disabled={
                      busy ||
                      !!editing ||
                      !!candidate.savedQuizId ||
                      !!prompt.trim()
                    }
                    onClick={() =>
                      save(candidate.candidateId)
                    }
                  >
                    {candidate.savedQuizId
                      ? "저장 완료"
                      : "개별 저장"}
                  </Button>
                  {candidate.savedQuizId && (
                    <a
                      className="text-sm text-primary underline"
                      href={`${manageHref}&quiz=${encodeURIComponent(candidate.savedQuizId)}`}
                    >
                      검토·승인
                    </a>
                  )}
                </div>
              </Card>
            </div>
            <div className="min-w-0">
              <h2 className="mb-3 text-sm font-semibold">
                버그리와 대화
              </h2>
              {!candidate.history?.length && (
                <p className="text-sm text-muted">
                  어떤 부분을 바꿔볼까요?
                </p>
              )}
              {!!candidate.history?.length && (
                <ol
                  className="grid gap-3"
                  aria-label="추가 요청 기록"
                >
                  {candidate.history.map(
                    ({ prompt: sent, content }, index) => (
                      <li
                        key={index}
                        className="grid gap-2"
                      >
                        <p className="max-w-[90%] justify-self-end whitespace-pre-wrap break-words rounded-2xl bg-primary/10 px-4 py-3 text-sm">
                          {sent}
                        </p>
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
                      </li>
                    ),
                  )}
                </ol>
              )}
              {!candidate.savedQuizId && (
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
                      disabled={busy || !!editing}
                      onChange={(event) =>
                        changePrompt(event.target.value)
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    loading={busy}
                    disabled={!prompt.trim() || !!editing}
                  >
                    요청 보내기
                  </Button>
                </form>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              disabled={
                busy ||
                hasDrafts ||
                !!editing ||
                batch.candidates.every(
                  ({ savedQuizId }) => savedQuizId,
                )
              }
              onClick={() => save()}
            >
              남은 후보 모두 저장
            </Button>
            <Tooltip label="후보 저장 도움말">
              저장은 내 퀴즈에 추가합니다. 공개하려면 검토
              후 승인하세요.
            </Tooltip>
          </div>
        </section>
      )}
    </section>
  );
}
