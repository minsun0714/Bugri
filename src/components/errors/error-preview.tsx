"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function ErrorPreview() {
  const [failed, setFailed] = useState(false);

  if (failed) throw new Error("Error boundary preview");

  return (
    <main className="p-6">
      <h1>오류 복구 미리보기</h1>
      <Button onClick={() => setFailed(true)}>
        렌더링 오류 재현
      </Button>
    </main>
  );
}
