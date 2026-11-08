"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { InputValidationError } from "@/api/errors";

import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";
import { Dropdown } from "@/components/ui/dropdown";
import { useEffect, useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import {
  QuizStatus,
  type Hashtag,
  type ReviewQuiz,
  type Visibility,
} from "@/api/contracts";
import {
  Button,
  Card,
  Modal,
  TextArea,
} from "@/components/ui";
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
  onBack,
  onChanged,
  onDeleted,
  onDirty,
  onBusy = () => {},
}: {
  api: ApiClient;
  userId?: string;
  initialQuiz: ReviewQuiz;
  tags: Hashtag[];
  onBack: () => void;
  onChanged: () => void;
  onDeleted: () => void;
  onDirty: (dirty: boolean) => void;
  onBusy?: (busy: boolean) => void;
}) {
  const t = useTranslation();

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
  const [editing, setEditing] = useState(false);
  const [regenerateOpen, setRegenerateOpen] =
    useState(false);
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
  const statusLabel = quiz.pending
    ? t("검토 중")
    : quiz.status === QuizStatus.PUBLIC
      ? t("전체 공개")
      : t("나만 보기");

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
      setError(
        new InputValidationError(
          Object.values(issues).join(" "),
        ),
      );
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
      setEditing(false);
      setMessage(
        "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
      );
    });
  }

  function cancelEditing() {
    setContent(editableContent(saved));
    setSource(saved.sourceContent);
    setErrors({});
    setEditing(false);
  }

  function reload() {
    if (dirty && !window.confirm(t(leaveMessage))) return;

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
  }

  function approvePending() {
    if (!visibility || !quiz.pending) return;

    void run(async () => {
      let approvalQuiz = quiz;

      if (!quiz.pending?.reviewed) {
        approvalQuiz = await api.request("updatePending", {
          quizId: quiz.quizId,
          expectedVersion: quiz.version,
          action: "MARK_REVIEWED",
        });
        accept(approvalQuiz);
      }

      accept(
        await api.request("approve", {
          quizId: approvalQuiz.quizId,
          expectedVersion: approvalQuiz.version,
          visibility,
        }),
      );
      setMessage(
        visibility === QuizStatus.PUBLIC
          ? "공개했습니다."
          : "나만 보기로 승인했습니다.",
      );
    });
  }

  return (
    <section
      id="review"
      aria-label={t("퀴즈 검토")}
      className={styles.stack}
    >
      <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-line bg-canvas/95 py-3 backdrop-blur-sm">
        <Button
          size="sm"
          variant="ghost"
          aria-label={t("내 퀴즈로 돌아가기")}
          disabled={busy}
          onClick={onBack}
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">
            {t("내 퀴즈")}
          </span>
        </Button>
        <div className="min-w-0">
          <p className="text-xs text-muted">
            {t("퀴즈 검토")}
          </p>
          <h2 className="truncate text-lg font-semibold">
            {saved.title}
          </h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          {statusLabel}
        </span>
      </header>
      <RequestError error={regenerateOpen ? null : error} />
      {message && (
        <p role="status" className="text-primary">
          {t(message)}
        </p>
      )}
      {!editing && quiz.active && quiz.pending && (
        <details className="rounded-surface border border-line bg-surface p-5">
          <summary className="cursor-pointer font-semibold text-primary">
            {t("현재 공개본과 비교")}
          </summary>
          <div className="mt-5 grid gap-5 border-t border-line pt-5">
            <h3 className="text-lg">{quiz.active.title}</h3>
            <ContentPreview content={quiz.active} />
          </div>
        </details>
      )}
      {editing ? (
        <div className="grid gap-4 pb-28">
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
          <div
            role="group"
            aria-label={t("편집 작업")}
            className="fixed inset-x-3 bottom-3 z-40 mx-auto flex w-[calc(100%-1.5rem)] max-w-3xl items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-xl backdrop-blur-sm sm:bottom-6 sm:w-[calc(100%-3rem)]"
          >
            <div className="flex min-w-0 items-center gap-1">
              <span className="min-w-0 truncate text-xs font-semibold text-muted">
                {edited
                  ? t("저장하지 않은 변경 있음")
                  : t("변경 사항 없음")}
              </span>
              <Button
                size="sm"
                variant="ghost"
                aria-label={t("최신 내용 다시 불러오기")}
                title={t(
                  "작성 중인 내용을 버리고 최신 저장본을 불러옵니다",
                )}
                disabled={busy}
                className="size-9 min-h-9! shrink-0 p-0!"
                onClick={reload}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 11a8 8 0 1 0-2.34 5.66" />
                  <path d="M20 4v7h-7" />
                </svg>
              </Button>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={cancelEditing}
              >
                {t("취소")}
              </Button>
              <Button
                disabled={busy || !edited}
                onClick={save}
              >
                {t("수정 저장")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card className={styles.stack}>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div
              role="group"
              aria-label={t("퀴즈 수정 방식")}
              className="flex flex-wrap justify-end gap-2"
            >
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => setEditing(true)}
              >
                {t("직접 수정")}
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setRegenerateOpen(true);
                }}
              >
                {t("추가 프롬프트로 재생성")}
              </Button>
            </div>
          </div>
          <details>
            <summary className="cursor-pointer text-primary">
              {t("원본 학습 내용")}
            </summary>
            <pre className={styles.prose}>
              {saved.sourceContent}
            </pre>
          </details>
          <ContentPreview content={saved} />
          {quiz.pending && (
            <div className="grid items-end gap-3 border-t border-line pt-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Dropdown
                label={t("승인 공개 범위")}
                value={visibility}
                disabled={busy}
                options={[
                  {
                    value: "",
                    label: t("공개 범위 선택"),
                  },
                  {
                    value: QuizStatus.PRIVATE,
                    label: t("나만 풀기"),
                  },
                  {
                    value: QuizStatus.PUBLIC,
                    label: t("공개"),
                  },
                ]}
                onValueChange={(value) =>
                  setVisibility(value as Visibility | "")
                }
              />
              <Button
                className="sm:min-w-28"
                disabled={busy || dirty || !visibility}
                onClick={approvePending}
              >
                {t("승인")}
              </Button>
            </div>
          )}
        </Card>
      )}
      {regenerateOpen && (
        <Modal
          open
          onClose={() => setRegenerateOpen(false)}
          title={t("추가 프롬프트로 재생성")}
        >
          <form
            className="grid gap-5"
            onSubmit={(event) => {
              event.preventDefault();

              void run(async () => {
                accept(
                  await api.request("regenerate", {
                    ...version,
                    prompt,
                  }),
                );
                setPrompt("");
                setSentPrompt("");
                setRegenerateOpen(false);
                setMessage(
                  "수정본을 생성했습니다. 내용을 검토하세요.",
                );
              });
            }}
          >
            <RequestError error={error} />
            <TextArea
              label={t("추가 프롬프트")}
              value={prompt}
              disabled={busy}
              rows={4}
              limit={Number.POSITIVE_INFINITY}
              showCount={false}
              placeholder={t(
                "바꾸고 싶은 내용을 입력하세요",
              )}
              onChange={setPrompt}
            />
            <div className={styles.actions}>
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => setRegenerateOpen(false)}
              >
                {t("취소")}
              </Button>
              <Button
                type="submit"
                disabled={busy || edited || !prompt.trim()}
                loading={busy}
              >
                {t("수정본 재생성")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {!editing && quiz.active && !quiz.pending && (
        <Card className={styles.stack}>
          <h3 className="text-xl">
            {t("현재 버전 공개 범위")}
          </h3>
          <Dropdown
            label={t("변경할 공개 범위")}
            value={nextVisibility}
            disabled={busy || dirty}
            options={[
              {
                value: QuizStatus.PRIVATE,
                label: t("나만 풀기"),
              },
              {
                value: QuizStatus.PUBLIC,
                label: t("공개"),
              },
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
              {t("공개 범위 변경")}
            </Button>
          </div>
        </Card>
      )}
      {!editing && (
        <section
          role="group"
          aria-label={t("위험 영역")}
          className="grid gap-4 rounded-2xl border border-coral/30 bg-coral/5 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5"
        >
          <div>
            <h3 className="font-semibold text-coral">
              {t("위험 영역")}
            </h3>
            <p className="mt-1 text-xs text-muted">
              {t(
                "삭제한 퀴즈는 목록과 학습 후보에서 사라집니다.",
              )}
            </p>
          </div>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              if (
                !window.confirm(
                  t(
                    "“{0}” 퀴즈를 삭제할까요?{1} 완료한 풀이 기록과 보상은 유지됩니다.",
                    {
                      0: saved.title,
                      1: dirty
                        ? t(
                            " 저장하지 않은 변경도 사라집니다.",
                          )
                        : "",
                    },
                  ),
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
            {t("퀴즈 삭제")}
          </Button>
        </section>
      )}
    </section>
  );
}
