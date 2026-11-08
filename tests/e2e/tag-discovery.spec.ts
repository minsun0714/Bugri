import { test, expect } from "@playwright/test";

test("guest consent preserves search, requires explicit subscription, and manages own tags", async ({
  page,
}) => {
  await page.goto("/discover/tags?query=Java");
  const subscribe = page.getByRole("button", {
    name: "Java 구독하기",
    exact: true,
  });
  await subscribe.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("button", { name: "취소", exact: true })
    .click();
  await expect(subscribe).toBeFocused();
  await subscribe.click();
  await dialog
    .getByRole("button", {
      name: "데모 로그인",
      exact: true,
    })
    .click();
  const selection = page.getByRole("dialog", {
    name: "데모 사용자 선택",
  });
  await selection
    .getByRole("combobox", { name: "더미 사용자" })
    .click();
  await selection
    .getByRole("option", { name: "친구", exact: true })
    .click();
  await selection
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(page).toHaveURL(/user=friend/);
  await expect(page).toHaveURL(/query=Java/);
  await expect(subscribe).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("bugri:mock:v1:friend")!,
        ).subscriptions,
    ),
  ).toEqual([]);
  await subscribe.click();
  await expect(
    page.getByRole("button", {
      name: "Java 학습하기",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByText("현재 공개 퀴즈 없음", { exact: true }),
  ).toBeVisible();
  const menu = page.getByRole("button", {
    name: "Java 구독 메뉴",
    exact: true,
  });
  await expect(menu).toBeFocused();
  await page
    .getByRole("button", { name: "내 구독", exact: true })
    .click();
  await expect(page).toHaveURL(/subscribed=true/);
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByRole("listitem"),
  ).toHaveCount(1);
  await menu.focus();
  await menu.press("ArrowDown");
  const remove = page.getByRole("menuitem", {
    name: "구독 해제",
  });
  await expect(remove).toBeFocused();
  await remove.press("Escape");
  await expect(menu).toBeFocused();
  await menu.press("Enter");
  await expect(remove).toBeFocused();
  await remove.press("Enter");
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByRole("listitem"),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "검색 결과" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "전체 태그 보기" })
    .click();
  await expect(subscribe).toBeVisible();
});

test("search and unsubscribe restore keyboard focus; hash searches and history work", async ({
  page,
}) => {
  await page.goto("/discover/tags?user=friend");
  const search = page.getByRole("searchbox");
  await search.fill("#Web");
  await search.press("Enter");
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "검색 결과 1개" }),
  ).toBeFocused();
  await page
    .getByRole("button", {
      name: "Web 구독하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Web 학습하기",
      exact: true,
    }),
  ).toBeFocused();
  const menu = page.getByRole("button", {
    name: "Web 구독 메뉴",
  });
  await menu.press("Enter");
  await page.getByRole("menuitem").press("Tab");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await menu.click();
  await page.getByRole("menuitem").press("Enter");
  await expect(
    page.getByRole("button", {
      name: "Web 구독하기",
      exact: true,
    }),
  ).toBeFocused();
  await search.fill("Java");
  await search.press("Enter");
  await expect(page).toHaveURL(/query=Java/);
  await page.goBack();
  await expect(search).toHaveValue("#Web");
});

test("invalid page and overlong query provide recovery; Unicode length agrees with API", async ({
  page,
}) => {
  await page.goto("/discover/tags?user=friend&page=2");
  await page
    .getByRole("button", { name: "첫 페이지로 이동" })
    .click();
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByRole("listitem"),
  ).toHaveCount(4);
  await page.goto(
    `/discover/tags?query=${"x".repeat(101)}`,
  );
  await expect(
    page.getByText("검색어는 100자 이하여야 합니다."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "다시 불러오기" }),
  ).toHaveCount(0);
  const search = page.getByRole("searchbox");
  await search.fill("😀".repeat(100));
  await expect(
    page.getByRole("button", { name: "검색", exact: true }),
  ).toBeEnabled();
  await search.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "검색 결과 0개",
  );
});

test("tag cards fit mobile and expose subscription and quiz availability", async ({
  page,
}, testInfo) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/discover/tags?user=learner");
    await expect(
      page.getByText("구독 중", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);
    const box = await page
      .getByRole("searchbox")
      .boundingBox();
    const heading = await page
      .getByRole("heading", {
        name: "태그 탐색",
        exact: true,
      })
      .boundingBox();
    expect(box!.y - heading!.y).toBeLessThan(120);
    await expect(
      page.getByRole("link", { name: "Web", exact: true }),
    ).toBeVisible();
    const menu = await page
      .getByRole("button", { name: "Web 구독 메뉴" })
      .boundingBox();
    expect(menu!.width).toBeGreaterThanOrEqual(44);
    expect(menu!.height).toBeGreaterThanOrEqual(44);
    await page.screenshot({
      path: testInfo.outputPath(`tags-${width}.png`),
      fullPage: true,
    });
  }
});

for (const width of [1280, 390]) {
  test(`public quiz count opens the tag catalog at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/discover/tags?user=learner&query=Web&subscribed=true",
    );
    const count = page.getByRole("link", {
      name: "Web 공개 퀴즈 2개",
      exact: true,
    });
    await count.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/tags/web/quizzes" &&
        url.searchParams.get("user") === "learner" &&
        url.searchParams.get("query") === "Web" &&
        url.searchParams.get("discoveryPage") === "1" &&
        url.searchParams.get("subscribed") === "true",
    );
    await expect(
      page
        .getByRole("region", { name: "태그의 공개 퀴즈" })
        .getByRole("listitem"),
    ).toHaveCount(2);
    await page.goto("/discover/tags?query=Java");
    await page
      .getByRole("link", {
        name: "Java 공개 퀴즈 0개",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/tags/java/quizzes" &&
        !url.searchParams.has("user"),
    );
    await expect(
      page.getByText("공개된 퀴즈가 없습니다.", {
        exact: true,
      }),
    ).toBeVisible();
  });
}
