import { expect, test } from "@playwright/test";

test("generation focuses on requests, preserves conversation and saves to a separate owner list", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring");
  await expect(
    page.getByRole("region", { name: "내 퀴즈 목록" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("combobox", { name: "더미 사용자" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill(
      "타입스크립트\n```ts\n  const value = 1;\n```\n😀",
    );
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("dialog", {
      name: "버그리와 퀴즈 다듬기",
    }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/authoring\/results/);
  const candidates = page.getByRole("region", {
    name: "생성 후보",
  });
  await expect(
    candidates.getByRole("tab", {
      name: /^퀴즈 [1-4]$/,
    }),
  ).toHaveCount(4);
  await page
    .getByRole("button", { name: "LLM으로 수정" })
    .click();
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .fill("예시 추가");
  await page
    .getByRole("button", { name: "요청 보내기" })
    .click();
  await expect(
    page.getByRole("list", { name: "추가 요청 기록" }),
  ).toContainText("예시 추가");
  await expect(
    candidates.getByRole("article"),
  ).toContainText("Mock 재생성: 예시 추가");
  await page.reload();
  await page
    .getByRole("button", { name: "LLM으로 수정" })
    .click();
  await expect(
    page.getByRole("list", { name: "추가 요청 기록" }),
  ).toContainText("예시 추가");
  await page
    .getByRole("button", { name: "직접 수정" })
    .click();
  await page
    .getByRole("textbox", { name: "제목", exact: true })
    .fill("직접 다듬은 퀴즈");
  await page
    .getByRole("button", { name: "수정 반영" })
    .click();
  await expect(
    candidates.getByRole("article"),
  ).toContainText("직접 다듬은 퀴즈");
  await page
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: /학습 내용/ }),
  ).toHaveValue(
    "타입스크립트\n```ts\n  const value = 1;\n```\n😀",
  );
  const previousBatchUrl = page.url();
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  await expect(page).not.toHaveURL(previousBatchUrl);
  await expect(
    candidates.getByRole("article"),
  ).not.toContainText("직접 다듬은 퀴즈");
  const management = await page.context().newPage();
  await management.goto("/quizzes/authoring/manage");
  await expect(
    management.getByText("저장한 퀴즈가 없습니다"),
  ).toBeVisible();
  await candidates
    .getByRole("button", { name: "임시저장", exact: true })
    .click();
  await expect(
    candidates.getByText("임시저장됨", { exact: true }),
  ).toBeVisible();
  for (let index = 2; index <= 4; index += 1) {
    await candidates
      .getByRole("tab", {
        name: `퀴즈 ${index}`,
        exact: true,
      })
      .click();
    await candidates
      .getByRole("button", {
        name: "임시저장",
        exact: true,
      })
      .click();
    await expect(
      candidates.getByText("임시저장됨", { exact: true }),
    ).toBeVisible();
  }
  await expect(
    candidates.getByRole("tab", {
      name: /^퀴즈 [1-4] · 임시저장됨$/,
    }),
  ).toHaveCount(4);
  await management.reload();
  await expect(
    management
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(4);
  await management.goto(
    "/quizzes/authoring/manage?user=friend",
  );
  await expect(
    management
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(2);
  await management.goto(
    "/quizzes/authoring/manage?user=learner",
  );
  await expect(
    management
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(4);
});

test("review, approve, revise, regenerate, change visibility and delete", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quizzes/authoring");
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill(
      "```ts\n  const n = 1;\n```\n<script>alert(1)</script>",
    );
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "임시저장", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "검토·승인" })
    .click();
  const review = page.getByRole("region", {
    name: "퀴즈 검토",
    exact: true,
  });
  await expect(
    review.getByRole("button", {
      name: "선택한 범위로 승인",
    }),
  ).toBeDisabled();
  await review
    .getByLabel("제목", { exact: true })
    .fill("내 첫 퀴즈");
  await expect(
    review.getByRole("button", { name: "검토 완료 저장" }),
  ).toBeDisabled();
  await review
    .getByRole("button", { name: "내용 저장", exact: true })
    .click();
  await review
    .getByRole("button", { name: "검토 완료 저장" })
    .click();
  await review
    .getByRole("combobox", { name: "승인 공개 범위" })
    .click();
  await review
    .getByRole("option", { name: "공개", exact: true })
    .click();
  await review
    .getByRole("button", { name: "선택한 범위로 승인" })
    .click();
  await expect(review.getByRole("status")).toHaveText(
    "승인했습니다.",
  );
  await page.reload();
  await expect(
    review.getByLabel("제목", { exact: true }),
  ).toHaveValue("내 첫 퀴즈");
  await review
    .getByLabel("제목", { exact: true })
    .fill("수정본 제목");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "목록으로" })
    .click();
  await expect(
    review.getByLabel("제목", { exact: true }),
  ).toHaveValue("수정본 제목");
  await review
    .getByRole("button", { name: "내용 저장", exact: true })
    .click();
  await expect(
    review.getByText("내 첫 퀴즈 · PUBLIC"),
  ).toBeVisible();
  await review
    .getByRole("button", { name: "검토 완료 저장" })
    .click();
  await expect(
    review.getByRole("combobox", {
      name: "승인 공개 범위",
    }),
  ).toHaveText("공개");
  await review
    .getByRole("button", { name: "선택한 범위로 승인" })
    .click();
  await review
    .getByLabel("추가 프롬프트")
    .fill("예시 추가");
  await review
    .getByRole("button", { name: "수정본 재생성" })
    .click();
  await expect(review.getByRole("status")).toHaveText(
    "수정본을 생성했습니다. 내용을 검토하세요.",
  );
  await expect(
    review.getByText("수정본 제목 · PUBLIC"),
  ).toBeVisible();
  await expect(
    review.getByRole("button", {
      name: "선택한 범위로 승인",
    }),
  ).toBeDisabled();
  await review
    .getByRole("button", { name: "검토 완료 저장" })
    .click();
  await review
    .getByRole("button", { name: "선택한 범위로 승인" })
    .click();
  await review
    .getByRole("combobox", { name: "변경할 공개 범위" })
    .click();
  await review
    .getByRole("option", { name: "나만 풀기", exact: true })
    .click();
  await review
    .getByRole("button", {
      name: "공개 범위 변경",
      exact: true,
    })
    .click();
  await expect(
    review.getByText("수정본 제목 · PRIVATE"),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    390,
  );
  page.once("dialog", (dialog) => dialog.accept());
  await review
    .getByRole("button", { name: "퀴즈 삭제", exact: true })
    .click();
  await expect(
    page.getByText("퀴즈를 삭제했습니다."),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(0);
});

test("stale tabs cannot overwrite and keep unsaved edits", async ({
  page,
  context,
}) => {
  await page.goto(
    "/quizzes/authoring/manage?user=author&quiz=seed-quiz-1",
  );
  const other = await context.newPage();
  await other.goto(
    "/quizzes/authoring/manage?user=author&quiz=seed-quiz-1",
  );
  await expect(
    other.getByLabel("제목", { exact: true }),
  ).toHaveValue("타입 선언");
  await page
    .getByLabel("제목", { exact: true })
    .fill("먼저 저장한 제목");
  await page
    .getByRole("button", { name: "내용 저장", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
  );
  await other
    .getByLabel("제목", { exact: true })
    .fill("다른 탭 편집");
  await other
    .getByRole("button", { name: "내용 저장", exact: true })
    .click();
  await expect(
    other
      .getByRole("region", {
        name: "퀴즈 검토",
        exact: true,
      })
      .getByRole("alert"),
  ).toContainText("다른 탭에서 변경되었습니다");
  await expect(
    other.getByLabel("제목", { exact: true }),
  ).toHaveValue("다른 탭 편집");
  other.once("dialog", (dialog) => dialog.accept());
  await other
    .getByRole("button", {
      name: "최신 내용 다시 불러오기",
    })
    .click();
  await expect(
    other.getByLabel("제목", { exact: true }),
  ).toHaveValue("먼저 저장한 제목");
});

test("supplementary help opens on hover, focus and mobile tap", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring");
  const help = page.getByRole("button", {
    name: "퀴즈 만들기 도움말",
  });
  await expect(help).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await help.hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "Mock 퀴즈",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await help.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await help.click();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    390,
  );
  await page
    .getByRole("heading", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("management dropdown retains keyboard and mobile dismissal", async ({
  page,
}) => {
  await page.goto(
    "/quizzes/authoring/manage?user=author&quiz=seed-quiz-1",
  );
  const trigger = page.getByRole("combobox", {
    name: "변경할 공개 범위",
  });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("공개");
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    390,
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByRole("heading", {
      name: "현재 버전 공개 범위",
      exact: true,
    })
    .click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("new generation discards previous pending requests on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quizzes/authoring");
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill("클로저");
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "버그리와 퀴즈 다듬기",
  });
  await expect(dialog).toBeVisible();
  await page
    .getByRole("button", { name: "LLM으로 수정" })
    .click();
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .fill("더 어렵게");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "LLM으로 수정" })
    .click();
  await expect(
    page.getByLabel("퀴즈 1에 추가 요청"),
  ).toHaveValue("");
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .fill("새로운 요청");
  const bounds = await dialog.boundingBox();
  expect(bounds?.width).toBe(390);
  expect(bounds?.height).toBe(844);
  await page
    .getByRole("button", { name: "요청 보내기" })
    .click();
  await expect(
    page.getByRole("list", { name: "추가 요청 기록" }),
  ).toContainText("새로운 요청");
});

test("initial results hide chat and publish only the displayed quiz", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring");
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill("타입스크립트");
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", {
      name: "바로 공개",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByLabel("퀴즈 1에 추가 요청"),
  ).toHaveCount(0);
  await dialog
    .getByRole("button", { name: "바로 공개", exact: true })
    .click();
  await expect(dialog.getByRole("status")).toHaveText(
    "공개했습니다.",
  );
  await expect(
    dialog.getByRole("tab", { name: "퀴즈 1 · 공개됨" }),
  ).toBeVisible();
  await expect(
    dialog.getByText("공개됨", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    dialog.getByRole("tab", { name: "퀴즈 1 · 공개됨" }),
  ).toBeVisible();
  await dialog
    .getByRole("link", { name: "검토·승인" })
    .click();
  await expect(
    page.getByRole("region", {
      name: "퀴즈 검토",
      exact: true,
    }),
  ).toContainText("PUBLIC");
});

test("quiz tabs support keyboard selection and editing and saving are immediately visible", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring");
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill("타입");
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  const tabs = page.getByRole("tablist", {
    name: "퀴즈 선택",
  });
  await expect(tabs.getByRole("tab")).toHaveCount(4);
  await tabs
    .getByRole("tab", { name: "퀴즈 1", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    tabs.getByRole("tab", { name: "퀴즈 2", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("button", { name: "더 보기" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "직접 수정" }),
  ).toBeVisible();
  const modes = page;
  await modes
    .getByRole("button", {
      name: "LLM으로 수정",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    modes.getByRole("button", { name: "LLM으로 수정" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByLabel("퀴즈 2에 추가 요청")
    .fill("추가 예시");
  await modes
    .getByRole("button", {
      name: "LLM으로 수정",
      exact: true,
    })
    .click();
  await expect(
    page.getByLabel("퀴즈 2에 추가 요청"),
  ).toHaveCount(0);
  await modes
    .getByRole("button", { name: "LLM으로 수정" })
    .click();
  await expect(
    page.getByLabel("퀴즈 2에 추가 요청"),
  ).toHaveValue("추가 예시");

  await expect(
    page.getByRole("button", {
      name: "임시저장",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "남은 후보 모두 저장",
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("list", { name: "선택지" }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toContainText(
    "객관식 · 모두 선택",
  );
});

test("unconfirmed direct edits survive mode and quiz tab changes", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring");
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill("타입");
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();
  const modes = page;
  const quizzes = page.getByRole("tablist", {
    name: "퀴즈 선택",
  });
  await modes
    .getByRole("button", { name: "직접 수정" })
    .click();
  await page
    .getByRole("textbox", { name: "제목", exact: true })
    .fill("미확정 제목");
  await modes
    .getByRole("button", { name: "LLM으로 수정" })
    .click();
  await expect(
    page.getByLabel("퀴즈 1에 추가 요청"),
  ).toBeVisible();
  await modes
    .getByRole("button", {
      name: "LLM으로 수정",
      exact: true,
    })
    .click();
  await modes
    .getByRole("button", { name: "직접 수정" })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "제목",
      exact: true,
    }),
  ).toHaveValue("미확정 제목");
  await quizzes
    .getByRole("tab", { name: "퀴즈 2", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "남은 후보 모두 저장",
    }),
  ).toHaveCount(0);
  await quizzes
    .getByRole("tab", { name: "퀴즈 1", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "제목",
      exact: true,
    }),
  ).toHaveValue("미확정 제목");
  await page
    .getByRole("button", { name: "수정 반영" })
    .click();
  await expect(page.getByRole("article")).toContainText(
    "미확정 제목",
  );
});

test("creation input and live preview remain visible together on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring");
  const input = page.getByRole("textbox", {
    name: /학습 내용/,
  });
  const preview = page.getByRole("region", {
    name: "미리보기",
    exact: true,
  });
  await expect(
    page.getByRole("tab", { name: "작성", exact: true }),
  ).toHaveCount(0);
  await input.fill(
    "# 실시간 미리보기\n\n```typescript\nconst value = 1;\n```",
  );
  await expect(input).toBeVisible();
  await expect(
    preview.getByRole("heading", {
      name: "실시간 미리보기",
    }),
  ).toBeVisible();
  await expect(preview).toContainText("const value = 1;");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(input).toBeVisible();
  await expect(preview).toBeVisible();
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    390,
  );
  await input.fill("바꾼 내용");
  await expect(preview).toContainText("바꾼 내용");
});
