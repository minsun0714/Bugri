import { expect, test } from "@playwright/test";

test("developer name opens scoped tags and quizzes; subscriptions stay on the page", async ({
  page,
}) => {
  await page.goto("/discover?user=friend");
  await page
    .getByRole("link", { name: "타입 개발자", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "타입 개발자의 퀴즈",
    }),
  ).toBeVisible();
  const quizzes = page.getByRole("region", {
    name: "개발자의 공개 퀴즈",
  });
  const tags = page.getByRole("region", {
    name: "개발자의 태그",
  });
  const tagBounds = await tags.boundingBox();
  const quizBounds = await quizzes.boundingBox();

  expect(tagBounds).not.toBeNull();
  expect(quizBounds).not.toBeNull();
  expect(
    tagBounds!.y + tagBounds!.height,
  ).toBeLessThanOrEqual(quizBounds!.y);
  expect(
    Math.abs(tagBounds!.width - quizBounds!.width),
  ).toBeLessThan(2);
  expect(tagBounds!.height).toBeLessThan(260);
  const tagSearch = tags.getByRole("searchbox");
  const searchButton = tags.getByRole("button", {
    name: "검색",
    exact: true,
  });
  const searchBounds = await tagSearch.boundingBox();
  const searchButtonBounds = await searchButton.boundingBox();

  expect(searchBounds).not.toBeNull();
  expect(searchButtonBounds).not.toBeNull();
  expect(
    Math.abs(searchBounds!.y - searchButtonBounds!.y),
  ).toBeLessThan(1);
  await tagSearch.evaluate((element) => {
    element.setAttribute("data-was-disabled", "false");
    new MutationObserver((records) => {
      if (
        records.some(
          ({ attributeName, oldValue }) =>
            attributeName === "disabled" && oldValue === null,
        )
      ) {
        element.setAttribute("data-was-disabled", "true");
      }
    }).observe(element, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["disabled"],
    });
  });
  await expect(
    tags.getByRole("navigation", { name: "태그 페이지" }),
  ).toHaveCount(0);
  const tagItems = tags.getByRole("listitem");
  const itemBounds = await tagItems.evaluateAll((items) =>
    items.map((item) => {
      const { height, width, y } =
        item.getBoundingClientRect();

      return { height, width, y };
    }),
  );

  expect(itemBounds).toHaveLength(3);
  expect(
    itemBounds.every(
      ({ height, width }) => height < 40 && width < 250,
    ),
  ).toBe(true);
  expect(new Set(itemBounds.map(({ y }) => y)).size).toBe(
    1,
  );
  await expect(quizzes.getByRole("link")).toHaveCount(2);
  const typeScriptTag = tags.getByRole("button", {
    name: "TypeScript (1)",
    exact: true,
  });

  await typeScriptTag.hover();
  await expect
    .poll(() =>
      typeScriptTag.evaluate(
        (element) =>
          getComputedStyle(element).textDecorationLine,
      ),
    )
    .not.toContain("underline");
  await typeScriptTag.click();
  await expect(tagSearch).toHaveAttribute(
    "data-was-disabled",
    "false",
  );
  await expect(typeScriptTag).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(typeScriptTag.locator("..")).toHaveClass(
    /ring-primary\/50/,
  );
  const unsubscribedBackground = await typeScriptTag
    .locator("..")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(tags.getByText(/선택한 태그:/)).toHaveCount(
    0,
  );
  await expect(quizzes.getByRole("link")).toHaveCount(1);
  await expect(
    quizzes.getByRole("navigation", {
      name: "퀴즈 페이지",
    }),
  ).toHaveCount(0);
  await expect(
    quizzes.getByRole("link", { name: "타입 선언" }),
  ).toBeVisible();
  const url = page.url();
  const subscriptionMenuTrigger = tags.getByRole("button", {
    name: "TypeScript 구독 메뉴",
    exact: true,
  });
  const triggerBounds = await subscriptionMenuTrigger.boundingBox();
  const dotsBounds = await subscriptionMenuTrigger
    .locator("svg")
    .boundingBox();

  expect(triggerBounds).not.toBeNull();
  expect(dotsBounds).not.toBeNull();
  expect(
    Math.abs(
      triggerBounds!.y +
        triggerBounds!.height / 2 -
        (dotsBounds!.y + dotsBounds!.height / 2),
    ),
  ).toBeLessThan(1);
  await subscriptionMenuTrigger.click();
  const typeScriptMenu = tags.getByRole("menu", {
    name: "TypeScript 구독 관리",
    exact: true,
  });

  await expect(typeScriptMenu).toBeVisible();
  await typeScriptMenu
    .getByRole("menuitem", { name: "구독하기" })
    .click();
  await expect(typeScriptMenu).toHaveCount(0);
  await expect(typeScriptTag.locator("..")).toHaveClass(
    /bg-primary\/10/,
  );
  await expect
    .poll(() =>
      typeScriptTag
        .locator("..")
        .evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
    )
    .not.toBe(unsubscribedBackground);
  await expect(page).toHaveURL(url);
  await page.reload();
  await expect(quizzes.getByRole("link")).toHaveCount(1);
  await tags
    .getByRole("button", {
      name: "TypeScript 구독 메뉴",
      exact: true,
    })
    .click();
  await expect(
    tags.getByRole("menuitem", {
      name: "구독 해제",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tags.getByRole("menu")).toHaveCount(0);
  await tags.getByRole("searchbox").fill("web");
  await tags.getByRole("searchbox").press("Enter");
  await expect(
    tags.getByRole("button", {
      name: "Web (1)",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    tags.getByRole("button", {
      name: "TypeScript (1)",
      exact: true,
    }),
  ).toHaveCount(0);
  await tags
    .getByRole("button", {
      name: "Web 구독 메뉴",
      exact: true,
    })
    .click();
  await tags
    .getByRole("menuitem", {
      name: "구독하기",
      exact: true,
    })
    .click();
  await expect(
    tags.getByRole("button", {
      name: "Web 구독 메뉴",
      exact: true,
    }),
  ).toBeEnabled();
  const subscriptions = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem("bugri:mock:v1:friend")!,
      ).subscriptions,
  );
  expect(subscriptions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: "PERSON_HASHTAG",
        authorUserId: "author",
        hashtagId: "typescript",
      }),
      expect.objectContaining({
        type: "PERSON_HASHTAG",
        authorUserId: "author",
        hashtagId: "web",
      }),
    ]),
  );
  await quizzes
    .getByRole("link", { name: "타입 선언" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toBeVisible();
});

test("empty and unknown developer pages show distinct states on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/developers/bugri-learner/quizzes?user=friend",
  );
  await expect(
    page.getByRole("heading", { name: "학습자의 퀴즈" }),
  ).toBeVisible();
  await expect(
    page.getByText("공개된 퀴즈가 없습니다", {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto(
    "/developers/missing/quizzes?user=friend",
  );
  await expect(
    page.getByRole("heading", {
      name: "개발자를 찾을 수 없습니다",
    }),
  ).toBeVisible();
});
