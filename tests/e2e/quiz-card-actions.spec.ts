import {
  test,
  expect,
  type Locator,
} from "@playwright/test";

async function clickCardSpace(card: Locator) {
  const box = await card.boundingBox();
  await card.click({
    position: { x: 8, y: box!.height - 8 },
  });
}

for (const width of [1280, 320]) {
  test(`management card opens quiz from blank space and separates settings and reactions at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const url =
      "/quizzes/authoring/manage?user=author&status=PUBLIC";
    await page.goto(url);
    const card = page.getByRole("article", {
      name: "타입 선언",
      exact: true,
    });
    const settings = card.getByRole("button", {
      name: "타입 선언 관리하기",
      exact: true,
    });
    const like = card.getByRole("button", {
      name: "좋아요",
      exact: true,
    });
    await expect(like).toBeEnabled();
    await expect(card).not.toContainText("→");
    await expect(card).not.toContainText("관리하기");
    await expect(
      card.locator(
        "a button, a a, button button, button a",
      ),
    ).toHaveCount(0);
    const box = await card.boundingBox();
    const gear = await settings.boundingBox();
    expect(gear!.y - box!.y).toBeLessThan(20);
    expect(
      box!.x + box!.width - gear!.x - gear!.width,
    ).toBeLessThan(20);
    expect(gear!.width).toBeGreaterThanOrEqual(44);
    expect(gear!.height).toBeGreaterThanOrEqual(44);
    await like.click();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page).not.toHaveURL(/[?&]quiz=/);
    await page.screenshot({
      path: `/tmp/bugri-card-actions/${width}-manage.png`,
      fullPage: true,
    });
    await settings.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(
      /manage.*quiz=seed-quiz-1/,
    );
    await page.goto(url);
    await expect(card).toBeVisible();
    await clickCardSpace(card);
    await expect(page).toHaveURL(/\/solve\?/);
    await expect(
      page.getByLabel("number", { exact: true }),
    ).toBeVisible();
  });

  test(`all public quiz lists open from card padding at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/tags/typescript/quizzes",
      "/developers/bugri-author/quizzes",
      "/users/bugri-author",
    ]) {
      await page.goto(`${path}?user=learner`);
      const card = page.getByRole("article").filter({
        has: page.getByRole("link", {
          name: "타입 선언",
          exact: true,
        }),
      });
      await expect(
        card.getByRole("button", {
          name: "좋아요",
          exact: true,
        }),
      ).toBeEnabled();
      await expect(
        card.locator("[data-card-go]"),
      ).toBeVisible();
      await page.screenshot({
        path: `/tmp/bugri-card-actions/${width}-${path.split("/")[1]}.png`,
        fullPage: true,
      });
      await clickCardSpace(card);
      await expect(page).toHaveURL(/\/solve\?/);
      await expect(
        page.getByLabel("number", { exact: true }),
      ).toBeVisible();
    }
  });
}

test("guest card access and author links remain separate", async ({
  page,
}) => {
  await page.goto("/tags/typescript/quizzes");
  const card = page.getByRole("article").filter({
    has: page.getByRole("link", {
      name: "타입 선언",
      exact: true,
    }),
  });
  await expect(card).toBeVisible();
  await clickCardSpace(card);
  await expect(
    page.getByRole("dialog", { name: "데모 사용자 선택" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await card
    .getByRole("link", { name: /타입 개발자/ })
    .click();
  await expect(page).toHaveURL(/\/users\/bugri-author/);
});
