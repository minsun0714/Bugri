"use client";

import { useTranslation } from "@/lib/i18n/use-translation";

const pieces = [
  {
    label: "?",
    path: "M80 40H200V80C220 65 220 115 200 100V160H160C175 140 125 140 140 160H80Z",
    x: 132,
    y: 104,
    className:
      "fill-primary-solid text-on-primary motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-puzzle-question",
  },
  {
    label: "{ }",
    path: "M200 40H320V160H280C295 180 245 180 260 160H200V100C220 115 220 65 200 80Z",
    x: 262,
    y: 104,
    className:
      "fill-lime text-bugri-ink motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-puzzle-recall",
  },
  {
    label: "✓",
    path: "M80 160H140C125 140 175 140 160 160H200V200C180 185 180 235 200 220V280H80Z",
    x: 132,
    y: 226,
    className:
      "fill-accent-soft text-foreground motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-puzzle-understand",
  },
  {
    label: "( )",
    path: "M200 160H260C245 180 295 180 280 160H320V280H200V220C180 235 180 185 200 200Z",
    x: 262,
    y: 226,
    className:
      "fill-surface-raised text-foreground motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-puzzle-connect",
  },
];

export function KnowledgePuzzle() {
  const t = useTranslation();

  return (
    <svg
      viewBox="0 0 400 340"
      role="img"
      aria-label={t(
        "질문, 회상, 이해, 연결 조각이 하나의 지식으로 맞춰지는 퍼즐",
      )}
      className="h-full w-full overflow-visible"
    >
      {pieces.map(({ label, path, x, y, className }) => (
        <g
          key={label}
          className={`${className} origin-center motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-timeline:--learning-story] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-range:contain_0%_contain_61.538%]`}
        >
          <path
            d={path}
            className="stroke-canvas stroke-[3]"
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-current text-[17px] font-bold"
          >
            {t(label)}
          </text>
        </g>
      ))}
      <text
        x="200"
        y="325"
        textAnchor="middle"
        className="fill-primary text-[15px] font-bold motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:animate-puzzle-caption motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-timeline:--learning-story] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:[animation-range:contain_0%_contain_61.538%]"
      >
        {t("하나씩 연결된, 내 지식")}
      </text>
    </svg>
  );
}
