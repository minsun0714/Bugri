import type { Page } from "@playwright/test";
import { initialState } from "@/mocks/storage";

export const ownQuizId = "owned-quiz-1";

/** Gives `userId` an owned copy of seed-quiz-1 (quizzes are author-only), keeping any existing browser state. Needs an app page for localStorage. */
export async function seedOwnQuiz(
  page: Page,
  userId: string,
) {
  const seed = initialState("author").quizzes.find(
    ({ quizId }) => quizId === "seed-quiz-1",
  )!;

  await page.evaluate(
    ({ key, initial, quiz }) => {
      const raw = localStorage.getItem(key);
      const state = raw ? JSON.parse(raw) : initial;

      if (
        !state.quizzes.some(
          ({ quizId }: { quizId: string }) =>
            quizId === quiz.quizId,
        )
      ) {
        state.quizzes.push(quiz);
        localStorage.setItem(key, JSON.stringify(state));
      }
    },
    {
      key: `bugri:mock:v1:${userId}`,
      initial: initialState(userId),
      quiz: { ...seed, quizId: ownQuizId, ownerUserId: userId },
    },
  );
}
