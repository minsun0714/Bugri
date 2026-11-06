import { expect, test } from "@playwright/test";

test("generate, save individually and in bulk, restore owner state", async ({
  page,
}) => {
  await page.goto("/quizzes/authoring");
  await page
    .getByRole("textbox", { name: /학습 내용/ })
    .fill(
      "타입스크립트\n```ts\n  const value = 1;\n```\n😀",
    );
  await page
    .getByRole("button", { name: "퀴즈 생성", exact: true })
    .click();
  const candidates = page.getByRole("region", {
    name: "생성 후보",
  });
  await expect(candidates.getByRole("article")).toHaveCount(
    4,
  );
  await expect(
    page
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(0);
  await candidates
    .getByRole("button", { name: "개별 저장" })
    .first()
    .click();
  await expect(
    candidates.getByRole("button", { name: "저장 완료" }),
  ).toHaveCount(1);
  await candidates
    .getByRole("button", { name: "남은 후보 모두 저장" })
    .click();
  await expect(
    page
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(4);
  await page.reload();
  await expect(
    candidates.getByRole("button", { name: "저장 완료" }),
  ).toHaveCount(4);
  await expect(
    page.getByRole("textbox", { name: /학습 내용/ }),
  ).toHaveValue(
    "타입스크립트\n```ts\n  const value = 1;\n```\n😀",
  );
  await page
    .getByLabel("더미 사용자")
    .selectOption("friend");
  await expect(
    page
      .getByRole("region", { name: "내 퀴즈 목록" })
      .getByRole("article"),
  ).toHaveCount(2);
  await page
    .getByLabel("더미 사용자")
    .selectOption("learner");
  await expect(
    page
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
    .getByRole("button", { name: "퀴즈 생성", exact: true })
    .click();
  await page
    .getByRole("button", { name: "개별 저장", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "타입 선언 검토·관리" })
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
    .getByLabel("승인 공개 범위")
    .selectOption("PUBLIC");
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
    .getByRole("button", { name: "생성 화면으로 돌아가기" })
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
    review.getByLabel("승인 공개 범위"),
  ).toHaveValue("PUBLIC");
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
    .getByLabel("변경할 공개 범위")
    .selectOption("PRIVATE");
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
    "/quizzes/authoring?user=author&quiz=seed-quiz-1",
  );
  const other = await context.newPage();
  await other.goto(
    "/quizzes/authoring?user=author&quiz=seed-quiz-1",
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
    name: "퀴즈 생성 도움말",
  });
  await expect(help).toBeVisible();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await help.hover();
  await expect(page.getByRole("tooltip")).toContainText(
    "예시 퀴즈 4개",
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
      name: "퀴즈",
      exact: true,
    })
    .click();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});
