"use client";

import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";
import { Dropdown } from "@/components/ui/dropdown";
import { Tooltip } from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import {
  QuizStatus,
  type Hashtag,
  type ReviewQuiz,
  type Visibility,
} from "@/api/contracts";
import { Button, Card, TextField } from "@/components/ui";
import { ContentFields } from "@/features/quiz-authoring/content-fields";
import { ContentPreview } from "@/features/quiz-authoring/content-preview";
import { RequestError } from "@/features/quiz-authoring/feedback";
import {
  editableContent,
  validateEditor,
} from "@/features/quiz-authoring/validation";
import { leaveMessage } from "@/features/quiz-authoring/use-unsaved-warning";
import { styles } from "@/features/quiz-authoring/styles";

export function ReviewEditor({
  api: client,
  userId = "learner",
  initialQuiz,
  tags,
  onChanged,
  onDeleted,
  onDirty,
  onBusy = () => {},
}: {
  api: ApiClient;
  userId?: string;
  initialQuiz: ReviewQuiz;
  tags: Hashtag[];
  onChanged: () => void;
  onDeleted: () => void;
  onDirty: (dirty: boolean) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const api = useAuthoringActions(client, userId);
  const initialRevision = (initialQuiz.pending ??
    initialQuiz.active)!;
  const [quiz, setQuiz] = useState(initialQuiz);
  const [content, setContent] = useState(
    editableContent(initialRevision),
  );
  const [source, setSource] = useState(
    initialRevision.sourceContent,
  );
  const [prompt, setPrompt] = useState("");
  const [sentPrompt, setSentPrompt] = useState("");
  const [visibility, setVisibility] = useState<
    Visibility | ""
  >(
    initialQuiz.status === QuizStatus.PENDING
      ? ""
      : initialQuiz.status,
  );
  const [nextVisibility, setNextVisibility] =
    useState<Visibility>(
      initialQuiz.status === QuizStatus.PUBLIC
        ? QuizStatus.PRIVATE
        : QuizStatus.PUBLIC,
    );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});
  const [message, setMessage] = useState("");
  const locked = useRef(false);
  const saved = (quiz.pending ?? quiz.active)!;
  const edited =
    source !== saved.sourceContent ||
    JSON.stringify(content) !==
      JSON.stringify(editableContent(saved));
  const dirty = edited || prompt !== sentPrompt;
  const reviewed = !!quiz.pending?.reviewed && !edited;

  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);

  function accept(result: ReviewQuiz) {
    const revision = (result.pending ?? result.active)!;
    setQuiz(result);
    setContent(editableContent(revision));
    setSource(revision.sourceContent);
    setErrors({});
    if (result.status !== QuizStatus.PENDING)
      setVisibility(result.status);
    setNextVisibility(
      result.status === QuizStatus.PUBLIC
        ? QuizStatus.PRIVATE
        : QuizStatus.PUBLIC,
    );
    onChanged();
  }

  async function run(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    onBusy(true);
    setError(null);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setError(error);
    } finally {
      locked.current = false;
      setBusy(false);
      onBusy(false);
    }
  }

  const version = {
    quizId: quiz.quizId,
    expectedVersion: quiz.version,
  };

  function save() {
    const issues = validateEditor(content, source, tags);
    setErrors(issues);
    if (Object.keys(issues).length) {
      setError(new Error(Object.values(issues).join(" ")));
      return;
    }
    void run(async () => {
      accept(
        await api.request("updatePending", {
          ...version,
          action: "EDIT",
          sourceContent: source,
          content,
        }),
      );
      setMessage(
        "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
      );
    });
  }

  return (
    <section
      id="review"
      aria-label="퀴즈 검토"
      className={styles.stack}
    >
      <div>
        <h2 className="text-2xl">퀴즈 검토·수정</h2>
        <p className="mt-2 text-sm text-muted">
          현재 상태: {quiz.status} · 버전 {quiz.version}
        </p>
      </div>
      {quiz.active && (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <h3>현재 서비스 중인 버전</h3>
            <Tooltip label="수정본 승인 도움말">
              수정본을 승인하기 전까지 기존 퀴즈가
              유지됩니다.
            </Tooltip>
          </div>
          <p>
            {quiz.active.title} · {quiz.status}
          </p>
        </Card>
      )}
      <fieldset disabled={busy} className="min-w-0">
        <ContentFields
          content={content}
          source={source}
          tags={tags}
          errors={errors}
          onChange={setContent}
          onSource={setSource}
        />
      </fieldset>
      <div className={styles.actions}>
        <Button disabled={busy || !edited} onClick={save}>
          내용 저장
        </Button>
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => {
            if (dirty && !window.confirm(leaveMessage))
              return;
            void run(async () => {
              accept(
                await api.request("reviewQuiz", {
                  quizId: quiz.quizId,
                }),
              );
              setPrompt("");
              setSentPrompt("");
              setMessage("최신 내용을 불러왔습니다.");
            });
          }}
        >
          최신 내용 다시 불러오기
        </Button>
      </div>
      <RequestError error={error} />
      {message && (
        <p role="status" className="text-primary">
          {message}
        </p>
      )}
      {quiz.pending && (
        <Card className={styles.stack}>
          <h3 className="text-xl">저장된 내용 확인</h3>
          <h4>{quiz.pending.title}</h4>
          <details>
            <summary className="cursor-pointer text-primary">
              저장된 원본 학습 내용
            </summary>
            <pre className={styles.prose}>
              {quiz.pending.sourceContent}
            </pre>
          </details>
          <ContentPreview content={quiz.pending} />
          <p>
            {reviewed ? "검토 완료" : "검토 필요"}
            {edited
              ? " · 저장하지 않은 변경이 있습니다."
              : ""}
          </p>
          <div className={styles.actions}>
            <Button
              disabled={busy || edited || reviewed}
              onClick={() =>
                void run(async () => {
                  accept(
                    await api.request("updatePending", {
                      ...version,
                      action: "MARK_REVIEWED",
                    }),
                  );
                  setMessage(
                    "저장된 내용을 검토 완료했습니다.",
                  );
                })
              }
            >
              검토 완료 저장
            </Button>
          </div>
          <Dropdown
            label="승인 공개 범위"
            value={visibility}
            disabled={busy}
            options={[
              { value: "", label: "공개 범위 선택" },
              ...[
                {
                  value: QuizStatus.PRIVATE,
                  label: "나만 풀기",
                },
                { value: QuizStatus.PUBLIC, label: "공개" },
              ],
            ]}
            onValueChange={(value) =>
              setVisibility(value as Visibility | "")
            }
          />
          <p className="text-sm text-muted">
            승인 대상: {quiz.pending.title} ·{" "}
            {quiz.pending.hashtagIds
              .map((id) => `#${id}`)
              .join(" ") || "태그 없음"}{" "}
            · {visibility || "공개 범위 미선택"}
          </p>
          <div className={styles.actions}>
            <Button
              disabled={
                busy || dirty || !reviewed || !visibility
              }
              onClick={() =>
                void run(async () => {
                  if (!visibility) return;
                  accept(
                    await api.request("approve", {
                      ...version,
                      visibility,
                    }),
                  );
                  setMessage("승인했습니다.");
                })
              }
            >
              선택한 범위로 승인
            </Button>
          </div>
        </Card>
      )}
      <Card className={styles.stack}>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-xl">
            추가 프롬프트로 재생성
          </h3>
          <Tooltip label="재생성 도움말">
            저장된 내용으로 수정본을 만듭니다. 검토 후
            승인해야 반영됩니다.
          </Tooltip>
        </div>
        <TextField
          label="추가 프롬프트"
          value={prompt}
          disabled={busy}
          onChange={(event) =>
            setPrompt(event.target.value)
          }
        />
        <div className={styles.actions}>
          <Button
            disabled={busy || edited || !prompt.trim()}
            onClick={() =>
              void run(async () => {
                accept(
                  await api.request("regenerate", {
                    ...version,
                    prompt,
                  }),
                );
                setSentPrompt(prompt);
                setMessage(
                  "수정본을 생성했습니다. 내용을 검토하세요.",
                );
              })
            }
          >
            수정본 재생성
          </Button>
        </div>
      </Card>
      {quiz.active && (
        <Card className={styles.stack}>
          <h3 className="text-xl">현재 버전 공개 범위</h3>
          <Dropdown
            label="변경할 공개 범위"
            value={nextVisibility}
            disabled={busy || dirty}
            options={[
              {
                value: QuizStatus.PRIVATE,
                label: "나만 풀기",
              },
              { value: QuizStatus.PUBLIC, label: "공개" },
            ]}
            onValueChange={(value) =>
              setNextVisibility(value as Visibility)
            }
          />
          <div className={styles.actions}>
            <Button
              variant="secondary"
              disabled={
                busy ||
                dirty ||
                nextVisibility === quiz.status
              }
              onClick={() =>
                void run(async () => {
                  accept(
                    await api.request("visibility", {
                      ...version,
                      visibility: nextVisibility,
                    }),
                  );
                  setMessage("공개 범위를 변경했습니다.");
                })
              }
            >
              공개 범위 변경
            </Button>
          </div>
        </Card>
      )}
      <div className={styles.actions}>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => {
            if (
              !window.confirm(
                `“${saved.title}” 퀴즈를 삭제할까요?${dirty ? " 저장하지 않은 변경도 사라집니다." : ""} 완료한 풀이 기록과 보상은 유지됩니다.`,
              )
            )
              return;
            void run(async () => {
              await api.request("deleteQuiz", {
                quizId: quiz.quizId,
              });
              onDirty(false);
              onDeleted();
            });
          }}
        >
          퀴즈 삭제
        </Button>
      </div>
    </section>
  );
}
