import { AttemptHistoryFilter } from "@/api/constants";
import {
  historyQueryMaxLength,
  historyQueryWords,
  matchHistoryRecord,
} from "@/services/history-search";
import { matchNote } from "@/services/note-search";

import { QuizStatus } from "@/api/constants";
import type {
  ApiOperations,
  AttemptView,
  Note,
  NoteQuizCounts,
  NoteSummary,
  Operation,
  QuizContent,
  ReviewQuiz,
} from "@/api/contracts";

import { hashtags } from "@/mocks/users";

import type {
  StoredAttempt,
  StoredNote,
  StoredQuiz,
  UserState,
} from "@/services/state";
import {
  dailyQuizCounts,
  localDate,
  streak,
} from "@/services/learning";
import {
  isCorrect,
  keys,
  object,
  requireValue,
  ServiceError,
  source,
  text,
  validateAnswer,
  validateContent,
} from "@/services/validation";

export interface GeneratorInput {
  sourceContent: string;
  current?: QuizContent;
  prompt?: string;
}

/** Synchronous mock generator. Never calls a provider or executes code. */
export type MockGenerator = (
  input: GeneratorInput,
) => unknown;

export interface ServiceContext {
  state: UserState;
  allQuizzes: StoredQuiz[];
  allStates: UserState[];
  unavailableUserIds?: string[];
  now: Date;
  id: () => string;
  generate: MockGenerator;
}

const tagIds = hashtags.map(({ id }) => id);

const allowed: Record<Operation, string[]> = {
  generate: ["noteId"],
  notes: [
    "page",
    "pageSize",
    "query",
    "tagIds",
    "untagged",
    "hasPending",
  ],
  noteTags: [],
  note: ["noteId"],
  createNote: ["content"],
  updateNote: ["noteId", "content", "expectedVersion"],
  deleteNote: ["noteId"],
  noteQuizzes: ["noteId", "status"],
  reviewQuiz: ["quizId"],
  updateQuiz: ["quizId", "expectedVersion", "content"],
  refineQuiz: ["quizId", "expectedVersion", "prompt"],
  confirmQuiz: ["quizId", "expectedVersion"],
  confirmNoteQuizzes: ["noteId"],
  deleteQuiz: ["quizId"],
  hashtags: [],
  learningDay: [],
  learningTimezone: [],
  attemptHistory: ["filter", "query", "page", "pageSize"],
  startAttempt: ["quizId", "context"],
  attempt: ["attemptId"],
  answer: ["attemptId", "answer"],
};

function quizReview(quiz: StoredQuiz): ReviewQuiz {
  const { deletedAt, ...view } = quiz;

  void deletedAt;

  return view;
}

export function execute<K extends Operation>(
  operation: K,
  input: ApiOperations[K]["request"],
  ctx: ServiceContext,
): unknown {
  object(input);

  requireValue(
    operation in allowed,
    "알 수 없는 요청입니다.",
  );

  keys(input, allowed[operation]);

  const r = input as Record<string, unknown>;

  const { state: s, now, id, allQuizzes } = ctx;

  const timestamp = now.toISOString();

  const ownQuiz = (includeDeleted = false) => {
    text(r.quizId, "quizId");

    const q = allQuizzes.find((q) => q.quizId === r.quizId);

    if (!q || (!includeDeleted && q.deletedAt))
      throw new ServiceError(
        "NOT_FOUND",
        "퀴즈를 찾을 수 없습니다.",
        404,
      );

    if (q.ownerUserId !== s.userId)
      throw new ServiceError(
        "FORBIDDEN",
        "작성자만 접근할 수 있습니다.",
        403,
      );

    return q;
  };

  const version = ({
    version: currentVersion,
  }: StoredQuiz) => {
    requireValue(
      Number.isInteger(r.expectedVersion),
      "버전이 필요합니다.",
    );

    if (r.expectedVersion !== currentVersion)
      throw new ServiceError(
        "VERSION_CONFLICT",
        "최신 내용을 다시 확인하세요.",
        409,
      );
  };

  const touch = (q: StoredQuiz) => {
    q.version++;
    q.updatedAt = timestamp;
  };

  const available = (q: StoredQuiz | undefined) =>
    !!q &&
    !q.deletedAt &&
    q.status === QuizStatus.CONFIRMED &&
    q.ownerUserId === s.userId;

  const attemptView = ({
    attemptId,
    quizId,
    revision,
    completedAt,
    learningDate,
    timeZone,
    correct,
    submittedAnswer,
  }: StoredAttempt): AttemptView => {
    const q = allQuizzes.find(
      ({ quizId: currentQuizId }) =>
        currentQuizId === quizId,
    );

    const visible = available(q);
    const { revisionId, answer, explanation } = revision;

    return {
      attemptId,
      quizId,
      revisionId,
      quiz: visible
        ? {
            quizId,
            ownerUserId: q!.ownerUserId,
            revisionId,
            title: revision.title ?? "",
            question: revision.question,
            hashtagIds: revision.hashtagIds,
          }
        : null,
      completedAt,
      learningDate,
      timeZone,
      correct,
      result:
        visible && completedAt
          ? {
              submittedAnswer: submittedAnswer ?? null,
              correct,
              answer: answer ?? null,
              explanation: explanation ?? null,
            }
          : null,
    };
  };

  const getAttempt = () => {
    text(r.attemptId, "attemptId");

    const a = s.attempts.find(
      (a) => a.attemptId === r.attemptId,
    );

    if (!a)
      throw new ServiceError(
        "NOT_FOUND",
        "풀이를 찾을 수 없습니다.",
        404,
      );

    return a;
  };

  const generate = (
    input: GeneratorInput,
    single = false,
  ): QuizContent[] => {
    try {
      const output = ctx.generate(input);

      requireValue(
        Array.isArray(output) &&
          output.length >= 1 &&
          output.length <= 5 &&
          (!single || output.length === 1),
        "생성 결과는 독립 퀴즈 1~5개여야 합니다.",
      );

      output.forEach((content) =>
        validateContent(content, tagIds),
      );

      return output;
    } catch {
      throw new ServiceError(
        "GENERATION_FAILED",
        "Mock 생성 결과 검증에 실패했습니다. 입력을 유지하고 다시 시도하세요.",
        502,
      );
    }
  };

  const noteSummaryLength = 200;

  const findNote = (includeDeleted = false) => {
    text(r.noteId, "noteId");

    // Only the actor's own snapshot is searched, so another user's note is indistinguishable from a missing one.
    const found = s.notes.find(
      ({ noteId }) => noteId === r.noteId,
    );

    if (!found || (!includeDeleted && found.deletedAt))
      throw new ServiceError(
        "NOT_FOUND",
        "메모를 찾을 수 없습니다.",
        404,
      );

    return found;
  };

  const liveQuizzes = (noteId: string) =>
    s.quizzes.filter(
      (quiz) => quiz.noteId === noteId && !quiz.deletedAt,
    );

  const noteCounts = (noteId: string): NoteQuizCounts => {
    const linked = liveQuizzes(noteId);

    const confirmed = linked.filter(
      ({ status }) => status === QuizStatus.CONFIRMED,
    );

    return {
      confirmedCount: confirmed.length,
      pendingCount: linked.length - confirmed.length,
      hashtagIds: [
        ...new Set(
          confirmed.flatMap(
            ({ revision: { hashtagIds } }) => hashtagIds,
          ),
        ),
      ],
    };
  };

  const publicNote = ({
    noteId,
    content,
    version,
    createdAt,
    updatedAt,
  }: StoredNote): Note => ({
    noteId,
    content,
    version,
    createdAt,
    updatedAt,
    ...noteCounts(noteId),
  });

  const newRevision = (
    content: QuizContent,
    { sourceContent }: StoredQuiz["revision"],
  ) => ({
    ...content,
    revisionId: id(),
    sourceContent,
  });

  const confirm = (quiz: StoredQuiz) => {
    quiz.status = QuizStatus.CONFIRMED;
    quiz.confirmedAt = timestamp;
    touch(quiz);
  };

  switch (operation) {
    case "notes": {
      const {
        page = 1,
        pageSize = 20,
        query = "",
        tagIds: selectedTags = [],
        untagged = false,
        hasPending = false,
      } = r;

      requireValue(
        Number.isSafeInteger(page) && Number(page) >= 1,
        "페이지를 확인하세요.",
      );

      requireValue(
        Number.isSafeInteger(pageSize) &&
          Number(pageSize) >= 1 &&
          Number(pageSize) <= 50,
        "페이지 크기를 확인하세요.",
      );

      requireValue(
        typeof query === "string" &&
          [...query.trim()].length <= historyQueryMaxLength,
        "검색어는 100자 이하여야 합니다.",
      );

      requireValue(
        Array.isArray(selectedTags) &&
          selectedTags.every(
            (tag) =>
              typeof tag === "string" && tagIds.includes(tag),
          ),
        "태그를 확인하세요.",
      );

      requireValue(
        typeof untagged === "boolean",
        "태그 없음 필터를 확인하세요.",
      );

      requireValue(
        typeof hasPending === "boolean",
        "확인 안 한 퀴즈 필터를 확인하세요.",
      );

      const words = historyQueryWords(query as string);
      const tagFilter = selectedTags as string[];
      const filtering = tagFilter.length > 0 || untagged;

      // Newest first; insertion order breaks ties between notes created in the same millisecond.
      const newestFirst = s.notes
        .filter(({ deletedAt }) => !deletedAt)
        .reverse()
        .sort((a, b) =>
          a.createdAt < b.createdAt
            ? 1
            : a.createdAt > b.createdAt
              ? -1
              : 0,
        );

      type Candidate = {
        note: StoredNote;
        counts: NoteQuizCounts;
        match: ReturnType<typeof matchNote>;
      };

      // Filter and search first, then page: total counts the matches only.
      const matched = newestFirst.flatMap((note): Candidate[] => {
        const counts = noteCounts(note.noteId);

        if (hasPending && counts.pendingCount === 0) return [];

        if (
          filtering &&
          !(
            (untagged && !counts.hashtagIds.length) ||
            counts.hashtagIds.some((tag) =>
              tagFilter.includes(tag),
            )
          )
        )
          return [];

        if (!words.length) return [{ note, counts, match: null }];

        const match = matchNote(
          note.content,
          liveQuizzes(note.noteId).map(
            ({ status, revision: { title, question } }) => ({
              status,
              title,
              question,
            }),
          ),
          words,
        );

        return match ? [{ note, counts, match }] : [];
      });

      const start = (Number(page) - 1) * Number(pageSize);

      return {
        items: matched
          .slice(start, start + Number(pageSize))
          .map(
            ({
              note: { noteId, content, createdAt, updatedAt },
              counts,
              match,
            }): NoteSummary => ({
              noteId,
              excerpt: [...content]
                .slice(0, noteSummaryLength)
                .join(""),
              createdAt,
              updatedAt,
              ...counts,
              matchedIn: match?.matchedIn ?? null,
              matchedQuizTitle: match?.matchedQuizTitle ?? null,
              matchedQuizStatus:
                match?.matchedQuizStatus ?? null,
              matchedExcerpt: match?.matchedExcerpt ?? null,
            }),
          ),
        page,
        pageSize,
        total: matched.length,
      };
    }

    case "noteTags": {
      const live = s.notes
        .filter(({ deletedAt }) => !deletedAt)
        .map(({ noteId }) => noteCounts(noteId).hashtagIds);

      return {
        tags: hashtags
          .map(({ id: hashtagId }) => ({
            hashtagId,
            count: live.filter((tags) =>
              tags.includes(hashtagId),
            ).length,
          }))
          .filter(({ count }) => count > 0),
        untaggedCount: live.filter((tags) => !tags.length)
          .length,
        pendingNoteCount: s.notes.filter(
          ({ deletedAt, noteId }) =>
            !deletedAt && noteCounts(noteId).pendingCount > 0,
        ).length,
      };
    }

    case "note":
      return publicNote(findNote());

    case "createNote": {
      const { content } = r;

      source(content, "content");

      const note: StoredNote = {
        noteId: `note-${id()}`,
        content,
        version: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
      };

      s.notes.push(note);

      return publicNote(note);
    }

    case "updateNote": {
      const note = findNote();

      const { content } = r;

      source(content, "content");

      requireValue(
        Number.isInteger(r.expectedVersion),
        "버전이 필요합니다.",
      );

      if (r.expectedVersion !== note.version)
        throw new ServiceError(
          "VERSION_CONFLICT",
          "메모가 다른 곳에서 변경되었습니다. 최신 내용을 다시 불러오세요.",
          409,
        );

      note.content = content;
      note.version++;
      note.updatedAt = timestamp;

      return publicNote(note);
    }

    case "deleteNote": {
      const note = findNote(true);

      if (!note.deletedAt) {
        note.deletedAt = timestamp;
        note.version++;
        note.updatedAt = timestamp;

        // Linked quizzes of every status go with the memo. Completed Attempts stay.
        for (const quiz of liveQuizzes(note.noteId)) {
          quiz.deletedAt = timestamp;
          touch(quiz);
        }
      }

      return { deleted: true };
    }

    case "generate": {
      const { content: sourceContent } = findNote();

      const contents = generate({ sourceContent });

      // Existing PENDING quizzes stay; every request adds a new set.
      const created = contents.map(
        (content): StoredQuiz => ({
          quizId: id(),
          ownerUserId: s.userId,
          noteId: r.noteId as string,
          status: QuizStatus.PENDING,
          version: 1,
          revision: {
            ...content,
            revisionId: id(),
            sourceContent,
          },
          history: [],
          confirmedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
          deletedAt: null,
        }),
      );

      s.quizzes.push(...created);

      return created.map(quizReview);
    }

    case "noteQuizzes": {
      findNote();

      requireValue(
        Object.values(QuizStatus).includes(
          r.status as QuizStatus,
        ),
        "퀴즈 상태를 확인하세요.",
        "status",
      );

      return liveQuizzes(r.noteId as string)
        .filter(({ status }) => status === r.status)
        .map(quizReview);
    }

    case "reviewQuiz":
      return quizReview(ownQuiz());

    case "updateQuiz": {
      const q = ownQuiz();

      version(q);
      validateContent(r.content, tagIds);

      // A CONFIRMED edit applies at once; Attempts keep the revision they started with.
      q.revision = newRevision(r.content, q.revision);
      touch(q);

      return quizReview(q);
    }

    case "refineQuiz": {
      const q = ownQuiz();

      version(q);
      text(r.prompt, "prompt");

      requireValue(
        q.status === QuizStatus.PENDING,
        "확인하지 않은 퀴즈만 LLM으로 수정할 수 있습니다.",
      );

      const { revision } = q;

      const {
        sourceContent,
        title,
        question,
        answer,
        explanation,
        hashtagIds,
      } = revision;

      const [content] = generate(
        {
          sourceContent,
          current: {
            title,
            question,
            answer,
            explanation,
            hashtagIds,
          },
          prompt: r.prompt,
        },
        true,
      );

      q.revision = newRevision(content, q.revision);
      q.history.push({ prompt: r.prompt, content });
      touch(q);

      return quizReview(q);
    }

    case "confirmQuiz": {
      const q = ownQuiz();

      version(q);

      requireValue(
        q.status === QuizStatus.PENDING,
        "이미 저장한 퀴즈입니다.",
      );

      confirm(q);

      return quizReview(q);
    }

    case "confirmNoteQuizzes": {
      findNote();

      const pending = liveQuizzes(
        r.noteId as string,
      ).filter(
        ({ status }) => status === QuizStatus.PENDING,
      );

      pending.forEach(confirm);

      return pending.map(quizReview);
    }

    case "deleteQuiz": {
      const q = ownQuiz(true);

      if (!q.deletedAt) {
        q.deletedAt = timestamp;
        touch(q);
      }

      return {
        deleted: true,
      };
    }

    case "hashtags":
      return [...hashtags];

    case "learningTimezone":
      return {
        timeZone: s.timeZone,
      };

    case "learningDay": {
      const { timeZone } = s;

      if (!timeZone)
        throw new ServiceError(
          "TIMEZONE_REQUIRED",
          "학습 시간대를 설정하세요.",
          409,
        );

      const date = localDate(now, timeZone);

      const dates = s.days.map((d) => d.learningDate);

      return {
        timeZone,
        learningDate: date,
        completed: dates.includes(date),
        streak: streak(dates, date),
        completedDates: [...dates].sort(),
        dailyCounts: dailyQuizCounts(s.attempts),
      };
    }

    case "startAttempt": {
      text(r.quizId);

      requireValue(
        r.context === "DIRECT",
        "풀이 진입 경로가 필요합니다.",
      );

      const q = allQuizzes.find(
        (q) => q.quizId === r.quizId,
      );

      if (!available(q))
        throw new ServiceError(
          "QUIZ_UNAVAILABLE",
          "이 퀴즈는 풀 수 없습니다.",
          409,
        );

      const a: StoredAttempt = {
        attemptId: id(),
        quizId: q!.quizId,
        ownerUserId: q!.ownerUserId,
        revision: JSON.parse(JSON.stringify(q!.revision)),
        submittedAnswer: null,
        correct: null,
        completedAt: null,
        learningDate: null,
        timeZone: null,
      };

      s.attempts.push(a);

      return attemptView(a);
    }

    case "attemptHistory": {
      const {
        filter = AttemptHistoryFilter.ALL,
        query = "",
        page = 1,
        pageSize = 20,
      } = r;

      requireValue(
        Object.values(AttemptHistoryFilter).includes(
          filter as AttemptHistoryFilter,
        ),
        "필터를 확인하세요.",
      );

      requireValue(
        typeof query === "string" &&
          [...query.trim()].length <= historyQueryMaxLength,
        "검색어는 100자 이하여야 합니다.",
      );

      requireValue(
        Number.isSafeInteger(page) && Number(page) >= 1,
        "페이지를 확인하세요.",
      );

      requireValue(
        Number.isSafeInteger(pageSize) &&
          Number(pageSize) >= 1 &&
          Number(pageSize) <= 50,
        "페이지 크기를 확인하세요.",
      );

      type HistoryRecord = {
        attempt: StoredAttempt;
        match: ReturnType<typeof matchHistoryRecord>;
      };

      const words = historyQueryWords(query as string);

      const availableQuiz = ({ quizId }: StoredAttempt) =>
        available(
          allQuizzes.find((quiz) => quiz.quizId === quizId),
        );

      // Search reads only the stored revision, and only for quizzes the viewer may still open.
      const records = s.attempts
        .filter(
          ({ completedAt, correct }) =>
            completedAt &&
            (filter === AttemptHistoryFilter.ALL ||
              correct ===
                (filter === AttemptHistoryFilter.CORRECT)),
        )
        .flatMap((attempt): HistoryRecord[] => {
          if (!words.length)
            return [{ attempt, match: null }];

          if (!availableQuiz(attempt)) return [];

          const match = matchHistoryRecord(
            attempt.revision.title ?? "",
            attempt.revision.question,
            words,
          );

          return match ? [{ attempt, match }] : [];
        })
        .sort(
          ({ attempt: left }, { attempt: right }) =>
            Date.parse(right.completedAt!) -
              Date.parse(left.completedAt!) ||
            (left.attemptId < right.attemptId
              ? -1
              : left.attemptId > right.attemptId
                ? 1
                : 0),
        );

      return {
        items: records
          .slice(
            (Number(page) - 1) * Number(pageSize),
            Number(page) * Number(pageSize),
          )
          .map(({ attempt, match }) => {
            const {
              attemptId,
              revision,
              correct,
              completedAt,
            } = attempt;

            return {
              attemptId,
              title: availableQuiz(attempt)
                ? revision.title || null
                : null,
              correct,
              completedAt: completedAt!,
              matchedIn: match?.matchedIn ?? null,
              excerpt: match?.excerpt ?? null,
            };
          }),
        page,
        pageSize,
        total: records.length,
      };
    }

    case "attempt":
      return attemptView(getAttempt());

    case "answer": {
      const a = getAttempt();

      validateAnswer(r.answer, a.revision.question);

      if (a.completedAt || a.submittedAnswer) {
        if (
          !a.submittedAnswer ||
          !isCorrect(r.answer, a.submittedAnswer)
        )
          throw new ServiceError(
            "ALREADY_ANSWERED",
            "이미 제출한 답은 변경할 수 없습니다.",
            409,
          );

        return attemptView(a);
      }

      if (
        !available(
          allQuizzes.find((q) => q.quizId === a.quizId),
        )
      )
        throw new ServiceError(
          "QUIZ_UNAVAILABLE",
          "더 이상 제출할 수 없습니다.",
          409,
        );

      if (!s.timeZone)
        throw new ServiceError(
          "TIMEZONE_REQUIRED",
          "학습 시간대를 설정하세요.",
          409,
        );

      requireValue(
        a.revision.answer,
        "정답 기록이 없습니다.",
      );

      const date = localDate(now, s.timeZone);

      a.submittedAnswer = r.answer;
      a.correct = isCorrect(r.answer, a.revision.answer);
      a.completedAt = timestamp;
      a.timeZone = s.timeZone;
      a.learningDate = date;

      if (!s.days.some((d) => d.learningDate === date)) {
        s.days.push({
          learningDate: date,
          timeZone: s.timeZone,
          completedAt: timestamp,
        });
      }

      return attemptView(a);
    }
  }
}
