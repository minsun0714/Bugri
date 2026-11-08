import { QuizReaction, QuizStatus } from "@/api/constants";
import type { QuizReactionSummary } from "@/api/contracts";
import type { UserState } from "@/services/state";
import { ServiceError } from "@/services/validation";

export function quizReactionSummary(
  userId: string | null,
  quizId: string,
  states: UserState[],
): QuizReactionSummary {
  const quiz = states
    .flatMap(({ quizzes }) => quizzes)
    .find((item) => item.quizId === quizId);

  if (
    !quiz ||
    quiz.deletedAt ||
    !quiz.active ||
    !(
      quiz.status === QuizStatus.PUBLIC ||
      (quiz.status === QuizStatus.PRIVATE &&
        quiz.ownerUserId === userId)
    )
  ) {
    throw new ServiceError(
      "QUIZ_UNAVAILABLE",
      "이 퀴즈는 더 이상 이용할 수 없습니다.",
      409,
    );
  }

  const reactions = states
    .flatMap(({ quizReactions }) => quizReactions ?? [])
    .filter((entry) => entry.quizId === quizId);

  return {
    reaction:
      states
        .find((state) => state.userId === userId)
        ?.quizReactions?.find(
          (entry) => entry.quizId === quizId,
        )?.reaction ?? null,
    likeCount: reactions.filter(
      ({ reaction }) => reaction === QuizReaction.LIKE,
    ).length,
    dislikeCount: reactions.filter(
      ({ reaction }) => reaction === QuizReaction.DISLIKE,
    ).length,
  };
}
