const timeline =
  "motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-timeline:--learning-story] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-range:contain_0%_contain_61.538%]";

export const landingStyles = {
  scene:
    "grid items-center gap-6 md:grid-cols-2 md:gap-12 motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:absolute motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:inset-0",
  deskScene:
    "flex flex-col justify-center gap-3 motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:absolute motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:inset-0",
  copy: "relative z-10",
  headline:
    "font-sans text-[clamp(2rem,4.3vw,3.75rem)] leading-[1.4] font-medium tracking-[-0.025em] text-foreground",
  deskHeadline:
    "font-sans text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[1.4] font-medium tracking-[-0.025em] text-foreground",
  description:
    "mt-5 max-w-sm break-keep text-sm leading-7 font-normal text-muted md:text-base",
  puzzle: `motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-story-puzzle ${timeline}`,
  desk: `motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-story-desk ${timeline}`,
  coin: `motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-story-coin ${timeline}`,
  item: `motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-story-item ${timeline}`,
};
