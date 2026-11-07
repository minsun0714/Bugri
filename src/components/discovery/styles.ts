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
  grid: "grid gap-3 md:grid-cols-2 sm:gap-4",
  card: "flex min-w-0 flex-col gap-4 rounded-3xl border border-line bg-surface p-4 shadow-[0_3px_0_var(--color-line)] sm:p-5",
  label:
    "inline-block min-w-0 max-w-full break-all rounded-2xl bg-lime/45 px-3 py-2 text-base font-bold leading-6 tracking-tight sm:text-lg",
  subscribed:
    "inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary",
  footer:
    "flex flex-wrap items-center justify-between gap-x-3 gap-y-2",
  count:
    "inline-flex items-center gap-1.5 text-sm text-muted",
  learn:
    "!min-h-11 !rounded-2xl !border-primary/10 !bg-primary/10 !px-4 !text-primary !shadow-none hover:!bg-primary/15",
  subscribe:
    "!min-h-11 !rounded-2xl !border-primary/15 !bg-surface !px-4 !text-primary !shadow-none hover:!bg-primary/5",
  empty:
    "flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-muted break-keep [overflow-wrap:anywhere]",
};
