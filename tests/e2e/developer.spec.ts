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
    await page
      .getByRole("button", {
        name: "구독 설정",
        exact: true,
      })
      .click();
    const panel = page.getByRole("dialog", {
      name: "구독 설정",
    });
    const toggle = panel.getByRole("switch", {
      name: "TypeScript 구독",
    });
    await toggle.click();
    await expect(toggle).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(filteredUrl);
    expect(await subscriptions()).toEqual([
      expect.objectContaining({
        type: "PERSON_HASHTAG",
        authorUserId: "author",
        hashtagId: "typescript",
      }),
    ]);
    await toggle.click();
    await expect(toggle).toHaveAttribute(
      "aria-checked",
      "false",
    );
    await panel
      .getByRole("switch", { name: "개발자 전체 구독" })
      .click();
    await expect(
      panel.getByRole("switch", {
        name: "개발자 전체 구독",
      }),
    ).toHaveAttribute("aria-checked", "true");
    await panel
      .getByRole("switch", { name: "개발자 전체 구독" })
      .click();
    await expect(
      panel.getByRole("switch", {
        name: "개발자 전체 구독",
      }),
    ).toHaveAttribute("aria-checked", "false");
    await panel.getByRole("searchbox").fill("web");
    await expect(
      panel.getByRole("switch", { name: "Web 구독" }),
    ).toBeVisible();
    await expect(toggle).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "구독 설정",
        exact: true,
      }),
    ).toBeFocused();
    await expect(page).toHaveURL(filteredUrl);
    await tags
      .getByRole("button", { name: "Web (1)", exact: true })
      .click();
    await expect(quizzes.getByRole("link")).toHaveCount(2);
    await expect(page).toHaveURL(
      (url) => url.searchParams.getAll("tag").length === 2,
    );
    await tag.click();
    await expect(quizzes.getByRole("link")).toHaveCount(1);
    await tag.click();
    await expect(tag).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(quizzes.getByRole("link")).toHaveCount(2);
    await tags
      .getByRole("button", { name: "Web (1)", exact: true })
      .click();
    await expect(page).toHaveURL(filteredUrl);
    await expect(quizzes.getByRole("link")).toHaveCount(1);
    expect(await subscriptions()).toEqual(before);
    await page.reload();
    await expect(quizzes.getByRole("link")).toHaveCount(1);
    await expect(tags.getByRole("searchbox")).toHaveCount(
      0,
    );
    await expect(
      tags.getByRole("button", {
        name: "Web (1)",
        exact: true,
      }),
    ).toBeVisible();
    await expect(tag).toBeVisible();
    await expect(
      quizzes.getByRole("button", {
        name: "typescript 필터 해제",
      }),
    ).toBeVisible();
    await tags
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
  await page
    .getByRole("button", { name: "구독 설정", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "구독 설정" })
    .getByRole("switch", { name: "TypeScript 구독" })
    .click();
  await expect(
    page.getByRole("button", {
      name: "선택한 사용자로 시작",
    }),
  ).toBeVisible();
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

for (const width of [1280, 390]) {
  test(`subscription panel keeps controls visible in a short viewport at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 500 });
    await page.goto(
      "/developers/bugri-author/quizzes?user=friend",
    );
    await page
      .getByRole("button", {
        name: "구독 설정",
        exact: true,
      })
      .click();
    const panel = page.getByRole("dialog", {
      name: "구독 설정",
    });
    await expect(
      panel.getByRole("switch", {
        name: "TypeScript 구독",
      }),
    ).toBeAttached();
    for (const control of [
      panel.getByRole("searchbox"),
      panel.getByRole("button", { name: "구독 설정 닫기" }),
      panel.getByRole("navigation", {
        name: "구독 태그 페이지",
      }),
    ]) {
      const bounds = await control.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(
        bounds!.y + bounds!.height,
      ).toBeLessThanOrEqual(500);
    }
    expect(
      await panel.evaluate(
        (element) =>
          element.scrollHeight <= element.clientHeight,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", {
        name: "구독 설정",
        exact: true,
      }),
    ).toBeFocused();
  });
}
