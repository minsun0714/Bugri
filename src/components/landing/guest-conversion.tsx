"use client";

import { Button } from "@/components/ui";
import { useDemoSession } from "@/components/navigation/demo-session";
import { useTranslation } from "@/lib/i18n/use-translation";

export function GuestConversion() {
  const t = useTranslation();
  const { signIn } = useDemoSession();

  return (
    <section
      aria-labelledby="guest-continue-title"
      className="flex flex-col gap-5 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2
          id="guest-continue-title"
          className="text-xl font-bold"
        >
          {t("이제, 내 공간을 채워볼까요?")}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">
          {t(
            "코인은 사용자 선택 후 학습부터 쌓여요. 체험 보상은 이월되지 않아요.",
          )}
        </p>
      </div>
      <Button
        onClick={() => signIn()}
        className="self-end sm:shrink-0"
      >
        {t("데모 사용자로 계속하기")}
      </Button>
    </section>
  );
}
