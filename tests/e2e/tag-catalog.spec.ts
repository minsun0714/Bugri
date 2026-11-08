import { initialState, storageKey } from "@/mocks/storage";
import { test, expect } from "@playwright/test";

test("tag link preserves discovery conditions and supports explicit subscription, learning and direct solving", async ({
  page,
}) => {
  await page.goto("/discover/tags?user=friend&query=Web");
  await page
    .getByRole("link", { name: "Web", exact: true })
    .click();
  await expect(page).toHaveURL(/\/tags\/web\/quizzes/);
  await expect(
    page.getByRole("heading", {
      name: "#Web",
      exact: true,
    }),
  ).toBeVisible();
  const list = page.getByRole("region", {
    name: "태그의 공개 퀴즈",
  });
  await expect(
    list.getByRole("listitem").first(),
  ).toBeVisible();
  await expect(
    page.getByText("구독 중", { exact: false }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "+ 구독하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("✓ 구독 중", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Web 구독 메뉴" })
    .click();
  await page
    .getByRole("menuitem", { name: "구독 해제" })
    .click();
  await expect(
    page.getByRole("button", {
      name: "+ 구독하기",
      exact: true,
    }),
  ).toBeFocused();
  await page
    .getByRole("button", {
      name: "+ 구독하기",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "학습하기 →",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/" &&
      url.searchParams.get("user") === "friend" &&
      url.searchParams.get("tag") === "web" &&
      !!url.searchParams.get("attempt"),
  );
  await page.goBack();
  await list
    .getByRole("listitem")
    .first()
    .getByRole("link")
    .first()
    .click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === "/solve" &&
      url.searchParams.get("user") === "friend" &&
      !!url.searchParams.get("attempt"),
  );
  await expect(
    page.getByRole("heading", {
      name: "퀴즈 풀이",
      exact: true,
    }),
  ).toBeVisible();
  await page.goBack();
  await page
    .getByRole("link", {
      name: "← 태그 탐색으로 돌아가기",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/query=Web/);
  await expect(page.getByRole("searchbox")).toHaveValue(
    "Web",
  );
});

test("guest browsing stays anonymous and demo selection never automatically subscribes", async ({
  page,
}) => {
  await page.goto("/discover/tags");
  await page.getByRole("searchbox").fill("Web");
  await page
    .getByRole("button", { name: "검색", exact: true })
    .click();
  await expect(page).not.toHaveURL(/user=/);
  await page
    .getByRole("link", { name: "Web", exact: true })
    .click();
  await expect(page).not.toHaveURL(/user=/);
  await expect(
    page.getByText("✓ 구독 중", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("region", { name: "태그의 공개 퀴즈" })
    .getByRole("listitem")
    .first()
    .getByRole("link")
    .first()
    .click();
  const dialog = page.getByRole("dialog", {
    name: "데모 사용자 선택",
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", {
      name: "+ 구독하기",
      exact: true,
    })
    .click();
  await dialog
    .getByRole("combobox", { name: "더미 사용자" })
    .click();
  await dialog
    .getByRole("option", { name: "친구", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(page).toHaveURL(/user=friend/);
  await expect(
    page.getByRole("button", {
      name: "+ 구독하기",
      exact: true,
    }),
  ).toBeVisible();
});

test("empty, unknown and out-of-range tags have recovery on narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await page.goto("/tags/java/quizzes?user=friend");
  await expect(
    page.getByText("공개된 퀴즈가 없습니다.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "+ 구독하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "학습하기 →" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Java 구독 메뉴" }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/tags/missing/quizzes");
  await expect(
    page.getByRole("heading", {
      name: "태그를 찾을 수 없습니다",
    }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "← 태그 탐색으로 돌아가기",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/discover\/tags$/);
  await page.goto("/tags/web/quizzes?user=friend&page=999");
  await page
    .getByRole("button", { name: "첫 페이지로" })
    .click();
  await expect(page).toHaveURL(/page=1/);
  await expect(
    page
      .getByRole("region", { name: "태그의 공개 퀴즈" })
      .getByRole("listitem")
      .first(),
  ).toBeVisible();
});

test("tag catalog pagination restores URL and shows the remaining public titles", async ({
  page,
}) => {
  const state = initialState("author");
  const original = state.quizzes.find(({ active }) =>
    active?.hashtagIds.includes("web"),
  )!;
  state.quizzes.push(
    ...Array.from({ length: 21 }, (_, index) => ({
      ...original,
      quizId: `catalog-${index}`,
      active: {
        ...original.active!,
        title: `목록 테스트 ${index}`,
      },
    })),
  );
  await page.addInitScript(
    ({ key, state }) =>
      localStorage.setItem(key, JSON.stringify(state)),
    { key: storageKey("author"), state },
  );
  await page.goto("/tags/web/quizzes?user=friend");
  const rows = page
    .getByRole("region", { name: "태그의 공개 퀴즈" })
    .getByRole("listitem");
  await expect(rows).toHaveCount(20);
  await page
    .getByRole("button", { name: "다음", exact: true })
    .click();
  await expect(page).toHaveURL(/page=2/);
  await expect(rows).toHaveCount(3);
  await page.reload();
  await expect(rows).toHaveCount(3);
  await page
    .getByRole("button", { name: "이전", exact: true })
    .click();
  await expect(rows).toHaveCount(20);
});
