// Static Tailwind utility classes; no runtime CSS generation.
export const styles = {
  "ui-button":
    "ui-button inline-flex items-center justify-center gap-2 border border-transparent rounded-[13px] py-3 px-4.75 font-[650] text-[13px] cursor-pointer [transition:transform_0.15s,_box-shadow_0.15s,_background_0.15s] min-h-[42px] whitespace-nowrap border-2 [&:hover:not(:disabled)]:[transform:translateY(-2px)] [&.primary]:bg-primary-solid [&.primary]:text-on-primary [&.primary]:border-primary-edge [&.primary]:[box-shadow:0_3px_0_var(--color-primary-edge)] [&.primary:hover]:bg-primary-hover [&.secondary]:border-secondary-edge [&.secondary]:bg-surface [&.secondary]:text-foreground [&.secondary]:[box-shadow:0_3px_0_var(--color-secondary-shadow)] [&.ghost]:bg-transparent [&.ghost]:text-primary [&.danger]:bg-danger-soft [&.danger]:text-danger-ink [&.sm]:py-2 [&.sm]:px-3.25 [&.sm]:min-h-[34px] [&.sm]:text-[12px] [&:disabled]:opacity-[0.45] [&:disabled]:cursor-not-allowed [&:disabled]:[box-shadow:none] [&:active:not(:disabled)]:[transform:translateY(2px)] [&:active:not(:disabled)]:[box-shadow:none]",
  spinner:
    "spinner w-3.5 h-3.5 border-2 border-current [border-right-color:transparent] rounded-full animate-spin",
  "ui-badge":
    "ui-badge inline-flex items-center text-xs font-bold tracking-[0.04em] py-1.5 px-2.25 rounded-[8px] bg-surface-raised text-foreground [&.success]:bg-success-soft [&.success]:text-success-ink [&.warning]:bg-warning-soft [&.warning]:text-warning-ink [&.danger]:bg-danger-soft [&.danger]:text-danger-ink",
  "ui-tag":
    "ui-tag border border-line bg-surface rounded-[20px] py-2 px-3.25 text-[12px] cursor-pointer text-muted font-semibold [&[aria-pressed='true']]:bg-accent-soft [&[aria-pressed='true']]:border-secondary-edge [&[aria-pressed='true']]:text-primary",
  "ui-field":
    "ui-field flex flex-col gap-2.25 w-full [&_label]:text-[12px] [&_label]:font-[650] [&_input]:text-[13px] [&_input]:border-0 [&_input]:border-b-2 [&_input]:border-control-line [&_input]:rounded-t-control [&_input]:rounded-b-none [&_input]:px-3.25 [&_input]:py-3 [&_input]:bg-surface-raised [&_input:hover:not(:focus-visible)]:outline-2 [&_input:hover:not(:focus-visible)]:outline-control-line [&_input:focus]:border-primary [&_input[aria-invalid='true']]:border-danger-ink [&_input]:text-foreground [&_input]:w-full [&_input]:min-w-0 [&_textarea]:text-[13px] [&_textarea]:border-0 [&_textarea]:border-b-2 [&_textarea]:border-control-line [&_textarea]:rounded-t-control [&_textarea]:rounded-b-none [&_textarea]:px-3.25 [&_textarea]:py-3 [&_textarea]:bg-surface-raised [&_textarea:hover:not(:focus-visible)]:outline-2 [&_textarea:hover:not(:focus-visible)]:outline-control-line [&_textarea:focus]:border-primary [&_textarea[aria-invalid='true']]:border-danger-ink [&_textarea]:text-foreground [&_textarea]:w-full [&_textarea]:min-w-0 [&_textarea]:resize-y [&_textarea]:leading-[1.8] [&_select]:text-[13px] [&_select]:border-0 [&_select]:border-b-2 [&_select]:border-control-line [&_select]:rounded-t-control [&_select]:rounded-b-none [&_select]:px-3.25 [&_select]:py-3 [&_select]:bg-surface-raised [&_select:hover:not(:focus-visible)]:outline-2 [&_select:hover:not(:focus-visible)]:outline-control-line [&_select:focus]:border-primary [&_select[aria-invalid='true']]:border-danger-ink [&_select]:text-foreground [&_select]:w-full [&_select]:min-w-0 [&_input:disabled]:opacity-60 [&_input:disabled]:cursor-not-allowed [&_input:disabled]:text-muted [&_textarea:disabled]:opacity-60 [&_textarea:disabled]:cursor-not-allowed [&_textarea:disabled]:text-muted [&_small]:text-xs [&_small]:text-muted [&_.error-text]:text-danger-ink [&_.counter]:text-right [&_.counter]:[font-variant-numeric:tabular-nums] [&_.tag-input-shell_input]:[flex:1_1_150px] [&_.tag-input-shell_input]:w-auto [&_.tag-input-shell_input]:min-w-[120px] [&_.tag-input-shell_input]:[border:0] [&_.tag-input-shell_input]:p-1.75 [&_.tag-input-shell_input]:bg-transparent [&_.tag-input-shell_input]:[outline:none]",
  "ui-select-inline":
    "ui-select-inline flex items-center gap-2 text-xs text-muted [&_select]:rounded-t-control [&_select]:rounded-b-none [&_select]:border-0 [&_select]:border-b-2 [&_select]:border-control-line [&_select]:bg-surface-raised [&_select]:px-3 [&_select]:py-2 [&_select]:text-foreground",
  "ui-switch":
    'ui-switch inline-flex items-center gap-2.5 text-[13px] cursor-pointer relative [&_input]:absolute [&_input]:w-9 [&_input]:h-5.5 [&_input]:opacity-0 [&_>_span:first-of-type]:w-9 [&_>_span:first-of-type]:h-5.5 [&_>_span:first-of-type]:bg-secondary-edge [&_>_span:first-of-type]:rounded-[20px] [&_>_span:first-of-type]:p-0.75 [&_>_span:first-of-type::after]:[content:""] [&_>_span:first-of-type::after]:block [&_>_span:first-of-type::after]:w-4 [&_>_span:first-of-type::after]:h-4 [&_>_span:first-of-type::after]:bg-art-white [&_>_span:first-of-type::after]:rounded-full [&_>_span:first-of-type::after]:[transition:transform_0.15s] [&_input:checked_+_span]:bg-primary-solid [&_input:checked_+_span::after]:[transform:translateX(14px)] [&_input:focus-visible_+_span]:[outline:3px_solid_var(--color-primary)] [&_input:focus-visible_+_span]:outline-offset-[3px]',
  "ui-check":
    "ui-check inline-flex items-center gap-2.5 text-[13px] cursor-pointer [&_input]:accent-primary [&_input]:w-4.25 [&_input]:h-4.25",
  "ui-choice":
    "ui-choice [&_input]:accent-primary [&_input]:w-4.25 [&_input]:h-4.25 flex items-center gap-2.5 border border-line rounded-[12px] p-3.25 text-[13px] cursor-pointer [&.selected]:border-primary [&.selected]:bg-accent-soft",
  "ui-avatar":
    "ui-avatar inline-grid place-items-center w-10 h-10 rounded-full bg-accent-soft text-primary font-bold text-[14px] shrink-0 border-2 border-secondary-edge [&.sm]:w-7 [&.sm]:h-7 [&.sm]:text-xs [&.lg]:w-14 [&.lg]:h-14 [&.lg]:text-[20px]",
  "ui-card":
    "ui-card border border-line rounded-surface bg-surface p-6 min-w-0 max-[1100px]:p-5 max-[400px]:p-4.5",
  "ui-alert":
    "ui-alert flex gap-3 p-3.75 rounded-[8px] bg-success-soft text-success-ink text-[12px] [&_>_span]:font-extrabold [&_strong]:font-[650] [&_p]:text-xs [&_p]:mt-1.25 [&_p]:leading-[1.6] [&.warning]:bg-warning-soft [&.warning]:text-warning-ink [&.danger]:bg-danger-soft [&.danger]:text-danger-ink [&.neutral]:bg-neutral-soft [&.neutral]:text-neutral-ink",
  "ui-empty":
    "ui-empty text-center py-6.25 px-2.5 [&_>_span]:grid [&_>_span]:text-[35px] [&_>_span]:text-primary [&_>_span]:mb-4 [&_>_span]:bg-accent-soft [&_>_span]:rounded-[18px] [&_>_span]:w-15 [&_>_span]:h-15 [&_>_span]:mt-0 [&_>_span]:mx-auto [&_>_span]:mb-4 [&_>_span]:place-items-center [&_>_span]:[transform:rotate(-7deg)] [&_h3]:text-[16px] [&_p]:text-[12px] [&_p]:text-muted [&_p]:mt-2.5 [&_p]:mx-0 [&_p]:mb-5 [&_p]:leading-[1.7]",
  "ui-skeleton":
    "ui-skeleton grid gap-3 py-3.5 px-0 [&_span]:h-3.25 [&_span]:[background:linear-gradient(90deg,_var(--color-skeleton),_var(--color-skeleton-shine),_var(--color-skeleton))] [&_span]:[background-size:200%] [&_span]:animate-shimmer [&_span]:rounded-[5px] [&_span:nth-child(2)]:w-[85%] [&_span:last-child]:w-[60%]",
  "ui-progress":
    "ui-progress [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:text-[12px] [&_>_div]:mb-3 [&_progress]:w-full [&_progress]:h-1.75 [&_progress]:[border:0] [&_progress]:rounded-[10px] [&_progress]:overflow-hidden [&_progress]:accent-primary [&_progress::-webkit-progress-bar]:bg-surface-raised [&_progress::-webkit-progress-value]:bg-primary",
  "ui-code":
    "ui-code bg-code-surface rounded-[9px] text-code-string overflow-hidden text-[12px] [&_>_div]:flex [&_>_div]:justify-between [&_>_div]:py-3 [&_>_div]:px-4.25 [&_>_div]:border-b [&_>_div]:border-b-[#ffffff16] [&_>_div]:text-code-muted [&_>_div]:[font:12px_monospace] [&_pre]:p-4.75 [&_pre]:overflow-auto [&_pre]:leading-[1.9] [&_pre]:text-[12px] [&_pre]:[tab-size:2] [&_.hljs-keyword]:text-code-keyword [&_.hljs-selector-tag]:text-code-keyword [&_.hljs-literal]:text-code-keyword [&_.hljs-string]:text-code-string [&_.hljs-attr]:text-code-string [&_.hljs-number]:text-code-number [&_.hljs-built_in]:text-code-number [&_.hljs-comment]:text-code-comment [&_.hljs-title]:text-code-title [&_.hljs-function]:text-code-title",
  "ui-tabs":
    "ui-tabs flex overflow-x-auto whitespace-nowrap [&_button]:shrink-0 [&_button:disabled]:opacity-45 border-b border-b-line gap-5.5 [&_button]:[border:0] [&_button]:bg-transparent [&_button]:py-3 [&_button]:px-0 [&_button]:text-[12px] [&_button]:text-muted [&_button]:cursor-pointer [&_button]:border-b-2 [&_button]:border-b-transparent [&_button[aria-selected='true']]:text-primary [&_button[aria-selected='true']]:border-primary [&_button[aria-selected='true']]:font-bold",
  "tab-panel":
    "tab-panel pt-5.5 px-0 pb-0 text-[13px] text-muted",
  "ui-modal":
    "ui-modal m-auto border border-line rounded-surface bg-surface text-foreground [&::backdrop]:bg-[#18291e66] [&::backdrop]:[backdrop-filter:blur(3px)] [&_p]:text-[14px] [&_p]:text-muted [&_p]:leading-[1.8] [&_p]:mb-6.25",
  "modal-standard":
    "p-6.25 [width:min(440px,_calc(100%_-_32px))]",
  "modal-room":
    "w-[calc(100%_-_40px)] max-w-[1124px] p-3 md:w-[calc(100%_-_96px)]",
  "conversation-modal":
    "m-auto h-dvh max-h-dvh w-full max-w-none overflow-hidden border border-line bg-surface p-4 text-foreground open:flex open:flex-col sm:h-[min(850px,90dvh)] sm:w-[min(840px,calc(100%-48px))] sm:rounded-surface sm:p-6 [&::backdrop]:bg-black/50 [&::backdrop]:backdrop-blur-sm",
  "modal-header":
    "modal-header flex items-center justify-between mb-3.75 [&_h2]:text-[20px]",
  "ui-toast":
    "ui-toast fixed z-[30] bottom-6.25 left-[50%] [transform:translateX(-50%)] flex gap-3.5 items-center bg-primary-solid text-on-primary py-4 px-5 rounded-[16px] [box-shadow:0_10px_40px_#25382b25] text-[13px] [max-width:calc(100%_-_24px)] w-[max-content] [&_button]:bg-transparent [&_button]:[border:0] [&_button]:text-[inherit] [&_button]:text-[20px] [&_button]:cursor-pointer",
  "ui-coin":
    "ui-coin inline-flex gap-1.75 items-center text-[15px] font-bold [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:w-5.5 [&_>_span]:h-5.5 [&_>_span]:rounded-full [&_>_span]:bg-coin-body [&_>_span]:border-2 [&_>_span]:border-coin-edge [&_>_span]:text-coin-ink [&_>_span]:text-[12px] [&_small]:text-xs [&_small]:font-normal [&_small]:text-muted",
  pagination:
    "pagination flex items-center justify-center gap-1.5 [&_>_button:not(.ui-button)]:[border:0] [&_>_button:not(.ui-button)]:bg-transparent [&_>_button:not(.ui-button)]:w-8 [&_>_button:not(.ui-button)]:h-8 [&_>_button:not(.ui-button)]:rounded-[6px] [&_>_button:not(.ui-button)]:text-muted [&_>_button:not(.ui-button)]:cursor-pointer [&_>_button[aria-current='page']]:bg-primary-solid [&_>_button[aria-current='page']]:text-on-primary",
  "tag-input-shell":
    "tag-input-shell flex flex-wrap items-center gap-2 p-2.5 border-0 border-b-2 border-control-line rounded-t-control rounded-b-none bg-surface-raised [&:hover:not(:focus-within)]:outline-2 [&:hover:not(:focus-within)]:outline-control-line [&:focus-within]:border-primary",
  "tag-input-chip":
    "tag-input-chip inline-flex items-center gap-1.75 border border-line rounded-[9px] pt-1.25 pr-1.75 pb-1.25 pl-2.5 bg-surface-raised text-foreground text-[12px] max-w-[100%] [overflow-wrap:anywhere] [&_button]:[border:0] [&_button]:bg-transparent [&_button]:text-muted [&_button]:text-[19px] [&_button]:cursor-pointer [&_button]:min-w-[26px] [&_button]:min-h-[26px] [&_button]:rounded-[5px] [&_button:hover]:bg-accent-soft",
  "tag-input-help":
    "tag-input-help flex justify-between gap-3 text-muted text-xs leading-[1.6] [&_>_span:last-child]:whitespace-nowrap",
  "editor-title":
    "editor-title text-[12px] font-[650] flex items-center justify-between mb-2.5 [&_span]:[font:12px_monospace] [&_span]:text-muted",
  "markdown-editor":
    "markdown-editor [&_.tab-panel]:pt-0 [&_textarea]:block [&_textarea]:w-full [&_textarea]:min-h-[220px] [&_textarea]:resize-y [&_textarea]:border-0 [&_textarea]:border-t [&_textarea]:border-control-line [&_textarea]:rounded-none [&_textarea]:rounded-b-none [&_textarea]:bg-surface [&_textarea]:p-3.5 [&_textarea]:text-foreground [&_textarea]:[font:12px/1.9_monospace] [&_textarea]:[tab-size:2] [&_textarea]:outline-none [&_.error-text]:text-danger-ink [&_.error-text]:text-xs [&_.error-text]:mt-1.75",
  "markdown-editor-compact":
    "[&_textarea]:!min-h-36 [&_textarea]:!border-t-0 [&_textarea]:!rounded-none [&_textarea]:!p-4 [&_textarea]:!font-sans [&_textarea]:!text-base [&_textarea]:!leading-7 [&_.markdown-preview]:!min-h-36 [&_.markdown-preview]:rounded-xl [&_.markdown-preview]:border [&_.markdown-preview]:border-line [&_.markdown-preview]:bg-surface [&_.markdown-preview]:!p-4 [&_.markdown-preview]:!text-base [&_.markdown-preview]:!leading-7",
  "editor-shell":
    "editor-shell rounded-surface border border-line bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
  "editor-tools":
    "editor-tools flex items-center justify-end flex-wrap gap-2 p-2.5",
  "editor-picker":
    "editor-picker mx-2.5 mb-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 rounded-xl bg-canvas p-3",
  "editor-footer":
    "editor-footer flex justify-between gap-2.5 flex-wrap mt-2.5 text-xs text-muted",
  "markdown-preview":
    "markdown-preview min-h-[270px] [overflow-wrap:anywhere] py-4 px-1 text-foreground text-[13px] leading-[1.9] [&_>_*_+_*]:mt-3.5 [&_h1]:text-[24px] [&_h2]:text-[21px] [&_h3]:text-[18px] [&_ul]:pl-6 [&_ol]:pl-6 [&_blockquote]:border-l-3 [&_blockquote]:border-l-secondary-edge [&_blockquote]:pl-3.75 [&_blockquote]:text-muted [&_pre]:bg-code-surface [&_pre]:text-code-ink [&_pre]:rounded-[10px] [&_pre]:p-4 [&_pre]:overflow-auto [&_pre]:whitespace-pre [&_pre]:[tab-size:2] [&_pre]:text-[12px] [&_:not(pre)_>_code]:bg-surface-raised [&_:not(pre)_>_code]:py-0.5 [&_:not(pre)_>_code]:px-1.25 [&_:not(pre)_>_code]:rounded-[4px] [&_:not(pre)_>_code]:text-[12px] [&_a]:text-primary [&_a]:underline [&_.hljs-keyword]:text-code-keyword [&_.hljs-selector-tag]:text-code-keyword [&_.hljs-literal]:text-code-keyword [&_.hljs-string]:text-code-string [&_.hljs-attr]:text-code-string [&_.hljs-number]:text-code-number [&_.hljs-built_in]:text-code-number [&_.hljs-comment]:text-code-comment [&_.hljs-title]:text-code-title [&_.hljs-function]:text-code-title [&_ul]:list-disc [&_ol]:list-decimal [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold",
  "preview-placeholder": "preview-placeholder text-muted",
} as const;

// Shared by full-list navigation and full-list dialogs; distinct from purple editing actions.
export const viewAllAction =
  "inline-flex !min-h-11 items-center justify-center !rounded-lg !border-0 !bg-transparent !px-3 !py-2 !text-sm !font-semibold !text-muted !shadow-none !transform-none transition-colors hover:!bg-canvas hover:!text-foreground focus-visible:outline-2 focus-visible:!outline-foreground";

// Single size for every page-level h1 so sibling screens share one heading scale.
export const pageTitle =
  "text-2xl font-bold leading-8 tracking-tight text-foreground";

// One search box look: leading icon, 48px filled input with a bottom rule (same as ui-field). The submit button keeps the default 3D Button and only matches the input height.
export const searchFieldStyle =
  "relative min-w-0 flex-1 [&_input]:!h-12 [&_input]:!rounded-t-control [&_input]:!rounded-b-none [&_input]:!border-0 [&_input]:!border-b-2 [&_input]:!border-control-line [&_input]:!bg-surface-raised [&_input]:!pl-10 [&_input]:!pr-3 [&_input]:!text-base [&_input]:placeholder:text-muted [&_input:hover:not(:focus-visible)]:outline-2 [&_input:hover:not(:focus-visible)]:outline-control-line [&_input:focus]:!border-primary [&_input[aria-invalid='true']]:!border-danger-ink [&_small]:px-2";
export const searchButtonStyle =
  "!min-h-12 !rounded-2xl !px-5";
export const searchFormStyle =
  "flex items-start gap-2 sm:gap-3";

// Card surfaces. Solid is the default; the dashed note surface is for browse/reward cards (tags, shop).
export const cardSurface =
  "rounded-surface border border-line bg-surface";
export const noteSurface =
  "rounded-surface border-2 border-dashed border-control-line bg-canvas";
