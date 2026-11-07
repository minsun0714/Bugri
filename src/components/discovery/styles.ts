export const tagDiscoveryStyles = {
  heading:
    "flex min-h-11 items-center gap-3 sm:min-h-14 sm:gap-4",
  searchPanel:
    "space-y-4 rounded-3xl border border-line bg-surface p-3 shadow-[0_3px_0_var(--color-line)] sm:p-5",
  searchForm:
    "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-3",
  searchField:
    "min-w-0 [&_input]:!h-12 [&_input]:!rounded-2xl [&_input]:!bg-canvas [&_input]:!text-sm [&_input]:placeholder:text-muted",
  searchButton:
    "!h-12 !min-h-12 !rounded-2xl !px-4 !shadow-none sm:!px-6",
  filters:
    "flex w-fit max-w-full flex-wrap gap-1 rounded-2xl bg-canvas p-1",
  filterButton:
    "!min-h-11 !rounded-xl !border-0 !px-4 !shadow-none !transition-colors hover:!translate-y-0 active:!translate-y-0 [&[aria-pressed=true]]:!bg-primary [&[aria-pressed=true]]:!text-white [&[aria-pressed=false]]:!bg-transparent [&[aria-pressed=false]]:!text-muted",
  grid: "grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3",
  icon: "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-lime/55 text-lg font-bold text-primary",
  card: "flex min-w-0 flex-col gap-4 rounded-3xl border border-line bg-surface p-4 shadow-[0_3px_0_var(--color-line)] sm:p-5",
  subscribed:
    "inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary",
  footer:
    "mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3",
  learn:
    "!min-h-11 !rounded-2xl !border-primary/10 !bg-primary/10 !px-4 !text-primary !shadow-none hover:!bg-primary/15",
  subscribe:
    "!min-h-11 !rounded-2xl !border-primary/15 !bg-surface !px-4 !text-primary !shadow-none hover:!bg-primary/5",
  empty:
    "flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-muted break-keep [overflow-wrap:anywhere]",
};

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
