"use client";

import localFont from "next/font/local";
import { useLandingReturn } from "@/components/landing/use-landing-return";
import { KnowledgePuzzle } from "@/components/landing/knowledge-puzzle";
import { RewardDesk } from "@/components/landing/reward-desk";
import { styles } from "@/components/ui/styles";
import { landingStyles } from "@/components/landing/styles";
import { useTranslation } from "@/lib/i18n/use-translation";

const editorial = localFont({
  src: "./fonts/hahmlet-medium.woff2",
  weight: "500",
  display: "swap",
  variable: "--font-landing-editorial",
  fallback: ["Batang", "Georgia", "serif"],
});

export function GuestLanding() {
  const t = useTranslation();
  const section = useLandingReturn();

  return (
    <section
      ref={section}
      aria-labelledby="landing-title"
      className={`${editorial.variable} relative mb-12 [view-timeline-name:--learning-story] [view-timeline-axis:block] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:h-[490svh]`}
    >
      <div className="py-6 motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:sticky motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:top-0 motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:flex motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:h-svh motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:max-h-[1000px] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:flex-col motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:justify-center md:py-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-muted">
            {t("기억에 남는 공부")}
          </span>
          <a
            href="#guest-quiz"
            onClick={() =>
              document
                .getElementById("guest-quiz")
                ?.focus({ preventScroll: true })
            }
            className={`${styles["ui-button"]} secondary sm`}
          >
            {t("바로 퀴즈 풀기")}{" "}
            <span aria-hidden="true">↘</span>
          </a>
        </div>
        <div className="relative space-y-16 motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:h-[min(72svh,680px)] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:space-y-0">
          <div
            className={`${landingStyles.scene} ${landingStyles.puzzle}`}
          >
            <div className={landingStyles.copy}>
              <h1
                id="landing-title"
                className={landingStyles.headline}
              >
                {t("흩어진 지식이,")}
                <br />
                {t("내 것이 되는 순간.")}
              </h1>
              <p className={landingStyles.description}>
                {t("퀴즈로 꺼내보고, 이해하고, 연결해요.")}
              </p>
            </div>
            <div className="mx-auto aspect-[400/340] w-full max-w-xl">
              <KnowledgePuzzle />
            </div>
          </div>
          <div
            className={`${landingStyles.deskScene} ${landingStyles.desk}`}
          >
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <h2 className={landingStyles.deskHeadline}>
                {t("퀴즈를 풀고,")}
                <br className="md:hidden" />
                <span className="md:ml-2">
                  {t("버그리의 공간을 꾸며요.")}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl break-keep text-sm leading-7 font-normal text-muted md:text-base">
                {t(
                  "퀴즈를 풀고 받은 버그코인으로 상점에서 아이템을 골라요.",
                )}
              </p>
            </div>
            <RewardDesk />
          </div>
        </div>
      </div>
    </section>
  );
}
