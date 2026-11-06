"use client";

import { Button, Card, TextField } from "@/components/ui";
import { Tooltip } from "@/components/ui/tooltip";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { ContentPreview } from "@/features/quiz-authoring/content-preview";
import { RequestError } from "@/features/quiz-authoring/feedback";
import { styles } from "@/features/quiz-authoring/styles";
import {
  useGeneration,
  type GenerationProps,
} from "@/features/quiz-authoring/hooks/use-generation";

export function Generation(props: GenerationProps) {
  const {
    source,
    batch,
    candidate,
    selectedIndex,
    setSelectedIndex,
    prompt,
    changeSource,
    changePrompt,
    error,
    busy,
    generate,
    refine,
    reload,
    save,
  } = useGeneration(props);
  const editor = (
    <fieldset disabled={busy} className="min-w-0">
      <MarkdownEditor
        value={source}
        preserveOverflow
        onChange={changeSource}
      />
      <div className="mt-4">
        <Button loading={busy} onClick={generate}>
          퀴즈 생성
        </Button>
      </div>
    </fieldset>
  );
  const manageHref = `/quizzes/authoring/manage?user=${encodeURIComponent(props.userId ?? "learner")}`;

  return (
    <section
      id="generate"
      className={styles.stack}
      aria-label="퀴즈 생성"
    >
      <div className={styles.actions}>
        <h1 className="text-xl font-semibold tracking-tight">
          퀴즈 만들기
        </h1>
        <span className="text-xs text-muted">Mock</span>
        <Tooltip label="퀴즈 생성 도움말">
          실제 AI 대신 예시 퀴즈 4개로 대화를 체험합니다.
          비밀키·개인정보는 입력하지 마세요. 결과는 이
          브라우저에만 저장됩니다.
        </Tooltip>
      </div>
      {batch ? (
        <details className="rounded-2xl border border-line bg-surface p-4">
          <summary className="cursor-pointer text-sm font-semibold text-muted">
            학습 내용
          </summary>
          <div className="mt-4">{editor}</div>
        </details>
      ) : (
        editor
      )}
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
                disabled={busy}
                onClick={() => setSelectedIndex(index)}
              >
                퀴즈 {index + 1}
                {item.savedQuizId ? " · 저장됨" : ""}
              </Button>
            ))}
          </div>
          {!!candidate.history?.length && (
            <ol
              className="grid gap-3"
              aria-label="추가 요청 기록"
            >
              {candidate.history.map(
                ({ prompt: sent, content }, index) => (
                  <li key={index} className="grid gap-2">
                    <p className="max-w-[90%] justify-self-end whitespace-pre-wrap break-words rounded-2xl bg-primary/10 px-4 py-3 text-sm">
                      {sent}
                    </p>
                    <details className="text-sm text-muted">
                      <summary className="cursor-pointer">
                        응답 {index + 1} · {content.title}
                      </summary>
                      <div className="mt-3">
                        <ContentPreview content={content} />
                      </div>
                    </details>
                  </li>
                ),
              )}
            </ol>
          )}
          <Card className="grid gap-4">
            <h2 className="text-lg">
              {candidate.content.title}
            </h2>
            <ContentPreview content={candidate.content} />
            <div className={styles.actions}>
              <Button
                disabled={
                  busy ||
                  !!candidate.savedQuizId ||
                  !!prompt.trim()
                }
                onClick={() => save(candidate.candidateId)}
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
                  disabled={busy}
                  onChange={(event) =>
                    changePrompt(event.target.value)
                  }
                />
              </div>
              <Button
                type="submit"
                loading={busy}
                disabled={
                  !prompt.trim() ||
                  source !== batch.sourceContent
                }
              >
                요청 보내기
              </Button>
            </form>
          )}
          <div className={styles.actions}>
            <Button
              variant="secondary"
              disabled={
                busy ||
                !!prompt.trim() ||
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
