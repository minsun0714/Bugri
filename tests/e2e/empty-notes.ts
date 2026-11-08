import type { Page } from "@playwright/test";
import { initialState } from "@/mocks/storage";

/** Starts the given demo users with no memos or quizzes, only when the browser has no saved state yet. */
export async function startWithoutNotes(
  page: Page,
  userIds = ["learner", "author", "friend"],
) {
  await page.addInitScript(
    (states: Record<string, string>) => {
      for (const [key, value] of Object.entries(states))
        if (!localStorage.getItem(key))
          localStorage.setItem(key, value);
    },
    Object.fromEntries(
      userIds.map((userId) => [
        `bugri:mock:v1:${userId}`,
        JSON.stringify({
          ...initialState(userId),
          notes: [],
          quizzes: [],
        }),
      ]),
    ),
  );
}
