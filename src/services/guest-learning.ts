import { QuizStatus } from "@/api/constants";
import type { Request } from "@/api/contracts";
import type { StoredQuiz } from "@/services/state";
import { publicView } from "@/services/learning";
import {
  object,
  keys,
  text,
  validateAnswer,
  isCorrect,
  ServiceError,
} from "@/services/validation";

export function guestLearning(
  operation: "guestQuiz" | "guestAnswer",
  input: Request<"guestQuiz"> | Request<"guestAnswer">,
  quizzes: StoredQuiz[],
) {
  object(input);

  keys(
    input,
    operation === "guestQuiz"
      ? []
      : ["quizId", "revisionId", "answer"],
  );

  const available = quizzes.filter(
    ({ status, deletedAt, active }) =>
      status === QuizStatus.PUBLIC && !deletedAt && active,
  );

  if (operation === "guestQuiz") {
    const index = Math.floor(
      Math.random() * available.length,
    );

    const { [index]: quiz } = available;

    return quiz ? publicView(quiz) : null;
  }

  const { quizId, revisionId, answer } =
    input as Request<"guestAnswer">;

  text(quizId);
  text(revisionId);

  const quiz = available.find(
    (item) =>
      item.quizId === quizId &&
      item.active?.revisionId === revisionId,
  );

  if (!quiz?.active)
    throw new ServiceError(
      "QUIZ_UNAVAILABLE",
      "이 퀴즈는 더 이상 이용할 수 없습니다.",
      409,
    );

  const { active } = quiz;

  validateAnswer(answer, active.question);

  return {
    submittedAnswer: answer,
    correct: isCorrect(answer, active.answer),
    answer: active.answer,
    explanation: active.explanation,
  };
}
