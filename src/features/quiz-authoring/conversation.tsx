"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { ConversationRole } from "@/api/constants";
import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "@/components/ui";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Tooltip } from "@/components/ui/tooltip";
import { MarkdownContent } from "@/features/quiz-authoring/markdown-content";
import { RequestError } from "@/features/quiz-authoring/feedback";
import {
  useConversation,
  type ConversationProps,
} from "@/features/quiz-authoring/hooks/use-conversation";
import { styles } from "@/features/quiz-authoring/styles";
import { pageTitle } from "@/components/ui/styles";

export function Conversation(props: ConversationProps) {
  const t = useTranslation();

  const [open, setOpen] = useState(true);
  const {
    conversation,
    draft,
    changeDraft,
    busy,
    error,
    send,
    generate,
    reload,
  } = useConversation({
    ...props,
    onGenerated: (batch) => {
      setOpen(false);
      props.onGenerated(batch);
    },
  });

  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current: container } = messagesRef;
    if (open && container)
      container.scrollTop = container.scrollHeight;
  }, [open, conversation.messages.length]);

  return (
    <section
      id="generate"
      aria-label={t("학습 대화")}
      className={styles.stack}
    >
      <div className={styles.actions}>
        <h1 className={pageTitle}>{t("퀴즈 만들기")}</h1>
      </div>
      <div>
        <Button onClick={() => setOpen(true)}>
          {t("버그리와 대화하기")}
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("버그리와 퀴즈 만들기")}
        layout="conversation"
      >
        <div className="mb-3 flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted">Mock</span>
          <Tooltip label={t("대화 도움말")}>
            {t(
              "현재는 실제 AI 대신 준비된 예시 답변을 제공합니다. 비밀키·개인정보는 입력하지 마세요. 보낸 대화로 퀴즈를 만들며, 작성 중인 입력은 그대로 남습니다.",
            )}
          </Tooltip>
        </div>
        <div
          ref={messagesRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
          tabIndex={0}
          role="region"
          aria-label={t("대화 메시지")}
        >
          {!conversation.messages.length && (
            <p className="py-6 text-lg font-medium text-muted">
              {t("무엇을 배우고 있나요?")}
            </p>
          )}
          {!!conversation.messages.length && (
            <ol
              aria-label={t("대화 기록")}
              className="grid gap-5"
            >
              {conversation.messages.map(
                ({ messageId, role, content }) => (
                  <li
                    key={messageId}
                    className={
                      role === ConversationRole.USER
                        ? "w-fit max-w-[90%] justify-self-end rounded-2xl bg-primary/10 px-5 py-4"
                        : "min-w-0 rounded-surface border border-line bg-surface p-5"
                    }
                  >
                    <span className="mb-2 block text-xs font-semibold text-muted">
                      {role === ConversationRole.USER
                        ? t("나")
                        : t("버그리")}
                    </span>
                    <MarkdownContent>
                      {content}
                    </MarkdownContent>
                  </li>
                ),
              )}
            </ol>
          )}
        </div>
        <fieldset
          disabled={!!busy}
          className="mt-3 min-w-0 shrink-0 rounded-surface border border-line bg-surface p-3 [&_textarea]:h-24 [&_textarea]:min-h-0! [&_textarea]:max-h-[20dvh] [&_.markdown-preview]:max-h-[20dvh] [&_.markdown-preview]:overflow-y-auto"
        >
          <MarkdownEditor
            label={t("질문이나 학습 내용")}
            value={draft}
            preserveOverflow
            onChange={changeDraft}
            onKeyDown={(event) => {
              if (
                event.key !== "Enter" ||
                event.shiftKey ||
                event.nativeEvent.isComposing
              )
                return;

              event.preventDefault();
              if (!busy) send();
            }}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button
              onClick={send}
              loading={busy === "message"}
            >
              {t("보내기")}
            </Button>
            <Button
              variant="secondary"
              disabled={!conversation.messages.length}
              loading={busy === "generate"}
              onClick={generate}
            >
              {t("이 대화로 퀴즈 만들기")}
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
              {t("최신 대화 불러오기")}
            </Button>
          </div>
        )}
        {busy && (
          <p role="status" className="text-sm text-primary">
            {busy === "generate"
              ? t("퀴즈를 만들고 있어요…")
              : busy === "message"
                ? t("답변을 준비하고 있어요…")
                : t("대화를 불러오는 중…")}
          </p>
        )}
      </Modal>
    </section>
  );
}
