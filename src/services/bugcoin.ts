import { RewardReason } from "@/api/constants";
import type { RewardGrant } from "@/api/contracts";
import { localDate } from "@/services/learning";

export const REVIEW_INTERVAL_MS = 168 * 60 * 60 * 1000;

export interface RewardInput {
  userId: string;
  ownerUserId: string;
  quizId: string;
  attemptId: string;
  correct: boolean;
  quizCreatedAt?: string;
  now: Date;
  timeZone: string;
  previousAttempts: readonly {
    quizId: string;
    correct: boolean | null;
    completedAt: string | null;
  }[];
  rewards: readonly RewardGrant[];
}

/** Pure policy. UTC clock and previously committed records are explicit inputs. */
export function calculateRewards({
  userId,
  ownerUserId,
  quizId,
  attemptId,
  correct,
  quizCreatedAt,
  now,
  timeZone,
  previousAttempts,
  rewards,
}: RewardInput): RewardGrant[] {
  const learningDate = localDate(now, timeZone);
  const createdAt = now.toISOString();
  const own = ownerUserId === userId;
  const granted: RewardGrant[] = [];

  const relevant = rewards.filter(
    (entry) => entry.userId === userId,
  );

  const problem = relevant.filter(
    (entry) =>
      entry.quizId === quizId &&
      [
        RewardReason.FIRST_CORRECT,
        RewardReason.RETRY_CORRECT,
        RewardReason.REVIEW,
      ].some((reason) => reason === entry.reason),
  );

  const last = problem.reduce(
    (latest, entry) =>
      Math.max(latest, Date.parse(entry.createdAt)),
    -Infinity,
  );

  const eligibleOwner =
    quizCreatedAt !== undefined &&
    now.getTime() - Date.parse(quizCreatedAt) >=
      REVIEW_INTERVAL_MS;

  function add(
    reason: RewardReason,
    amountBugCent: number,
    recipient: string,
    target: string,
  ) {
    const id = JSON.stringify([reason, recipient, target]);

    if (rewards.some((entry) => entry.id === id)) return;

    granted.push({
      id,
      userId: recipient,
      solverUserId: userId,
      quizId,
      attemptId,
      reason,
      amountBugCent,
      createdAt,
      learningDate,
      timeZone,
    });
  }

  // An accepted submission is immutable, including any zero reward outcome.
  if (
    rewards.some(
      (entry) =>
        entry.solverUserId === userId &&
        entry.attemptId === attemptId,
    )
  )
    return [];

  const history = previousAttempts.filter(
    (entry) =>
      entry.quizId === quizId && entry.completedAt !== null,
  );

  if (correct) {
    if (
      !own &&
      problem.length === 0 &&
      !history.some((entry) => entry.correct === true)
    ) {
      const retried = history.length > 0;

      add(
        retried
          ? RewardReason.RETRY_CORRECT
          : RewardReason.FIRST_CORRECT,
        retried ? 50 : 100,
        userId,
        quizId,
      );
    } else if (
      ((!own && problem.length > 0) ||
        (own && eligibleOwner)) &&
      now.getTime() - last >= REVIEW_INTERVAL_MS
    ) {
      add(
        RewardReason.REVIEW,
        20,
        userId,
        JSON.stringify([quizId, attemptId]),
      );
    }

    if (!own || eligibleOwner)
      add(
        RewardReason.DAILY_CORRECT,
        100,
        userId,
        learningDate,
      );
  }

  if (!own && history.length === 0)
    add(
      RewardReason.CREATOR,
      40,
      ownerUserId,
      JSON.stringify([userId, quizId]),
    );

  return granted;
}
