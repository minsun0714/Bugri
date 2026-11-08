import { pageTitle } from "@/components/ui/styles";

export const solvingStyles = {
  frame: "w-full space-y-5",
  supportLink:
    "inline-flex min-h-9 items-center rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-primary",
  card: "space-y-6 [&.ui-card]:rounded-sm [&.ui-card]:border-line [&.ui-card]:p-4 sm:[&.ui-card]:p-6 [&_.ui-button]:rounded-xl [&_.ui-button.primary]:border-primary [&_.ui-button.secondary]:border-line [&_.ui-button.primary]:shadow-none [&_.ui-button.secondary]:shadow-none [&_.ui-button:hover:not(:disabled)]:transform-none [&_.ui-button:active:not(:disabled)]:transform-none",
  answerForm:
    "space-y-6 border-t border-line pt-5 [&_.ui-choice]:min-h-14 [&_.ui-choice]:gap-3 [&_.ui-choice]:px-4 [&_.ui-choice]:py-3 [&_.ui-choice]:text-base [&_.ui-choice]:leading-6 [&_.ui-choice]:bg-surface [&_.ui-choice]:transition-colors [&_.ui-choice.selected]:border-primary [&_.ui-choice.selected]:bg-primary/5 [&_.ui-choice:hover]:border-primary/50 [&_.ui-choice:not(.selected):hover]:bg-canvas [&_.ui-choice_input]:size-4.5 [&_.ui-choice_input]:shrink-0 [&_.ui-choice_span]:min-w-0 [&_.ui-choice_span]:break-keep [&_.ui-choice_span]:[overflow-wrap:anywhere]",
  title: pageTitle,
  tagFilter:
    "w-full sm:w-64 [&>div]:grid-cols-[auto_1fr] [&>div]:items-center [&>div]:gap-3 [&>div>span]:text-muted [&>div>button]:rounded-none [&>div>button]:font-medium",
};
