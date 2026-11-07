import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`developer catalog separates filtering and subscriptions at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/discover/developers?user=friend");
    await page
      .getByRole("link", {
        name: /타입 개발자 공개 퀴즈 \d+개/,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "타입 개발자의 퀴즈",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "탐색으로 돌아가기",
        exact: true,
      }),
    ).toHaveAttribute(
      "href",
      "/discover/developers?user=friend",
    );
    const tags = page.getByRole("region", {
      name: "개발자의 태그",
    });
    const quizzes = page.getByRole("region", {
      name: "개발자의 공개 퀴즈",
    });
    await expect(quizzes.getByRole("link")).toHaveCount(2);
    const tag = tags.getByRole("button", {
      name: "TypeScript (1)",
      exact: true,
    });
    const subscriptions = () =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem("bugri:mock:v1:friend") ??
              '{"subscriptions":[]}',
          ).subscriptions,
      );
    const before = await subscriptions();
    await tag.click();
    await expect(tag).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(quizzes.getByRole("link")).toHaveCount(1);
    expect(await subscriptions()).toEqual(before);
    const filteredUrl = page.url();
    await tags
      .getByRole("button", {
        name: "TypeScript 태그 구독하기",
      })
      .click();
    const menu = tags.getByRole("button", {
      name: "TypeScript 구독 메뉴",
    });
    await expect(menu).toBeFocused();
    await expect(page).toHaveURL(filteredUrl);
    expect(await subscriptions()).toEqual([
      expect.objectContaining({
        type: "PERSON_HASHTAG",
        authorUserId: "author",
        hashtagId: "typescript",
      }),
    ]);
    await expect(
      tags.getByRole("img", {
        name: "TypeScript 태그 구독 중",
      }),
    ).toBeVisible();
    await menu.click();
    await tags
      .getByRole("menuitem", { name: "구독 해제" })
      .click();
    await expect(
      tags.getByRole("button", {
        name: "TypeScript 태그 구독하기",
      }),
    ).toBeFocused();
    await expect(page).toHaveURL(filteredUrl);
    await expect(tag).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await subscriptions()).toEqual(before);
    await page.reload();
    await expect(quizzes.getByRole("link")).toHaveCount(1);
    await tags.getByRole("searchbox").fill("web");
    await tags.getByRole("searchbox").press("Enter");
    await expect(
      tags.getByRole("button", {
        name: "Web (1)",
        exact: true,
      }),
    ).toBeVisible();
    await expect(tag).toHaveCount(0);
    await expect(
      quizzes
        .getByText("#typescript", { exact: true })
        .first(),
    ).toBeVisible();
    await quizzes
      .getByRole("button", {
        name: "전체 퀴즈",
        exact: true,
      })
      .click();
    await expect(quizzes.getByRole("link")).toHaveCount(2);
    expect(await subscriptions()).toEqual(before);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);
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
}

test("guest filtering stays anonymous and subscription requires explicit demo selection", async ({
  page,
}) => {
  await page.goto("/developers/bugri-author/quizzes");
  const tags = page.getByRole("region", {
    name: "개발자의 태그",
  });
  await tags
    .getByRole("button", {
      name: "TypeScript (1)",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(
    (url) =>
      url.searchParams.get("tag") === "typescript" &&
      !url.searchParams.has("user"),
  );
  await tags
    .getByRole("button", {
      name: "TypeScript 태그 구독하기",
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const subscriptions = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem("bugri:mock:v1:learner") ??
          '{"subscriptions":[]}',
      ).subscriptions,
  );
  expect(
    subscriptions.filter(
      (item: {
        type: string;
        authorUserId?: string;
        hashtagId?: string;
      }) =>
        item.type === "PERSON_HASHTAG" &&
        item.authorUserId === "author" &&
        item.hashtagId === "typescript",
    ),
  ).toHaveLength(0);
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
