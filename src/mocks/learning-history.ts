import type {
  StoredAttempt,
  StoredDay,
} from "@/services/state";

export const attempts: readonly StoredAttempt[] = [];

export const learningDays: readonly StoredDay[] = [];

/** Public demo fixtures only; not the product default for timezone detection. */
export const publicLearningTimeZones: Readonly<
  Record<string, string>
> = {
  learner: "Asia/Seoul",
  author: "Asia/Seoul",
  friend: "Asia/Seoul",
};
