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
  const chat = page.getByRole("region", {
    name: "버그리와 대화",
  });
  await expect(chat).toBeVisible();
  const workspace = page.getByRole("region", {
    name: "퀴즈 작업 본문",
  });
  await expect(workspace).toHaveCSS("overflow-y", "hidden");
  await expect(
    chat.getByRole("log", { name: "대화 내용" }),
  ).toHaveCSS("overflow-y", "auto");
  const prompt = page.getByLabel("퀴즈 1에 추가 요청");
  await expect(prompt).toHaveJSProperty(
    "tagName",
    "TEXTAREA",
  );
  await prompt.focus();
  const promptBox = await prompt.boundingBox();
  const workspaceBox = await workspace.boundingBox();
  expect(promptBox).not.toBeNull();
  expect(workspaceBox).not.toBeNull();
  expect(promptBox!.x - 7).toBeGreaterThanOrEqual(
    workspaceBox!.x,
  );
  expect(
    promptBox!.x + promptBox!.width + 7,
  ).toBeLessThanOrEqual(
    workspaceBox!.x + workspaceBox!.width,
  );
  expect(
    promptBox!.y + promptBox!.height + 7,
  ).toBeLessThanOrEqual(
    workspaceBox!.y + workspaceBox!.height,
  );
  await expect(
    page.getByRole("tablist", { name: "퀴즈 선택" }),
  ).toHaveCount(0);
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .fill("예시 추가");
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .press("Shift+Enter");
  await expect(
    page.getByLabel("퀴즈 1에 추가 요청"),
  ).toHaveValue("예시 추가\n");
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .fill("예시 추가");
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .press("Enter");
  await expect(
    page.getByRole("list", { name: "추가 요청 기록" }),
  ).toContainText("예시 추가");
  await expect(chat).toContainText(
    "Mock 재생성: 예시 추가",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "LLM으로 수정" })
    .click();
  await expect(
    page.getByRole("list", { name: "추가 요청 기록" }),
  ).toContainText("예시 추가");
  await page
    .getByRole("button", { name: "퀴즈로 돌아가기" })
    .click();
  await page
    .getByRole("button", { name: "직접 수정" })
    .click();
  await expect(
    page.getByRole("list", { name: "선택지" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "제목", exact: true })
    .fill("직접 다듬은 퀴즈");
  await page
    .getByRole("button", { name: "수정 반영" })
    .click();
  await expect(
    candidates.getByRole("article"),
  ).toContainText("직접 다듬은 퀴즈");
  page.once("dialog", (dialog) => dialog.accept());
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
    await expect(
      page.getByRole("link", { name: "검토·승인" }),
    ).toHaveCount(0);
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
    if (index < 4) {
      await expect(
        candidates.getByText("임시저장됨", { exact: true }),
      ).toBeVisible();
    }
  }
  await expect(page).toHaveURL(
    /\/quizzes\/authoring\/manage\?user=learner$/,
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
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
  for (let remaining = 3; remaining >= 0; remaining -= 1) {
    await page
      .getByRole("article")
      .first()
      .getByRole("button", { name: /검토하기$/ })
      .click();
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("button", {
        name: "퀴즈 삭제",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByRole("region", { name: "내 퀴즈 목록" })
        .getByRole("article"),
    ).toHaveCount(remaining);
  }
  await page.reload();
  await expect(
    page.getByText("저장한 퀴즈가 없습니다"),
  ).toBeVisible();
  await management.reload();
  await expect(
    management
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(0);
});

test("quiz tabs stay visible while only the candidate body scrolls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quizzes/authoring");
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill("타입스크립트 union narrowing");
  await page
    .getByRole("button", {
      name: "퀴즈 만들기",
      exact: true,
    })
    .click();

  const dialog = page.getByRole("dialog", {
    name: "버그리와 퀴즈 다듬기",
  });
  const workspace = dialog.getByRole("region", {
    name: "퀴즈 작업 본문",
  });
  const candidates = dialog.getByRole("region", {
    name: "생성 후보",
  });
  const tabs = candidates.getByRole("tablist", {
    name: "퀴즈 선택",
  });
  const body = candidates.getByRole("tabpanel").first();

  await expect(dialog).toHaveCSS("overflow-y", "hidden");
  await expect(workspace).toHaveCSS("overflow-y", "hidden");
  await expect(body).toHaveCSS("overflow-y", "auto");
  await candidates
    .getByRole("button", { name: "직접 수정" })
    .click();
  const tabTop = (await tabs.boundingBox())?.y;
  const scroll = await body.evaluate((element) => {
    element.scrollTop = element.scrollHeight;

    return {
      top: element.scrollTop,
      height: element.clientHeight,
      scrollHeight: element.scrollHeight,
    };
  });

  expect(scroll.scrollHeight).toBeGreaterThan(
    scroll.height,
  );
  expect(scroll.top).toBeGreaterThan(0);
  expect((await tabs.boundingBox())?.y).toBe(tabTop);
});

test("review, approve, revise, regenerate and delete", async ({
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
  for (let index = 2; index <= 4; index += 1) {
    await page
      .getByRole("tab", {
        name: `퀴즈 ${index}`,
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "임시저장",
        exact: true,
      })
      .click();
  }
  await expect(page).toHaveURL(
    /\/quizzes\/authoring\/manage\?user=learner$/,
  );
  await page
    .getByRole("article")
    .first()
    .getByRole("button", { name: /검토하기$/ })
    .click();
  const review = page.getByRole("region", {
    name: "퀴즈 검토",
    exact: true,
  });
  await expect(
    review.getByRole("button", {
      name: "승인",
    }),
  ).toBeEnabled();
  await expect(
    review.getByLabel("제목", { exact: true }),
  ).toHaveCount(0);
  await review
    .getByRole("button", { name: "직접 수정" })
    .click();
  const editActions = review.getByRole("group", {
    name: "편집 작업",
  });

  await expect(editActions).toHaveCSS("position", "fixed");
  await expect(
    review.getByRole("heading", { name: "기본 정보" }),
  ).toBeVisible();
  await expect(
    review.getByRole("button", {
      name: "#JavaScript 추가",
    }),
  ).toHaveText("#JavaScript");
  await review
    .getByLabel("제목", { exact: true })
    .fill("내 첫 퀴즈");
  await review
    .getByRole("button", { name: "수정 저장", exact: true })
    .click();
  await review
    .getByRole("button", { name: "승인", exact: true })
    .click();
  await expect(review.getByRole("status")).toHaveText(
    "승인했습니다.",
  );
  await page.reload();
  await expect(
    review.getByRole("heading", { name: "내 첫 퀴즈" }),
  ).toBeVisible();
  await review
    .getByRole("button", { name: "직접 수정" })
    .click();
  await review
    .getByLabel("제목", { exact: true })
    .fill("수정본 제목");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: "내 퀴즈로 돌아가기" })
    .click();
  await expect(
    review.getByLabel("제목", { exact: true }),
  ).toHaveValue("수정본 제목");
  await review
    .getByRole("button", { name: "수정 저장", exact: true })
    .click();
  await expect(
    review.getByText("현재 버전과 비교"),
  ).toBeVisible();
  await review
    .getByRole("button", { name: "승인", exact: true })
    .click();
  await review
    .getByRole("button", {
      name: "추가 프롬프트로 재생성",
    })
    .click();
  const regenerate = page.getByRole("dialog", {
    name: "추가 프롬프트로 재생성",
  });
  await regenerate
    .getByLabel("추가 프롬프트")
    .fill("예시 추가");
  await regenerate
    .getByRole("button", { name: "수정본 재생성" })
    .click();
  await expect(regenerate).not.toBeVisible();
  await expect(review.getByRole("status")).toHaveText(
    "수정본을 생성했습니다. 내용을 검토하세요.",
  );
  await expect(
    review.getByText("현재 버전과 비교"),
  ).toBeVisible();
  await expect(
    review.getByRole("button", {
      name: "승인",
    }),
  ).toBeEnabled();
  await review
    .getByRole("button", { name: "승인", exact: true })
    .click();
  await expect(
    review.getByText("승인됨", { exact: true }),
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
  ).toHaveCount(3);
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(3);
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
    other.getByRole("heading", { name: "타입 선언" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "직접 수정" })
    .click();
  await other
    .getByRole("button", { name: "직접 수정" })
    .click();
  await page
    .getByLabel("제목", { exact: true })
    .fill("먼저 저장한 제목");
  await page
    .getByRole("button", { name: "수정 저장", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "내용을 저장했습니다. 저장된 내용을 다시 확인하세요.",
  );
  await other
    .getByLabel("제목", { exact: true })
    .fill("다른 탭 편집");
  await other
    .getByRole("button", { name: "수정 저장", exact: true })
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

test("quiz management keeps compact list filters when returning from review", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quizzes/authoring/manage?user=author");
  const list = page.getByRole("region", {
    name: "내 퀴즈 목록",
  });

  await expect(
    page.getByRole("heading", { name: "내 퀴즈 2" }),
  ).toBeVisible();
  await expect(
    list.getByRole("tab", { name: "승인됨 2" }),
  ).toBeVisible();
  await expect(list.getByText("PUBLIC")).toHaveCount(0);
  await list
    .getByRole("searchbox", { name: "퀴즈 검색" })
    .fill("타입");
  await expect(page).toHaveURL(/q=%ED%83%80%EC%9E%85/);
  await expect(list.getByRole("article")).toHaveCount(1);
  await list
    .getByRole("button", { name: "타입 선언 관리하기" })
    .click();
  await expect(page).toHaveURL(/quiz=seed-quiz-1/);
  await page
    .getByRole("button", { name: "내 퀴즈로 돌아가기" })
    .click();
  await expect(
    list.getByRole("searchbox", { name: "퀴즈 검색" }),
  ).toHaveValue("타입");
  await expect(list.getByRole("article")).toHaveCount(1);
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    390,
  );
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
  await page.goto("/quizzes/authoring/manage?user=author");
  const trigger = page.getByRole("combobox", {
    name: "정렬",
  });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("제목순");
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
    .getByRole("heading", { name: /^내 퀴즈/ })
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
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
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
    page.getByRole("region", { name: "버그리와 대화" }),
  ).toBeVisible();
  await expect(tabs).toHaveCount(0);
  await page
    .getByLabel("퀴즈 2에 추가 요청")
    .fill("추가 예시");
  await page
    .getByRole("button", { name: "퀴즈로 돌아가기" })
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
  await page
    .getByRole("button", { name: "퀴즈로 돌아가기" })
    .click();

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
  ).toBeEnabled();
  await expect(
    page.getByText(
      "직접 수정한 내용이 아직 반영되지 않았습니다.",
    ),
  ).toHaveCount(0);
  await page
    .getByLabel("퀴즈 1에 추가 요청")
    .fill("LLM으로도 수정");
  await page
    .getByRole("button", { name: "요청 보내기" })
    .click();
  await expect(
    page.getByRole("list", { name: "추가 요청 기록" }),
  ).toContainText("LLM으로도 수정");
  await page
    .getByRole("button", { name: "퀴즈로 돌아가기" })
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

test("creation keeps desktop split preview and switches mobile tabs without losing input", async ({
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
  await expect(preview).toHaveCount(0);
  await page
    .getByRole("tab", { name: "미리보기", exact: true })
    .click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "const value = 1;",
  );
  await expect(page.locator("body")).toHaveJSProperty(
    "scrollWidth",
    390,
  );
  await page
    .getByRole("tab", { name: "작성", exact: true })
    .click();
  await expect(input).toHaveValue(
    "# 실시간 미리보기\n\n```typescript\nconst value = 1;\n```",
  );
  await input.fill("바꾼 내용");
  await page
    .getByRole("tab", { name: "미리보기", exact: true })
    .click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "바꾼 내용",
  );
});
