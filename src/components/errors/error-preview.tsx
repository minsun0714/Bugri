"use client";
import { useTranslation } from "@/lib/i18n/use-translation";

import { useState } from "react";
import { QueryRecoveryPreview } from "@/components/errors/query-preview";
import { Button } from "@/components/ui";

export function ErrorPreview() {
  const t = useTranslation();

  const [failed, setFailed] = useState(false);

  if (failed) throw new Error("Error boundary preview");

  return (
    <main className="p-6">
      <h1>{t("오류 복구 미리보기")}</h1>
      <Button onClick={() => setFailed(true)}>
        {t("렌더링 오류 재현")}
      </Button>
      <QueryRecoveryPreview />
    </main>
  );
}
