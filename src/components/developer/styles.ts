export const developerStyles = {
  profileQuizzes:
    "min-w-0 rounded-surface border border-line bg-surface p-4 sm:p-6",
  header: "flex flex-wrap items-center gap-3",
  avatar:
    "shrink-0 [&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-success-soft [&_.ui-avatar]:!text-foreground",
  filters: "min-w-0 space-y-3 border-b border-line pb-3",
  tag: "flex max-w-full items-center gap-0 rounded-2xl border border-line bg-canvas/40 p-0.5",
  tagFilter:
    "min-h-11 min-w-0 rounded-xl px-2 text-left text-xs font-semibold break-all text-muted hover:bg-primary/5 aria-pressed:bg-primary/10 aria-pressed:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50",
  tagSubscribe:
    "!min-h-11 !rounded-xl !border-0 !min-w-11 !px-1 !text-xs !shadow-none",
} as const;
