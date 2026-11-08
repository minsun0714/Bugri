"use client";

import Link from "next/link";
import { useLandingReturn } from "@/components/landing/use-landing-return";
import { KnowledgePuzzle } from "@/components/landing/knowledge-puzzle";
import { RewardDesk } from "@/components/landing/reward-desk";
import { styles } from "@/components/ui/styles";
import { landingStyles } from "@/components/landing/styles";
import { useTranslation } from "@/lib/i18n/use-translation";

export function GuestLanding() {
  const t = useTranslation();
  const section = useLandingReturn();

  return (
    <section
      ref={section}
      aria-labelledby="landing-title"
      className="relative mb-12 [view-timeline-name:--learning-story] [view-timeline-axis:block] motion-safe:[@media(min-height:700px)]:supports-[animation-timeline:view()]:h-[490svh]"
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
                <span className="text-primary">
                  {t("내 것이 되는 순간.")}
                </span>
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
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <h2 className="text-[clamp(1.75rem,3.4vw,3rem)] leading-tight font-extrabold tracking-[-0.04em]">
                {t("모은 코인으로,")}
                <br className="md:hidden" />
                <span className="text-primary md:ml-2">
                  {t("버그리의 공간을 꾸며요.")}
                </span>
              </h2>
              <p className="mx-auto mt-3 max-w-xl break-keep text-sm leading-6 text-muted">
                {t(
                  "학습 보상 BugCoin으로 상점에서 아이템을 고르고, 나만의 데스크를 꾸며요.",
                )}
              </p>
            </div>
            <RewardDesk />
          </div>
        </div>
        <div className="mt-7 flex items-center justify-between gap-5 border-t border-line pt-4 text-xs text-muted">
          <span>{t("읽고, 풀고, 나만의 공간으로.")}</span>
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
          >
            {t("상점 둘러보기")}
          </Link>
        </div>
      </div>
    </section>
  );
}
