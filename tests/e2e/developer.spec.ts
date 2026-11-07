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
  await tags
    .getByRole("button", {
      name: "TypeScript (1)",
      exact: true,
    })
    .click();
  await expect(quizzes.getByRole("link")).toHaveCount(1);
  await expect(
    quizzes.getByRole("link", { name: "타입 선언" }),
  ).toBeVisible();
  const url = page.url();
  await tags
    .getByRole("button", {
      name: "타입 개발자의 TypeScript 구독하기",
      exact: true,
    })
    .click();
  await expect(
    tags.getByRole("button", {
      name: "타입 개발자의 TypeScript 구독 중",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(page).toHaveURL(url);
  await page.reload();
  await expect(quizzes.getByRole("link")).toHaveCount(1);
  await expect(
    tags.getByRole("button", {
      name: "타입 개발자의 TypeScript 구독 중",
      exact: true,
    }),
  ).toBeDisabled();
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
      name: "타입 개발자의 Web 구독하기",
      exact: true,
    })
    .click();
  await expect(
    tags.getByRole("button", {
      name: "타입 개발자의 Web 구독 중",
      exact: true,
    }),
  ).toBeDisabled();
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
