import { useRef, useState } from "react";
import type { ApiClient } from "@/api/client";
import { QuizStatus } from "@/api/constants";
import { InputValidationError } from "@/api/errors";
import type {
  Hashtag,
  QuizContent,
  ReviewQuiz,
} from "@/api/contracts";
import {
  editableContent,
  validateEditor,
} from "@/features/quiz-authoring/validation";

export interface QuizWorkProps {
  api: ApiClient;
  noteId: string;
  tags: Hashtag[];
  initialQuizzes: ReviewQuiz[];
  /** Tab to show first, e.g. the first quiz of a new generation. */
  initialQuizId?: string;
  /** Called after every server change so note counts can refresh. */
  onChanged: () => void;
  onDirty?: (dirty: boolean) => void;
}

const isPending = ({ status }: ReviewQuiz) =>
  status === QuizStatus.PENDING;

function discard<T>(
  record: Record<string, T>,
  quizId: string,
) {
  return Object.fromEntries(
    Object.entries(record).filter(([id]) => id !== quizId),
  );
}

/** State for the PENDING quiz work modal. Saved tabs stay visible as "saved" until the modal closes. */
export function useQuizWork({
  api,
  noteId,
  tags,
  initialQuizzes,
  initialQuizId,
  onChanged,
  onDirty = () => {},
}: QuizWorkProps) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);

  const [selectedId, setSelectedId] = useState(
    initialQuizId ?? initialQuizzes[0]?.quizId ?? "",
  );

  const [prompts, setPrompts] = useState<
    Record<string, string>
  >({});

  const [edits, setEdits] = useState<
    Record<string, QuizContent>
  >({});

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [notice, setNotice] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const locked = useRef(false);

  const quiz =
    quizzes.find(({ quizId }) => quizId === selectedId) ??
    quizzes[0];

  const selectedIndex = quiz ? quizzes.indexOf(quiz) : 0;
  const editing = quiz
    ? (edits[quiz.quizId] ?? null)
    : null;
  const prompt = quiz ? (prompts[quiz.quizId] ?? "") : "";

  const hasDraft = (quizId: string) =>
    quizId in edits || !!prompts[quizId]?.trim();

  const pending = quizzes.filter(isPending);

  /** Quizzes still PENDING that have an unapplied edit or follow-up request. */
  const draftCount = pending.filter(({ quizId }) =>
    hasDraft(quizId),
  ).length;

  function report(
    nextEdits: Record<string, QuizContent>,
    nextPrompts: Record<string, string>,
  ) {
    onDirty(
      Object.keys(nextEdits).length > 0 ||
        Object.values(nextPrompts).some(
          (value) => !!value.trim(),
        ),
    );
  }

  function replace(result: ReviewQuiz) {
    setQuizzes((current) =>
      current.map((item) =>
        item.quizId === result.quizId ? result : item,
      ),
    );

    onChanged();
  }

  async function run(action: () => Promise<void>) {
    if (locked.current) return;

    locked.current = true;
    setBusy(true);
    setError(null);
    setNotice("");

    try {
      await action();
    } catch (failure) {
      setError(failure);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  function changePrompt(value: string) {
    if (!quiz) return;

    const next = { ...prompts, [quiz.quizId]: value };

    setPrompts(next);
    report(edits, next);
  }

  function edit(content: QuizContent) {
    if (!quiz) return;

    const next = { ...edits, [quiz.quizId]: content };

    setEdits(next);
    report(next, prompts);
  }

  function cancelEdit() {
    if (!quiz) return;

    const next = discard(edits, quiz.quizId);

    setEdits(next);
    setErrors({});
    report(next, prompts);
  }

  function applyEdit() {
    if (!quiz || !editing) return;

    const { quizId, version, revision } = quiz;

    const issues = validateEditor(
      editing,
      revision.sourceContent,
      tags,
    );

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
      replace(
        await api.request("updateQuiz", {
          quizId,
          expectedVersion: version,
          content: editing,
        }),
      );

      const next = discard(edits, quizId);

      setEdits(next);
      report(next, prompts);
    });
  }

  function refine() {
    if (!quiz || !isPending(quiz) || !prompt.trim()) return;

    const { quizId, version } = quiz;

    void run(async () => {
      replace(
        await api.request("refineQuiz", {
          quizId,
          expectedVersion: version,
          prompt,
        }),
      );

      const next = { ...prompts, [quizId]: "" };

      setPrompts(next);
      report(edits, next);
    });
  }

  function remove() {
    if (!quiz) return;

    const { quizId } = quiz;

    void run(async () => {
      await api.request("deleteQuiz", { quizId });

      const next = quizzes.filter(
        (item) => item.quizId !== quizId,
      );

      const nextEdits = discard(edits, quizId);
      const nextPrompts = discard(prompts, quizId);

      setQuizzes(next);
      setEdits(nextEdits);
      setPrompts(nextPrompts);

      setSelectedId(
        next[Math.min(selectedIndex, next.length - 1)]
          ?.quizId ?? "",
      );

      setNotice("퀴즈를 삭제했습니다.");
      report(nextEdits, nextPrompts);
      onChanged();
    });
  }

  function save() {
    if (!quiz || !isPending(quiz) || hasDraft(quiz.quizId))
      return;

    const { quizId, version } = quiz;

    void run(async () => {
      replace(
        await api.request("confirmQuiz", {
          quizId,
          expectedVersion: version,
        }),
      );

      setNotice("저장했어요");
    });
  }

  function saveAll() {
    if (!pending.length || draftCount > 0) return;

    void run(async () => {
      const saved = await api.request(
        "confirmNoteQuizzes",
        { noteId },
      );

      setQuizzes((current) =>
        current.map(
          (item) =>
            saved.find(
              ({ quizId }) => quizId === item.quizId,
            ) ?? item,
        ),
      );

      setNotice("남은 퀴즈를 모두 저장했어요");
      onChanged();
    });
  }

  /** Pull the latest PENDING quizzes after a conflict. Saved tabs and drafts of surviving quizzes stay. */
  function reload() {
    void run(async () => {
      const fresh = await api.request("noteQuizzes", {
        noteId,
        status: QuizStatus.PENDING,
      });

      setQuizzes((current) => [
        ...current.filter((item) => !isPending(item)),
        ...fresh,
      ]);

      const ids = new Set(
        fresh.map(({ quizId }) => quizId),
      );

      const keep = <T>(record: Record<string, T>) =>
        Object.fromEntries(
          Object.entries(record).filter(([quizId]) =>
            ids.has(quizId),
          ),
        );

      setEdits(keep(edits));
      setPrompts(keep(prompts));
      setErrors({});
    });
  }

  return {
    quizzes,
    quiz,
    selectedIndex,
    select: (index: number) =>
      setSelectedId(quizzes[index]?.quizId ?? ""),
    pendingCount: pending.length,
    draftCount,
    hasDraft: quiz ? hasDraft(quiz.quizId) : false,
    editing,
    startContent: quiz
      ? editableContent(quiz.revision)
      : null,
    errors,
    prompt,
    notice,
    error,
    busy,
    changePrompt,
    edit,
    cancelEdit,
    applyEdit,
    refine,
    remove,
    save,
    saveAll,
    reload,
  };
}
