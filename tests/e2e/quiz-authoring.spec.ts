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
