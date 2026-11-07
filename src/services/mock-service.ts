import {
  deskItems,
  normalizeOrder,
  validOrder,
} from "@/lib/desk-order";
import {
  migratePosition,
  validTransform,
} from "@/lib/desk-spatial";
import {
  isMovable,
  validPosition,
} from "@/lib/desk-layout";
import {
  DeskObject,
  QuizStatus,
  ConversationRole,
  LearningMode,
  LearningState,
  QuizScope,
} from "@/api/constants";
import type {
  ApiOperations,
  AuthoringConversation,
  AuthoringMessage,
  AttemptView,
  GenerationBatch,
  LearningSelection,
  Operation,
  QuizContent,
  ReviewQuiz,
  Subscription,
  Visibility,
} from "@/api/contracts";
import {
  developerQuizzes,
  developerTags,
} from "@/services/developer-quizzes";
import { searchDiscovery } from "@/services/discovery";
import { hashtags, users } from "@/mocks/users";
import { shopItems } from "@/mocks/shop-items";
import type {
  StoredAttempt,
  StoredQuiz,
  UserState,
} from "@/services/state";
import {
  candidates,
  dailyQuizCounts,
  localDate,
  publicView,
  questionKey,
  streak,
} from "@/services/learning";
import {
  categories,
  isCorrect,
  keys,
  object,
  requireValue,
  ServiceError,
  source,
  text,
  timeZoneValid,
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
  now: Date;
  id: () => string;
  generate: MockGenerator;
  dailyReward: number;
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
  publishCandidate: ["batchId", "candidateId", "reviewed"],
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
  approve: ["quizId", "expectedVersion", "visibility"],
  visibility: ["quizId", "expectedVersion", "visibility"],
  deleteQuiz: ["quizId"],
  subscriptions: [],
  subscribe: ["type", "authorUserId", "hashtagId"],
  unsubscribe: ["subscriptionId"],
  developerQuizzes: [
    "publicId",
    "page",
    "pageSize",
    "hashtagId",
  ],
  developerTags: ["publicId", "page", "pageSize", "query"],
  searchDiscovery: ["kind", "query", "page", "pageSize"],
  discoverUsers: [],
  discoverHashtags: [],
  learningTags: ["authorUserId"],
  learningQuiz: ["hashtagId", "mode"],
  learningNext: ["hashtagId", "mode"],
  learningDay: [],
  learningTimezone: [],
  updateTimezone: ["timeZone"],
  startAttempt: ["quizId", "context"],
  attempt: ["attemptId"],
  answer: ["attemptId", "answer"],
  products: ["category"],
  wallet: [],
  purchase: ["productId", "requestKey"],
  inventory: [],
  equip: ["category", "productId"],
  moveEquipment: ["category", "productId", "position"],
  reorderDesk: ["order"],
  transformBugri: ["transform"],
  transformEquipment: [
    "category",
    "productId",
    "transform",
  ],
  publicProfile: ["publicId"],
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

  const {
    state: s,
    now,
    id,
    allQuizzes,
    allStates,
    dailyReward,
  } = ctx;

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
        ? publicView({
            ...q!,
            active: revision,
          })
        : null,
      completedAt,
      learningDate,
      timeZone,
      correct,
      result:
        visible && submittedAnswer
          ? {
              submittedAnswer,
              correct: correct!,
              answer,
              explanation,
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

  const visibility = (): Visibility => {
    requireValue(
      r.visibility === QuizStatus.PUBLIC ||
        r.visibility === QuizStatus.PRIVATE,
      "공개 범위를 선택하세요.",
    );

    return r.visibility;
  };

  const balance = () =>
    s.ledger.reduce((sum, { amount }) => sum + amount, 0);

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

    case "publishCandidate": {
      const batch = getBatch();

      text(r.candidateId);

      requireValue(
        r.reviewed === true,
        "내용 확인 후 공개하세요.",
      );

      const candidate = batch.candidates.find(
        ({ candidateId }) => candidateId === r.candidateId,
      );

      if (!candidate)
        throw new ServiceError(
          "VERSION_CONFLICT",
          "후보가 변경되었습니다. 최신 결과를 확인하세요.",
          409,
        );

      if (candidate.savedQuizId) {
        const existing = s.quizzes.find(
          ({ quizId }) => quizId === candidate.savedQuizId,
        );

        requireValue(
          existing &&
            !existing.deletedAt &&
            existing.status === QuizStatus.PUBLIC &&
            !existing.pending,
          "저장한 퀴즈는 검토 화면에서 공개하세요.",
        );

        return batch;
      }

      validateContent(candidate.content, tagIds);
      source(batch.sourceContent);

      const quiz: StoredQuiz = {
        quizId: id(),
        ownerUserId: s.userId,
        status: QuizStatus.PUBLIC,
        version: 1,
        active: {
          ...candidate.content,
          revisionId: id(),
          sourceContent: batch.sourceContent,
          reviewed: true,
        },
        pending: null,
        publishedAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
      };

      s.quizzes.push(quiz);
      candidate.savedQuizId = quiz.quizId;

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
        r.scope === QuizScope.OWN ||
          r.scope === QuizScope.PUBLIC,
        "목록 범위를 지정하세요.",
      );

      return allQuizzes
        .filter(
          (q) =>
            !q.deletedAt &&
            (r.scope === QuizScope.OWN
              ? q.ownerUserId === s.userId
              : q.status === QuizStatus.PUBLIC),
        )
        .map((q) => {
          const revision =
            r.scope === QuizScope.OWN
              ? (q.pending ?? q.active!)
              : q.active!;

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

      const next =
        r.visibility === undefined &&
        q.status !== QuizStatus.PENDING
          ? q.status
          : visibility();

      if (
        next === QuizStatus.PUBLIC &&
        q.status !== QuizStatus.PUBLIC
      )
        q.publishedAt = timestamp;

      q.active = q.pending;
      q.pending = null;
      q.status = next;
      touch(q);

      return quizReview(q);
    }

    case "visibility": {
      const q = ownQuiz();

      version(q);

      requireValue(
        q.active,
        "승인된 퀴즈만 공개 범위를 변경할 수 있습니다.",
      );

      const next = visibility();

      if (
        next === QuizStatus.PUBLIC &&
        q.status !== QuizStatus.PUBLIC
      )
        q.publishedAt = timestamp;

      q.status = next;
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

    case "subscriptions":
      return s.subscriptions;

    case "subscribe": {
      requireValue(
        ["PERSON", "HASHTAG", "PERSON_HASHTAG"].includes(
          String(r.type),
        ),
        "구독 유형을 확인하세요.",
      );

      if (r.type !== "HASHTAG")
        requireValue(
          users.some((u) => u.userId === r.authorUserId),
          "사용자를 찾을 수 없습니다.",
        );
      else
        requireValue(
          r.authorUserId === undefined,
          "해시태그 구독은 작성자를 지정하지 않습니다.",
        );

      if (r.type !== "PERSON")
        requireValue(
          tagIds.includes(String(r.hashtagId)),
          "태그를 찾을 수 없습니다.",
        );
      else
        requireValue(
          r.hashtagId === undefined,
          "사람 구독은 태그를 지정하지 않습니다.",
        );

      const existing = s.subscriptions.find(
        (sub) =>
          sub.type === r.type &&
          ("authorUserId" in sub
            ? sub.authorUserId
            : undefined) === r.authorUserId &&
          ("hashtagId" in sub
            ? sub.hashtagId
            : undefined) === r.hashtagId,
      );

      if (existing) return existing;

      const sub = {
        ...r,
        subscriptionId: id(),
      } as Subscription;

      s.subscriptions.push(sub);

      return sub;
    }

    case "unsubscribe":
      text(r.subscriptionId);

      s.subscriptions = s.subscriptions.filter(
        (sub) => sub.subscriptionId !== r.subscriptionId,
      );

      return {
        deleted: true,
      };

    case "developerQuizzes":
      return developerQuizzes(
        {
          users,
          hashtags,
          quizzes: allQuizzes,
          subscriptions: s.subscriptions,
        },
        input as ApiOperations["developerQuizzes"]["request"],
      );

    case "developerTags":
      return developerTags(
        {
          users,
          hashtags,
          quizzes: allQuizzes,
          subscriptions: s.subscriptions,
        },
        input as ApiOperations["developerTags"]["request"],
      );

    case "searchDiscovery":
      return searchDiscovery(
        { users, hashtags, subscriptions: s.subscriptions },
        input as ApiOperations["searchDiscovery"]["request"],
      );

    case "discoverUsers":
      return users;

    case "discoverHashtags":
      return [...hashtags];

    case "learningTags": {
      if (r.authorUserId !== undefined)
        text(r.authorUserId);

      const qs = candidates(
        allQuizzes,
        s.subscriptions,
      ).filter(
        (q) =>
          r.authorUserId === undefined ||
          q.ownerUserId === r.authorUserId,
      );

      return hashtags.filter((t) =>
        qs.some((q) => q.active!.hashtagIds.includes(t.id)),
      );
    }

    case "learningQuiz":

    case "learningNext": {
      if (r.hashtagId !== undefined && r.hashtagId !== null)
        requireValue(
          tagIds.includes(String(r.hashtagId)),
          "태그를 찾을 수 없습니다.",
        );

      if (r.mode !== undefined)
        requireValue(
          r.mode === LearningMode.UNSOLVED ||
            r.mode === LearningMode.REPLAY,
          "학습 모드를 확인하세요.",
        );

      const hashtagId =
        r.hashtagId === undefined
          ? operation === "learningNext"
            ? s.selection.hashtagId
            : null
          : (r.hashtagId as string | null);

      const mode = (r.mode ??
        (operation === "learningNext"
          ? s.selection.mode
          : LearningMode.UNSOLVED)) as LearningMode;

      const qs = candidates(
        allQuizzes,
        s.subscriptions,
        hashtagId,
      );

      const completedAttempts = s.attempts.filter(
        ({ completedAt }) => completedAt,
      );

      const completed = new Set(
        completedAttempts.map(({ quizId }) => quizId),
      );

      const completedQuestions = new Set(
        completedAttempts.map(({ revision }) =>
          questionKey(revision.question),
        ),
      );

      const pool = qs.filter((q) =>
        mode === LearningMode.REPLAY
          ? completed.has(q.quizId)
          : !completed.has(q.quizId) &&
            !completedQuestions.has(
              questionKey(q.active!.question),
            ),
      );

      const previousIndex = pool.findIndex(
        (q) => q.quizId === s.selection.quizId,
      );

      const sameFilter =
        hashtagId === s.selection.hashtagId &&
        mode === s.selection.mode;

      const replayFinished =
        operation === "learningNext" &&
        mode === LearningMode.REPLAY;

      const selected = replayFinished
        ? undefined
        : sameFilter && previousIndex >= 0
          ? pool[
              operation === "learningNext"
                ? (previousIndex + 1) % pool.length
                : previousIndex
            ]
          : pool[0];

      const selectionMode = replayFinished
        ? LearningMode.UNSOLVED
        : mode;

      s.selection = {
        hashtagId,
        mode: selectionMode,
        quizId: selected?.quizId ?? null,
      };

      const result: LearningSelection = {
        hashtagId,
        mode: selectionMode,
        state: !qs.length
          ? LearningState.EMPTY
          : selected
            ? LearningState.AVAILABLE
            : mode === LearningMode.UNSOLVED ||
                replayFinished
              ? LearningState.EXHAUSTED
              : LearningState.NO_REPLAY,
        quiz: selected ? publicView(selected) : null,
        candidateCount: qs.length,
      };

      return result;
    }

    case "learningTimezone":
      return {
        timeZone: s.timeZone,
      };

    case "updateTimezone":
      requireValue(
        timeZoneValid(r.timeZone),
        "유효한 IANA 시간대가 필요합니다.",
      );

      s.timeZone = r.timeZone;

      return {
        timeZone: s.timeZone,
      };

    case "learningDay": {
      if (!s.timeZone)
        throw new ServiceError(
          "TIMEZONE_REQUIRED",
          "학습 시간대를 설정하세요.",
          409,
        );

      const date = localDate(now, s.timeZone);
      const dates = s.days.map((d) => d.learningDate);

      return {
        timeZone: s.timeZone,
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
        r.context === "DIRECT" || r.context === "LEARNING",
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

      if (
        r.context === "LEARNING" &&
        !candidates(
          allQuizzes,
          s.subscriptions,
          s.selection.hashtagId,
        ).some(
          (candidate) => candidate.quizId === q!.quizId,
        )
      )
        throw new ServiceError(
          "QUIZ_UNAVAILABLE",
          "현재 구독·태그의 학습 대상이 아닙니다.",
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

    case "attempt":
      return attemptView(getAttempt());

    case "answer": {
      const a = getAttempt();

      validateAnswer(r.answer, a.revision.question);

      if (a.submittedAnswer) {
        if (!isCorrect(r.answer, a.submittedAnswer))
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

        if (dailyReward > 0)
          s.ledger.push({
            id: id(),
            amount: dailyReward,
            reason: "DAILY_COMPLETION",
            reference: date,
            createdAt: timestamp,
          });
      }

      return attemptView(a);
    }

    case "products":
      if (r.category !== undefined)
        requireValue(
          categories.includes(r.category as never),
          "카테고리를 확인하세요.",
        );

      return shopItems.filter(
        (p) =>
          r.category === undefined ||
          p.category === r.category,
      );

    case "wallet":
      return {
        balance: balance(),
        ledger: s.ledger,
      };

    case "purchase": {
      text(r.productId);
      text(r.requestKey);

      const previous = s.purchases.find(
        (p) => p.requestKey === r.requestKey,
      );

      if (previous) {
        if (previous.productId !== r.productId)
          throw new ServiceError(
            "IDEMPOTENCY_CONFLICT",
            "같은 요청 키를 다른 상품에 사용할 수 없습니다.",
            409,
          );

        return previous;
      }

      const product = shopItems.find(
        (p) => p.productId === r.productId,
      );

      if (!product)
        throw new ServiceError(
          "NOT_FOUND",
          "상품을 찾을 수 없습니다.",
          404,
        );

      if (
        s.purchases.some(
          (p) => p.productId === product.productId,
        )
      )
        throw new ServiceError(
          "ALREADY_OWNED",
          "이미 구매한 상품입니다.",
          409,
        );

      if (balance() < product.price)
        throw new ServiceError(
          "INSUFFICIENT_BALANCE",
          "BugCoin이 부족합니다.",
          409,
        );

      const purchase = {
        purchaseId: id(),
        productId: product.productId,
        requestKey: r.requestKey,
        price: product.price,
        purchasedAt: timestamp,
      };

      s.purchases.push(purchase);

      s.ledger.push({
        id: id(),
        amount: -product.price,
        reason: "PURCHASE",
        reference: purchase.purchaseId,
        createdAt: timestamp,
      });

      return purchase;
    }

    case "inventory":
      return {
        products: shopItems.filter((p) =>
          s.purchases.some(
            (owned) => owned.productId === p.productId,
          ),
        ),
        equipment: s.equipment,
        positions: s.positions,
        transforms: s.transforms,
        order: s.order,
      };

    case "equip": {
      requireValue(
        categories.includes(r.category as never),
        "카테고리를 확인하세요.",
      );

      const category =
        r.category as keyof typeof s.equipment;

      if (r.productId === null) {
        delete s.equipment[category];
        delete s.positions[category];
        delete s.transforms[category];
      } else {
        text(r.productId);

        requireValue(
          shopItems.some(
            (p) =>
              p.productId === r.productId &&
              p.category === category,
          ),
          "상품 카테고리가 일치하지 않습니다.",
        );

        if (
          !s.purchases.some(
            (p) => p.productId === r.productId,
          )
        )
          throw new ServiceError(
            "FORBIDDEN",
            "보관함에 있는 상품만 장착할 수 있습니다.",
            403,
          );

        if (s.equipment[category] !== r.productId) {
          delete s.positions[category];
          delete s.transforms[category];
        }

        s.equipment[category] = r.productId;
      }

      if (s.order.length)
        s.order = normalizeOrder(
          s.order,
          deskItems(s.equipment),
        );

      return s.equipment;
    }

    case "moveEquipment": {
      requireValue(
        isMovable(r.category),
        "이 상품은 이동할 수 없습니다.",
      );

      const { category } = r;

      text(r.productId);

      requireValue(
        validPosition(category, r.position),
        "상품이 화면 안에 있도록 위치를 확인하세요.",
      );

      if (
        s.equipment[category] !== r.productId ||
        !s.purchases.some(
          (p) => p.productId === r.productId,
        )
      ) {
        throw new ServiceError(
          "FORBIDDEN",
          "현재 장착한 내 상품만 이동할 수 있습니다.",
          403,
        );
      }

      s.positions[category] = r.position;

      s.transforms[category] = migratePosition(
        category,
        r.position,
      );

      return s.positions;
    }

    case "reorderDesk": {
      requireValue(
        validOrder(r.order, deskItems(s.equipment)),
        "현재 공간의 아이템 순서를 확인하세요.",
      );

      s.order = [...r.order];

      return s.order;
    }

    case "transformBugri": {
      requireValue(
        validTransform(DeskObject.BUGRI, r.transform),
        "버그리의 위치, 높이와 회전값을 확인하세요.",
      );

      s.transforms.BUGRI = r.transform;

      return s.transforms;
    }

    case "transformEquipment": {
      requireValue(
        isMovable(r.category),
        "이 상품은 배치할 수 없습니다.",
      );

      const { category } = r;

      text(r.productId);

      requireValue(
        validTransform(category, r.transform),
        "상품의 위치, 높이와 회전값을 확인하세요.",
      );

      if (
        s.equipment[category] !== r.productId ||
        !s.purchases.some(
          (p) => p.productId === r.productId,
        )
      )
        throw new ServiceError(
          "FORBIDDEN",
          "현재 장착한 내 상품만 배치할 수 있습니다.",
          403,
        );

      s.transforms[category] = r.transform;

      return s.transforms;
    }

    case "publicProfile": {
      text(r.publicId);

      const user = users.find(
        (u) => u.publicId === r.publicId,
      );

      if (!user)
        throw new ServiceError(
          "NOT_FOUND",
          "사용자를 찾을 수 없습니다.",
          404,
        );

      return {
        user,
        equipment: allStates.find(
          (state) => state.userId === user.userId,
        )!.equipment,
        order: allStates.find(
          (state) => state.userId === user.userId,
        )!.order,
        transforms: allStates.find(
          (state) => state.userId === user.userId,
        )!.transforms,
        positions: allStates.find(
          (state) => state.userId === user.userId,
        )!.positions,
      };
    }
  }
}
