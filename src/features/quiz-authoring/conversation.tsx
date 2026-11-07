"use client";

import { ConversationRole } from "@/api/constants";
import { Button } from "@/components/ui";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Tooltip } from "@/components/ui/tooltip";
import { MarkdownContent } from "@/features/quiz-authoring/markdown-content";
import { RequestError } from "@/features/quiz-authoring/feedback";
import {
  useConversation,
  type ConversationProps,
} from "@/features/quiz-authoring/hooks/use-conversation";
import { styles } from "@/features/quiz-authoring/styles";

export function Conversation(props: ConversationProps) {
  const {
    conversation,
    draft,
    changeDraft,
    busy,
    error,
    send,
    generate,
    reload,
  } = useConversation(props);

  return (
    <section
      id="generate"
      aria-label="학습 대화"
      className={styles.stack}
    >
      <div className={styles.actions}>
        <h1 className="text-xl font-semibold tracking-tight">
          퀴즈 만들기
        </h1>
        <span className="text-xs text-muted">Mock</span>
        <Tooltip label="대화 도움말">
          현재는 실제 AI 대신 준비된 예시 답변을 제공합니다.
          비밀키·개인정보는 입력하지 마세요. 보낸 대화로
          퀴즈를 만들며, 작성 중인 입력은 그대로 남습니다.
        </Tooltip>
      </div>
      {!conversation.messages.length && (
        <p className="py-6 text-lg font-medium text-muted">
          무엇을 배우고 있나요?
        </p>
      )}
      {!!conversation.messages.length && (
        <ol aria-label="대화 기록" className="grid gap-5">
          {conversation.messages.map(
            ({ messageId, role, content }) => (
              <li
                key={messageId}
                className={
                  role === ConversationRole.USER
                    ? "w-fit max-w-[90%] justify-self-end rounded-2xl bg-primary/10 px-5 py-4"
                    : "min-w-0 rounded-2xl border border-line bg-surface p-5"
                }
              >
                <span className="mb-2 block text-xs font-semibold text-muted">
                  {role === ConversationRole.USER
                    ? "나"
                    : "버그리"}
                </span>
                <MarkdownContent>{content}</MarkdownContent>
              </li>
            ),
          )}
        </ol>
      )}
      <fieldset
        disabled={!!busy}
        className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5"
      >
        <MarkdownEditor
          label="질문이나 학습 내용"
          value={draft}
          preserveOverflow
          onChange={changeDraft}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            onClick={send}
            loading={busy === "message"}
          >
            보내기
          </Button>
          <Button
            variant="secondary"
            disabled={!conversation.messages.length}
            loading={busy === "generate"}
            onClick={generate}
          >
            이 대화로 퀴즈 만들기
          </Button>
        </div>
      </fieldset>
      <RequestError error={error} />
      {!!error && (
        <div>
          <Button
            variant="ghost"
            disabled={!!busy}
            onClick={reload}
          >
            최신 대화 불러오기
          </Button>
        </div>
      )}
      {busy && (
        <p role="status" className="text-sm text-primary">
          {busy === "generate"
            ? "퀴즈를 만들고 있어요…"
            : busy === "message"
              ? "답변을 준비하고 있어요…"
              : "대화를 불러오는 중…"}
        </p>
      )}
    </section>
  );
}
