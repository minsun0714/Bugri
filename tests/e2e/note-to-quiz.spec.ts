import { test, expect, type Page } from "@playwright/test";
import { startWithoutNotes } from "./empty-notes";

const editor = (page: Page) =>
  page.getByRole("textbox", { name: /^메모/ });

const workModal = (page: Page) =>
  page.getByRole("dialog", {
    name: "버그리와 퀴즈 다듬기",
  });

async function openNewNote(page: Page) {
  await page.goto("/?user=learner");
  await editor(page).fill("TypeScript와 HTTP를 배웠다.");
  await page
    .getByRole("button", { name: "메모 저장" })
    .click();
  await page
    .getByRole("status")
    .getByRole("link", { name: "퀴즈로 만들기" })
    .click();
  await expect(page).toHaveURL(/\/notes\/note-/);
}

test("memo → generate → save some → close → continue → save the rest → solve → history", async ({
  page,
}, testInfo) => {
  await startWithoutNotes(page);
  await openNewNote(page);

  await page
    .getByRole("button", { name: "퀴즈로 만들기" })
    .click();

  const modal = workModal(page);

  await expect(modal.getByRole("tab")).toHaveCount(4);
  await page.screenshot({
    path: testInfo.outputPath("work-modal-desktop.png"),
  });

  await modal
    .getByRole("button", { name: "저장", exact: true })
    .click();
  await expect(
    modal.getByRole("tab", { name: "퀴즈 1 · 저장됨" }),
  ).toBeVisible();

  // No unapplied edits, so closing asks nothing.
  await modal
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await expect(modal).toBeHidden();

  await expect(
    page.getByRole("link", { name: "타입 선언" }),
  ).toBeVisible();

  await page
    .getByRole("button", {
      name: "확인 안 한 퀴즈 3개 · 이어서 확인",
    })
    .click();

  await expect(modal.getByRole("tab")).toHaveCount(3);

  await modal
    .getByRole("button", { name: /남은 퀴즈 모두 저장/ })
    .click();

  await expect(
    modal.getByRole("tab", { name: "퀴즈 3 · 저장됨" }),
  ).toBeVisible();

  await modal
    .getByRole("button", { name: "닫기", exact: true })
    .click();

  await expect(
    page.getByRole("button", { name: /이어서 확인/ }),
  ).toHaveCount(0);

  await page
    .getByRole("link", { name: "타입 선언" })
    .click();
  await expect(page).toHaveURL(/\/solve\?/);

  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();

  await page.goto("/my/learning?user=learner");
  await expect(
    page.getByText("타입 선언").first(),
  ).toBeVisible();
});

test("generating again keeps the earlier unconfirmed quizzes, and closing with an unapplied edit asks first", async ({
  page,
}) => {
  await startWithoutNotes(page);
  await openNewNote(page);

  const create = page.getByRole("button", {
    name: "퀴즈로 만들기",
  });

  await create.click();

  const modal = workModal(page);

  await expect(modal.getByRole("tab")).toHaveCount(4);

  await modal
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await expect(modal).toBeHidden();

  await create.click();
  await expect(modal.getByRole("tab")).toHaveCount(8);

  await modal
    .getByRole("button", { name: "직접 수정" })
    .click();
  await expect(
    modal.getByRole("button", { name: "수정 반영" }),
  ).toBeVisible();

  // Opening the editor alone changes nothing, so closing asks nothing.
  await modal
    .getByRole("button", { name: "수정 취소" })
    .click();
  await modal
    .getByRole("button", { name: "직접 수정" })
    .click();
  await modal.getByLabel("제목").first().fill("바꾼 제목");

  // A shared modal, never window.confirm.
  page.on("dialog", () => {
    throw new Error("native dialog must not appear");
  });

  await modal
    .getByRole("button", { name: "닫기", exact: true })
    .click();

  const discard = page.getByRole("dialog", {
    name: "저장하지 않은 변경을 버릴까요?",
  });

  await discard
    .getByRole("button", { name: "계속 수정" })
    .click();
  await expect(modal).toBeVisible();

  await modal
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await discard
    .getByRole("button", { name: "변경 버리기" })
    .click();
  await expect(modal).toBeHidden();

  await expect(
    page.getByRole("button", {
      name: "확인 안 한 퀴즈 8개 · 이어서 확인",
    }),
  ).toBeVisible();
});

test("deleting a memo warns with the quiz count and keeps solving history", async ({
  page,
}) => {
  await startWithoutNotes(page);
  await openNewNote(page);

  await page
    .getByRole("button", { name: "퀴즈로 만들기" })
    .click();

  const modal = workModal(page);

  await modal
    .getByRole("button", { name: /남은 퀴즈 모두 저장/ })
    .click();
  await modal
    .getByRole("button", { name: "닫기", exact: true })
    .click();

  await page
    .getByRole("link", { name: "타입 선언" })
    .click();
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();

  await page.goBack();
  await page
    .getByRole("button", { name: "삭제", exact: true })
    .first()
    .click();

  const dialog = page.getByRole("dialog", {
    name: "이 메모를 삭제할까요?",
  });

  await expect(dialog).toContainText("연결된 퀴즈 4개");

  await dialog
    .getByRole("button", { name: "삭제" })
    .click();

  await expect(page).toHaveURL(/\/notes\?user=learner$/);

  await page.goto("/my/learning?user=learner");
  await expect(page.getByRole("main")).toBeVisible();
});

test("the seeded learner shows confirmed, unconfirmed and quiz-less memos in the list", async ({
  page,
}) => {
  await page.goto("/notes?user=learner");

  await expect(page.getByText("퀴즈 8개")).toBeVisible();
  await expect(
    page.getByText("확인 안 한 퀴즈 2개"),
  ).toBeVisible();
  await expect(
    page.getByText("퀴즈 없음").first(),
  ).toBeVisible();
});

for (const width of [390, 320]) {
  test(`mobile ${width}px: work modal fits without horizontal scroll`, async ({
    page,
  }, testInfo) => {
    await startWithoutNotes(page);
    await page.setViewportSize({ width, height: 800 });
    await openNewNote(page);

    await page
      .getByRole("button", { name: "퀴즈로 만들기" })
      .click();
    await expect(
      workModal(page).getByRole("tab"),
    ).toHaveCount(4);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);

    await page.screenshot({
      path: testInfo.outputPath(`work-modal-${width}.png`),
    });
  });
}
