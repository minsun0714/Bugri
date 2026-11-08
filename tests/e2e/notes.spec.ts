import { test, expect, type Page } from "@playwright/test";

const editor = (page: Page) =>
  page.getByRole("textbox", { name: /^메모/ });

const body =
  "배운 점\n\n```ts\nconst n = 1;\n```\n\n<script>window.__ran = true</script>";

async function saveQuickNote(page: Page, content = body) {
  await editor(page).fill(content);
  await page
    .getByRole("button", { name: "메모 저장" })
    .click();
}

test("home quick note → my notes → detail → edit → delete, restored after reload", async ({
  page,
}, testInfo) => {
  await page.goto("/?user=learner");

  await expect(
    page.getByRole("heading", { name: "빠른 메모" }),
  ).toBeVisible();

  await saveQuickNote(page);

  const toast = page
    .getByRole("status")
    .filter({ hasText: "저장했어요" });

  await expect(toast).toContainText("저장했어요");
  await expect(editor(page)).toHaveValue("");
  await expect(page).toHaveURL(/\/\?user=learner$/);

  await page.screenshot({
    path: testInfo.outputPath("quick-note-saved.png"),
  });

  await page
    .getByRole("banner")
    .getByRole("link", { name: "내 노트" })
    .click();

  await expect(page).toHaveURL(/\/notes\?user=learner$/);

  const list = page.getByRole("list", { name: "내 노트" });

  await expect(list.getByRole("link")).toHaveCount(1);

  await list.getByRole("link").first().click();

  await expect(page).toHaveURL(
    /\/notes\/note-[^/]+\?user=learner$/,
  );

  const article = page.getByRole("article", {
    name: "메모 본문",
  });

  await expect(article).toContainText("const");
  await expect(article).toContainText("<script>");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __ran?: boolean }).__ran,
    ),
  ).toBeUndefined();

  // Editing needs the explicit button.
  await expect(editor(page)).toHaveCount(0);

  await page.getByRole("button", { name: "수정" }).click();
  await expect(editor(page)).toBeFocused();
  await editor(page).fill("수정한 메모");
  await page
    .getByRole("button", { name: "저장", exact: true })
    .click();

  await expect(article).toContainText("수정한 메모");

  await page.reload();

  await expect(
    page.getByRole("article", { name: "메모 본문" }),
  ).toContainText("수정한 메모");

  await page.getByRole("button", { name: "삭제" }).click();

  const dialog = page.getByRole("dialog", {
    name: "이 메모를 삭제할까요?",
  });

  await expect(dialog).toBeVisible();

  await dialog
    .getByRole("button", { name: "삭제" })
    .click();

  await expect(page).toHaveURL(/\/notes\?user=learner$/);
  await expect(
    page.getByText("아직 메모가 없어요"),
  ).toBeVisible();
});

test("quick note keeps the input with a nearby error when blank or over the limit", async ({
  page,
}) => {
  await page.goto("/?user=learner");

  await editor(page).fill("   ");
  await page
    .getByRole("button", { name: "메모 저장" })
    .click();

  await expect(
    page.getByRole("alert").filter({ hasText: /\S/ }),
  ).toContainText("메모 내용을 입력해 주세요.");

  await editor(page).fill("가".repeat(10_001));

  await expect(
    page.getByText("10,001 / 10,000자"),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "메모 저장" })
    .click();

  await expect(
    page.getByRole("alert").filter({ hasText: /\S/ }),
  ).toContainText("1자 초과");
  await expect(editor(page)).toHaveValue(
    "가".repeat(10_001),
  );

  await page.goto("/notes?user=learner");

  await expect(
    page.getByText("아직 메모가 없어요"),
  ).toBeVisible();
});

test("notes are isolated between demo users and unavailable notes show a way back", async ({
  page,
}) => {
  await page.goto("/?user=learner");
  await saveQuickNote(page, "learner만의 메모");
  await page
    .getByRole("link", { name: "메모 보기" })
    .click();

  await expect(page).toHaveURL(/\/notes\/note-/);

  const url = new URL(page.url());

  await page.goto(`/notes?user=author`);

  await expect(
    page.getByText("아직 메모가 없어요"),
  ).toBeVisible();
  await expect(
    page.getByText("learner만의 메모"),
  ).toHaveCount(0);

  await page.goto(`${url.pathname}?user=author`);

  await expect(
    page.getByText("접근할 수 없는 메모예요"),
  ).toBeVisible();
  await expect(
    page.getByText("learner만의 메모"),
  ).toHaveCount(0);

  await page
    .getByRole("link", { name: "내 노트로 돌아가기" })
    .click();

  await expect(page).toHaveURL(/\/notes\?user=author$/);

  await page.goto("/notes/does-not-exist?user=learner");

  await expect(
    page.getByText("접근할 수 없는 메모예요"),
  ).toBeVisible();
});

test("visitors are asked to choose a demo user before notes", async ({
  page,
}) => {
  await page.goto("/notes");

  await expect(
    page.getByText("데모 사용자를 선택해 주세요"),
  ).toBeVisible();

  await page
    .getByRole("main")
    .getByRole("button", { name: "데모 사용자 선택" })
    .click();

  await page
    .getByRole("dialog", { name: "데모 사용자 선택" })
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();

  await expect(page).toHaveURL(/\/notes\?user=learner$/);
  await expect(
    page.getByText("아직 메모가 없어요"),
  ).toBeVisible();
});

test("an unsaved edit warns before leaving and can be kept", async ({
  page,
}) => {
  await page.goto("/?user=learner");
  await saveQuickNote(page, "원본 메모");
  await page
    .getByRole("link", { name: "메모 보기" })
    .click();
  await page.getByRole("button", { name: "수정" }).click();
  await editor(page).fill("바뀐 내용");

  const link = page
    .getByRole("banner")
    .getByRole("link", { name: "내 노트" });

  const dialog = page.getByRole("dialog", {
    name: "저장하지 않은 변경을 버릴까요?",
  });

  // The in-app dialog replaces the native confirm.
  page.on("dialog", () => {
    throw new Error("native dialog must not appear");
  });

  await link.click();
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", { name: "계속 수정" })
    .click();
  await expect(page).toHaveURL(/\/notes\/note-/);
  await expect(editor(page)).toHaveValue("바뀐 내용");

  await link.click();
  await dialog
    .getByRole("button", { name: "변경 버리기" })
    .click();
  await expect(page).toHaveURL(/\/notes\?user=learner$/);
});

for (const width of [390, 360]) {
  test(`mobile ${width}px: one-row header and quick note without horizontal scroll`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?user=learner");

    const banner = page.getByRole("banner");

    await expect(
      banner.getByRole("link", { name: "내 노트" }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", {
        name: "다크 모드로 전환",
      }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", { name: "내 메뉴" }),
    ).toBeVisible();
    await expect(
      banner.getByRole("button", { name: "메뉴 열기" }),
    ).toHaveCount(0);

    const box = await banner.boundingBox();

    expect(box!.height).toBeLessThan(80);

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);

    await saveQuickNote(page, "모바일 메모");

    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "저장했어요" }),
    ).toContainText("저장했어요");

    await page.screenshot({
      path: testInfo.outputPath(
        `notes-mobile-${width}.png`,
      ),
    });
  });
}
