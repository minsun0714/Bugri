import { test, expect, type Page } from "@playwright/test";

const searchBox = (page: Page) =>
  page.getByRole("searchbox", { name: "내 노트 검색" });

const rows = (page: Page) =>
  page
    .getByRole("list", { name: "내 노트" })
    .getByRole("link");

const chip = (page: Page, name: RegExp) =>
  page
    .getByRole("region", { name: "태그 필터" })
    .getByRole("button", { name });

test("search → result → detail → back keeps the condition, and a reload restores it", async ({
  page,
}) => {
  await page.goto("/notes?user=learner");
  await expect(rows(page)).toHaveCount(3);

  await searchBox(page).fill("  CORS ");
  await searchBox(page).press("Enter");

  await expect(page).toHaveURL(/query=CORS/);
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).first()).toContainText(
    "퀴즈 · CORS",
  );

  const count = page.getByRole("status").filter({
    hasText: "검색 결과 1개",
  });

  await expect(count).toBeFocused();

  await rows(page).first().click();
  await expect(page).toHaveURL(/\/notes\/seed-note-learner/);

  await page.goBack();
  await expect(page).toHaveURL(/query=CORS/);
  await expect(searchBox(page)).toHaveValue("CORS");
  await expect(rows(page)).toHaveCount(1);

  await page.reload();
  await expect(searchBox(page)).toHaveValue("CORS");
  await expect(rows(page)).toHaveCount(1);
});

test("the search button works and answers, explanations and pending quizzes are not searched", async ({
  page,
}) => {
  await page.goto("/notes?user=learner");

  // Words that only appear in explanations or answers match nothing.
  await searchBox(page).fill("전체 교체");
  await page.getByRole("button", { name: "검색", exact: true }).click();
  await expect(
    page.getByText("“전체 교체”와 일치하는 메모가 없어요"),
  ).toBeVisible();
});

test("several tags and the no-tags chip are kept in the address and combined with search", async ({
  page,
}) => {
  await page.goto("/notes?user=learner");

  await chip(page, /^TypeScript/).click();
  await expect(page).toHaveURL(/tag=typescript/);
  await expect(rows(page)).toHaveCount(1);
  await expect(chip(page, /^TypeScript/)).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await chip(page, /^JavaScript/).click();
  await expect(page).toHaveURL(/tag=typescript&tag=javascript/);
  await expect(rows(page)).toHaveCount(1);

  await chip(page, /^태그 없음/).click();
  await expect(page).toHaveURL(/untagged=1/);
  await expect(rows(page)).toHaveCount(3);
  // Toggling a chip keeps focus on the chip; the count is announced by its live region.
  await expect(chip(page, /^태그 없음/)).toBeFocused();
  await expect(
    page.getByRole("status").filter({ hasText: "검색 결과 3개" }),
  ).toBeVisible();

  // Search narrows the union: both conditions must hold.
  await searchBox(page).fill("클로저");
  await searchBox(page).press("Enter");
  await expect(rows(page)).toHaveCount(1);

  await page.reload();
  await expect(chip(page, /^태그 없음/)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(chip(page, /^JavaScript/)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(rows(page)).toHaveCount(1);

  await chip(page, /^태그 없음/).click();
  await chip(page, /^TypeScript/).click();
  await chip(page, /^JavaScript/).click();
  await expect(page).not.toHaveURL(/tag=|untagged/);
});

test("untagged gathers memos without a confirmed quiz", async ({
  page,
}) => {
  await page.goto("/notes?user=learner&untagged=1");

  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page).first()).toContainText("퀴즈 없음");
});

test("no result explains the query and the reset clears it", async ({
  page,
}) => {
  await page.goto("/notes?user=learner&tag=java");
  await searchBox(page).fill("zzzz");
  await searchBox(page).press("Enter");

  await expect(
    page.getByText("“zzzz”와 일치하는 메모가 없어요"),
  ).toBeVisible();

  await page.getByRole("button", { name: "조건 초기화" }).click();

  await expect(page).toHaveURL(/\/notes\?user=learner$/);
  await expect(rows(page)).toHaveCount(3);
});

test("invalid address values are explained with a reset", async ({
  page,
}) => {
  await page.goto(
    `/notes?user=learner&query=${"가".repeat(101)}`,
  );

  await expect(
    page.getByText("검색어는 100자 이하여야 합니다."),
  ).toHaveCount(1);

  await page.getByRole("button", { name: "조건 초기화" }).click();
  await expect(rows(page)).toHaveCount(3);

  await page.goto("/notes?user=learner&tag=nope");
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "주소의 검색 조건이 올바르지 않아요",
  );
});

test("another demo user's memos and quizzes never appear", async ({
  page,
}) => {
  await page.goto("/notes?user=friend&query=클로저");
  await expect(
    page.getByText("“클로저”와 일치하는 메모가 없어요"),
  ).toBeVisible();
});

test("mobile: controls wrap without horizontal scroll and the flow works", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/notes?user=learner");

  await chip(page, /^JavaScript/).click();
  await expect(rows(page)).toHaveCount(1);

  await searchBox(page).fill("이벤트");
  await searchBox(page).press("Enter");
  await expect(rows(page)).toHaveCount(1);

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(overflow).toBe(false);

  await page.screenshot({
    path: testInfo.outputPath("notes-search-mobile.png"),
  });
});

test.describe("English", () => {
  test.use({ locale: "en-US" });

  test("labels, empty result and reset are translated", async ({
    page,
  }) => {
    await page.goto("/notes?user=learner");

    await expect(
      page.getByRole("searchbox", { name: "Search notes" }),
    ).toBeVisible();

    await expect(
      page
        .getByRole("region", { name: "Tag filter" })
        .getByRole("button", { name: /^No tags/ }),
    ).toBeVisible();

    await page
      .getByRole("searchbox", { name: "Search notes" })
      .fill("zzzz");
    await page.keyboard.press("Enter");

    await expect(
      page.getByText("No notes match “zzzz”"),
    ).toBeVisible();

    await expect(
      page.getByRole("status").filter({ hasText: "0 results" }),
    ).toBeFocused();

    await page
      .getByRole("button", { name: "Reset filters" })
      .click();

    await expect(
      page.getByRole("list", { name: "My notes" }).getByRole("link"),
    ).toHaveCount(3);
  });
});
