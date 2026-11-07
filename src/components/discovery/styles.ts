export const discoveryStyles = {
  searchField:
    "relative min-w-0 flex-1 [&_input]:!h-12 [&_input]:!rounded-2xl [&_input]:!border-0 [&_input]:!bg-canvas/70 [&_input]:!pl-10 [&_input]:!pr-2 [&_input]:!text-base [&_small]:px-2",
  searchButton:
    "!min-h-12 !rounded-2xl !border-0 !px-5 !shadow-none",
  card: "flex min-w-0 flex-col gap-3 rounded-3xl border border-line bg-surface p-4 sm:p-5 shadow-[0_2px_0_var(--color-line)] transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-[0_2px_0_var(--color-line),0_10px_24px_-16px_var(--color-primary)]",
  personLink:
    "inline-flex min-h-11 max-w-full items-center rounded-lg break-all text-lg font-bold tracking-tight text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  quizLink:
    "inline-flex min-h-11 items-center gap-1.5 rounded-xl text-xs text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  subscriptionButton:
    "!min-h-11 !min-w-26 !gap-1.5 !rounded-full !border !px-3.5 !text-xs !shadow-none [&:hover:not(:disabled)]:!translate-y-0",
  subscribed: "!border-lime !bg-lime/40 !text-foreground",
  unsubscribed:
    "!border-primary/20 !bg-primary/5 !text-primary hover:!bg-primary/10",
} as const;

export const avatarTones = [
  "[&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-primary/10 [&_.ui-avatar]:!text-primary",
  "[&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-lime/55 [&_.ui-avatar]:!text-foreground",
  "[&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-sunny/40 [&_.ui-avatar]:!text-foreground",
] as const;
