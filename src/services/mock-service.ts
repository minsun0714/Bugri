import { AttemptHistoryFilter } from "@/api/constants";
import {
  historyQueryMaxLength,
  historyQueryWords,
  matchHistoryRecord,
} from "@/services/history-search";

import {
  QuizStatus,
  ConversationRole,
  QuizScope,
} from "@/api/constants";
import type {
  ApiOperations,
  AuthoringConversation,
  AuthoringMessage,
  AttemptView,
  GenerationBatch,
  Operation,
  QuizContent,
  ReviewQuiz,
} from "@/api/contracts";

import { hashtags } from "@/mocks/users";

import type {
  StoredAttempt,
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
  reply?: (
    messages: AuthoringMessage[],
    content: string,
  ) => unknown;
}

const tagIds = hashtags.map(({ id }) => id);

const allowed: Record<Operation, string[]> = {
  authoringConversation: [],
  sendAuthoringMessage: ["content", "expectedVersion"],
  generateFromConversation: ["draft", "expectedVersion"],
  generate: ["sourceContent"],
  generationBatch: ["batchId"],
  refineCandidate: ["batchId", "candidateId", "prompt"],
  editCandidate: ["batchId", "candidateId", "content"],
  deleteCandidate: ["batchId", "candidateId"],
  saveBatch: ["batchId", "mode", "candidateId"],
  quizzes: ["scope"],
  reviewQuiz: ["quizId"],
  updatePending: [
    "quizId",
    "expectedVersion",
    "action",
    "sourceContent",
    "content",
  ],
  regenerate: ["quizId", "expectedVersion", "prompt"],
  approve: ["quizId", "expectedVersion"],
  deleteQuiz: ["quizId"],
  discoverHashtags: [],
  learningDay: [],
  learningTimezone: [],
  attemptHistory: ["filter", "query", "page", "pageSize"],
  startAttempt: ["quizId", "context"],
  attempt: ["attemptId"],
  answer: ["attemptId", "answer"],
};

function quizReview({
  quizId,
  ownerUserId,
  status,
  version,
  active,
  pending,
  updatedAt,
}: StoredQuiz): ReviewQuiz {
  return {
    quizId,
    ownerUserId,
    status,
    version,
    active,
    pending,
    updatedAt,
  };
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
    !!q.active &&
    (q.status === QuizStatus.PUBLIC ||
      (q.status === QuizStatus.PRIVATE &&
        q.ownerUserId === s.userId));

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

  const getBatch = () => {
    text(r.batchId, "batchId");

    const b = s.batches.find(
      (b) => b.batchId === r.batchId,
    );

    if (!b)
      throw new ServiceError(
        "NOT_FOUND",
        "생성 결과를 찾을 수 없습니다.",
        404,
      );

    return b;
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

  const conversation: AuthoringConversation =
    s.authoringConversation ?? {
      version: 0,
      messages: [],
      draft: "",
      latestBatchId: null,
    };

  const conversationVersion = () => {
    requireValue(
      Number.isInteger(r.expectedVersion),
      "대화 버전이 필요합니다.",
    );

    if (r.expectedVersion !== conversation.version)
      throw new ServiceError(
        "VERSION_CONFLICT",
        "다른 탭에서 대화가 변경되었습니다. 최신 대화를 불러오세요.",
        409,
      );
  };

  switch (operation) {
    case "authoringConversation":
      return conversation;

    case "sendAuthoringMessage": {
      conversationVersion();
      source(r.content);

      let reply: string;

      try {
        const result = ctx.reply?.(
          conversation.messages,
          r.content,
        );

        source(result);
        reply = result;
      } catch {
        throw new ServiceError(
          "GENERATION_FAILED",
          "답변을 받지 못했습니다. 다시 보내주세요.",
          502,
        );
      }

      s.authoringConversation = {
        ...conversation,
        version: conversation.version + 1,
        draft: "",
        messages: [
          ...conversation.messages,
          {
            messageId: id(),
            role: ConversationRole.USER,
            content: r.content,
          },
          {
            messageId: id(),
            role: ConversationRole.ASSISTANT,
            content: reply,
          },
        ],
      };

      return s.authoringConversation;
    }

    case "generateFromConversation": {
      conversationVersion();

      requireValue(
        typeof r.draft === "string" &&
          [...r.draft].length <= 10000,
        "입력은 최대 10,000자입니다.",
      );

      requireValue(
        conversation.messages.length > 0,
        "먼저 대화를 보내주세요.",
      );

      const sourceContent = conversation.messages
        .map(
          ({ role, content }) =>
            `${role === ConversationRole.USER ? "사용자" : "답변"}:\n${content}`,
        )
        .join("\n\n");

      source(sourceContent);

      const contents = generate({ sourceContent });

      const batch: GenerationBatch = {
        batchId: id(),
        sourceContent,
        candidates: contents.map((content) => ({
          candidateId: id(),
          content,
          savedQuizId: null,
        })),
      };

      s.batches.push(batch);

      s.authoringConversation = {
        ...conversation,
        version: conversation.version + 1,
        draft: r.draft,
        latestBatchId: batch.batchId,
      };

      return {
        conversation: s.authoringConversation,
        batch,
      };
    }

    case "generate": {
      source(r.sourceContent);

      const contents = generate({
        sourceContent: r.sourceContent,
      });

      const batch: GenerationBatch = {
        batchId: id(),
        sourceContent: r.sourceContent,
        candidates: contents.map((content) => ({
          candidateId: id(),
          content,
          savedQuizId: null,
        })),
      };

      s.batches.push(batch);

      return batch;
    }

    case "generationBatch":
      return getBatch();

    case "editCandidate":

    case "refineCandidate": {
      const batch = getBatch();

      text(r.candidateId, "candidateId");

      if (operation === "refineCandidate")
        text(r.prompt, "prompt");

      const candidate = batch.candidates.find(
        ({ candidateId }) => candidateId === r.candidateId,
      );

      if (!candidate)
        throw new ServiceError(
          "VERSION_CONFLICT",
          "후보가 변경되었습니다. 최신 결과를 다시 불러오세요.",
          409,
        );

      requireValue(
        candidate.savedQuizId === null,
        "저장한 퀴즈는 검토 화면에서 수정하세요.",
      );

      if (operation === "editCandidate") {
        validateContent(r.content, tagIds);
        candidate.content = r.content;
        candidate.candidateId = id();

        return batch;
      }

      text(r.prompt, "prompt");

      const [content] = generate(
        {
          sourceContent: batch.sourceContent,
          current: candidate.content,
          prompt: r.prompt,
        },
        true,
      );

      candidate.content = content;

      candidate.history = [
        ...(candidate.history ?? []),
        { prompt: r.prompt, content },
      ];

      candidate.candidateId = id();

      return batch;
    }

    case "deleteCandidate": {
      const batch = getBatch();

      text(r.candidateId, "candidateId");

      const index = batch.candidates.findIndex(
        ({ candidateId }) => candidateId === r.candidateId,
      );

      if (index < 0)
        throw new ServiceError(
          "VERSION_CONFLICT",
          "후보가 변경되었습니다. 최신 결과를 다시 불러오세요.",
          409,
        );

      const [candidate] = batch.candidates.slice(
        index,
        index + 1,
      );

      if (!candidate)
        throw new ServiceError(
          "VERSION_CONFLICT",
          "후보가 변경되었습니다. 최신 결과를 다시 불러오세요.",
          409,
        );

      if (candidate.savedQuizId) {
        const quiz = s.quizzes.find(
          ({ quizId }) => quizId === candidate.savedQuizId,
        );

        if (quiz && !quiz.deletedAt) {
          quiz.deletedAt = timestamp;
          touch(quiz);
        }
      }

      batch.candidates.splice(index, 1);

      return batch;
    }

    case "saveBatch": {
      const batch = getBatch();

      requireValue(
        r.mode === "SINGLE" || r.mode === "ALL",
        "저장 모드를 선택하세요.",
      );

      if (r.mode === "SINGLE") text(r.candidateId);
      else
        requireValue(
          r.candidateId === undefined,
          "일괄 저장에는 candidateId를 사용하지 않습니다.",
        );

      const selected = batch.candidates.filter(
        (c) =>
          r.mode === "ALL" ||
          c.candidateId === r.candidateId,
      );

      requireValue(
        selected.length > 0,
        "후보를 찾을 수 없습니다.",
      );

      return selected.map((c) => {
        if (c.savedQuizId) {
          const existing = s.quizzes.find(
            (q) => q.quizId === c.savedQuizId,
          )!;

          if (existing.deletedAt)
            throw new ServiceError(
              "QUIZ_UNAVAILABLE",
              "이미 저장 후 삭제한 후보입니다.",
              409,
            );

          return quizReview(existing);
        }

        const q: StoredQuiz = {
          createdAt: timestamp,
          quizId: id(),
          ownerUserId: s.userId,
          status: QuizStatus.PENDING,
          version: 1,
          active: null,
          pending: {
            ...c.content,
            revisionId: id(),
            sourceContent: batch.sourceContent,
            reviewed: false,
          },
          updatedAt: timestamp,
          deletedAt: null,
        };

        s.quizzes.push(q);
        c.savedQuizId = q.quizId;

        return quizReview(q);
      });
    }

    case "quizzes": {
      requireValue(
        r.scope === QuizScope.OWN,
        "목록 범위를 지정하세요.",
      );

      return allQuizzes
        .filter(
          (q) => !q.deletedAt && q.ownerUserId === s.userId,
        )
        .map((q) => {
          const revision = q.pending ?? q.active!;

          return {
            quizId: q.quizId,
            ownerUserId: q.ownerUserId,
            status: q.status,
            title: revision.title,
            hashtagIds: revision.hashtagIds,
            updatedAt: q.updatedAt,
            hasPendingRevision:
              r.scope === QuizScope.OWN && !!q.pending,
          };
        });
    }

    case "reviewQuiz":
      return quizReview(ownQuiz());

    case "updatePending": {
      const q = ownQuiz();

      version(q);

      requireValue(
        r.action === "EDIT" || r.action === "MARK_REVIEWED",
        "수정 또는 검토 완료를 선택하세요.",
      );

      if (r.action === "EDIT") {
        source(r.sourceContent);
        validateContent(r.content, tagIds);

        q.pending = {
          ...r.content,
          revisionId: id(),
          sourceContent: r.sourceContent,
          reviewed: false,
        };
      } else {
        requireValue(
          r.content === undefined &&
            r.sourceContent === undefined,
          "검토 완료와 내용 저장은 별도 요청입니다.",
        );

        requireValue(
          q.pending,
          "검토할 수정본이 없습니다.",
        );

        q.pending.reviewed = true;
      }

      touch(q);

      return quizReview(q);
    }

    case "regenerate": {
      const q = ownQuiz();

      version(q);
      text(r.prompt, "prompt");

      const {
        sourceContent,
        title,
        question,
        answer,
        explanation,
        hashtagIds,
      } = q.pending ?? q.active!;

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

      q.pending = {
        ...content,
        revisionId: id(),
        sourceContent,
        reviewed: false,
        followUpPrompt: r.prompt,
      };

      touch(q);

      return quizReview(q);
    }

    case "approve": {
      const q = ownQuiz();

      version(q);

      if (!q.pending?.reviewed)
        throw new ServiceError(
          "NOT_REVIEWED",
          "저장된 수정본을 검토 완료하세요.",
          409,
        );

      q.active = q.pending;
      q.pending = null;

      q.status =
        q.status === QuizStatus.PENDING
          ? QuizStatus.PRIVATE
          : q.status;

      touch(q);

      return quizReview(q);
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

    case "discoverHashtags":
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
        revision: JSON.parse(JSON.stringify(q!.active)),
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
