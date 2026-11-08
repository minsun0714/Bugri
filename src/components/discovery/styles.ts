export const tagDiscoveryStyles = {
  heading:
    "flex min-h-11 items-center gap-3 sm:min-h-14 sm:gap-4",
  searchPanel:
    "space-y-4 rounded-surface border border-line bg-surface p-3 sm:p-5",
  filters:
    "flex w-fit max-w-full flex-wrap gap-1 rounded-2xl bg-canvas p-1",
  filterButton:
    "!min-h-11 !rounded-xl !border-0 !px-4 !shadow-none !transition-colors hover:!translate-y-0 active:!translate-y-0 [&[aria-pressed=true]]:!bg-primary-solid [&[aria-pressed=true]]:!text-on-primary [&[aria-pressed=false]]:!bg-transparent [&[aria-pressed=false]]:!text-muted",
  grid: "grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3",
  icon: "flex size-10 shrink-0 items-center justify-center font-mono text-2xl font-bold text-primary",
  card: "flex min-w-0 flex-col gap-4 rounded-surface border-2 border-dashed border-control-line bg-canvas p-4 sm:p-5",
  subscribed:
    "inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary",
  footer:
    "mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-control-line pt-3",
  learn:
    "!min-h-11 !rounded-2xl !border-primary/10 !bg-primary/10 !px-4 !text-primary !shadow-none hover:!bg-primary/15",
  subscribe:
    "!min-h-11 !rounded-2xl !border-primary/15 !bg-surface !px-4 !text-primary !shadow-none hover:!bg-primary/5",
  empty:
    "flex flex-col items-center gap-4 rounded-surface border border-line bg-surface px-5 py-8 text-center text-sm text-muted break-keep [overflow-wrap:anywhere]",
};

export const discoveryStyles = {
  card: "flex min-w-0 flex-col gap-3 rounded-surface border border-l-4 border-line border-l-primary bg-surface p-4 sm:p-5 transition-colors hover:border-l-foreground",
  personLink:
    "inline-flex min-h-11 max-w-full items-center rounded-lg break-all text-lg font-bold tracking-tight text-foreground hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  quizLink:
    "inline-flex min-h-11 items-center gap-1.5 rounded-xl text-xs text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  subscriptionButton:
    "!min-h-11 !min-w-26 !gap-1.5 !rounded-full !border !px-3.5 !text-xs !shadow-none [&:hover:not(:disabled)]:!translate-y-0",
  subscribed:
    "!border-lime !bg-success-soft !text-foreground",
  unsubscribed:
    "!border-primary/20 !bg-primary/5 !text-primary hover:!bg-primary/10",
} as const;

export const avatarTones = [
  "[&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-primary/10 [&_.ui-avatar]:!text-primary",
  "[&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-success-soft [&_.ui-avatar]:!text-foreground",
  "[&_.ui-avatar]:!size-12 [&_.ui-avatar]:!rounded-2xl [&_.ui-avatar]:!border-0 [&_.ui-avatar]:!bg-warning-soft [&_.ui-avatar]:!text-foreground",
] as const;
