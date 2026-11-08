import { styles } from "@/components/ui/styles";

export const reviewStyles = {
  section:
    "rounded-surface border border-line bg-surface p-4 sm:p-5",
  header:
    "flex flex-wrap items-center justify-between gap-x-4 gap-y-3",
  heading: "text-lg font-semibold",
  headingDone:
    "flex items-center gap-2 text-lg font-semibold text-success-ink",
  detail: "mt-1 text-sm text-muted",
  nextReview:
    "rounded-2xl border border-line bg-canvas/50 px-4 py-3 text-sm",
  actions: "flex flex-wrap items-center justify-end gap-2",
  memoLink: `${styles["ui-button"]} secondary`,
} as const;
