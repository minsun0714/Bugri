export const developerStyles = {
  profileQuizzes:
    "min-w-0 rounded-3xl border border-line bg-surface p-4 sm:p-6",
  header: "flex flex-wrap items-center gap-3",
  avatar:
    "shrink-0 [&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-lime/55 [&_.ui-avatar]:!text-foreground",
  filters: "min-w-0 space-y-3 border-b border-line py-4",
  search: "flex w-full items-center gap-2 sm:w-80",
  searchField:
    "min-w-0 flex-1 [&_input]:!h-11 [&_input]:!rounded-xl [&_input]:!bg-canvas [&_input]:!py-2.5",
  searchButton:
    "!min-h-11 !rounded-xl !border-primary/15 !px-4 !shadow-none",
  tag: "flex max-w-full items-center gap-0 rounded-2xl border border-line bg-canvas/40 p-0.5",
  tagFilter:
    "min-h-11 min-w-0 rounded-xl px-2 text-left text-xs font-semibold break-all text-muted hover:bg-primary/5 aria-pressed:bg-primary/10 aria-pressed:text-primary focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50",
  tagSubscribe:
    "!min-h-11 !rounded-xl !border-0 !min-w-11 !px-1 !text-xs !shadow-none",
} as const;
