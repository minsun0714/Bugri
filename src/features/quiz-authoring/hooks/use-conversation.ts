import { InputValidationError } from "@/api/errors";
import { useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import type {
  AuthoringConversation,
  GenerationBatch,
} from "@/api/contracts";
import { useAuthoringActions } from "@/features/quiz-authoring/hooks/use-authoring-api";

export interface ConversationProps {
  api: ApiClient;
  userId: string;
  initialConversation: AuthoringConversation;
  onGenerated: (batch: GenerationBatch) => void;
  onDirty: (dirty: boolean) => void;
}

export function useConversation({
  api: client,
  userId,
  initialConversation,
  onGenerated,
  onDirty,
}: ConversationProps) {
  const api = useAuthoringActions(client, userId);
  const [conversation, setConversation] = useState(
    initialConversation,
  );
  const [draft, setDraft] = useState(
    initialConversation.draft,
  );
  const [busy, setBusy] = useState<
    "message" | "generate" | "reload" | null
  >(null);
  const [error, setError] = useState<unknown>(null);
  const locked = useRef(false);

  function changeDraft(value: string) {
    setDraft(value);
    onDirty(value !== conversation.draft);
  }

  async function run(
    kind: NonNullable<typeof busy>,
    action: () => Promise<void>,
  ) {
    if (locked.current) return;
    locked.current = true;
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (error) {
      setError(error);
    } finally {
      locked.current = false;
      setBusy(null);
    }
  }

  function send() {
    if (!draft.trim()) {
      setError(
        new InputValidationError(
          "질문이나 학습 내용을 입력하세요.",
        ),
      );
      return;
    }
    if ([...draft].length > 10000) {
      setError(
        new InputValidationError(
          "입력은 최대 10,000자입니다.",
        ),
      );
      return;
    }
    void run("message", async () => {
      const result = await api.request(
        "sendAuthoringMessage",
        {
          content: draft,
          expectedVersion: conversation.version,
        },
      );
      setConversation(result);
      setDraft("");
      onDirty(false);
    });
  }

  function generate() {
    if (!conversation.messages.length) return;
    void run("generate", async () => {
      const result = await api.request(
        "generateFromConversation",
        { draft, expectedVersion: conversation.version },
      );
      setConversation(result.conversation);
      onDirty(false);
      onGenerated(result.batch);
    });
  }

  function reload() {
    void run("reload", async () => {
      const result = await api.request(
        "authoringConversation",
        {},
      );
      setConversation(result);
      onDirty(draft !== result.draft);
    });
  }

  return {
    conversation,
    draft,
    changeDraft,
    busy,
    error,
    send,
    generate,
    reload,
  };
}
