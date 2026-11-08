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
  test(`management card opens quiz from blank space and separates settings at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const url =
      "/quizzes/authoring/manage?user=author&status=APPROVED";
    await page.goto(url);
    const card = page.getByRole("article", {
      name: "타입 선언",
      exact: true,
    });
    const settings = card.getByRole("button", {
      name: "타입 선언 관리하기",
      exact: true,
    });
    await expect(settings).toBeEnabled();
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
}
