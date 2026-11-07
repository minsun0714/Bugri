import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`profile section order saves, cancels and drags at ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/users/bugri-author?user=author");
    const sections = page.locator("[data-profile-section]");
    const order = () =>
      sections.evaluateAll((els) =>
        els.map((el) =>
          el.getAttribute("data-profile-section"),
        ),
      );
    await expect(sections).toHaveCount(3);
    await expect
      .poll(order)
      .toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
    await page
      .getByRole("button", {
        name: "순서 편집",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "최신 공개 퀴즈 위로 이동",
      })
      .click();
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    await expect(
      page.getByRole("button", {
        name: "최신 공개 퀴즈 드래그하여 이동",
      }),
    ).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath(`editing-${width}.png`),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "취소", exact: true })
      .click();
    await expect
      .poll(order)
      .toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
    await expect(
      page.getByRole("button", {
        name: "순서 편집",
        exact: true,
      }),
    ).toBeFocused();
    await page
      .getByRole("button", {
        name: "순서 편집",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "내 데스크 드래그하여 이동",
      })
      .press("ArrowDown");
    await page
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(
      page.getByText("섹션 순서를 저장했습니다."),
    ).toBeVisible();
    await page.reload();
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    await page.goto("/users/bugri-author");
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    await expect(
      page.getByRole("button", { name: "순서 편집" }),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`visitor-${width}.png`),
      fullPage: true,
    });
    await page.goto("/users/bugri-author?user=friend");
    await expect(
      page.getByRole("button", { name: "순서 편집" }),
    ).toHaveCount(0);
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    await page.goto("/users/bugri-author?user=author");
    await page
      .getByRole("button", {
        name: "순서 편집",
        exact: true,
      })
      .click();
    const grip = page.getByRole("button", {
      name: "최신 공개 퀴즈 드래그하여 이동",
    });
    await grip.scrollIntoViewIfNeeded();
    const from = (await grip.boundingBox())!;
    const target = (await page
      .locator('[data-profile-section="DESK"]')
      .boundingBox())!;
    await page.mouse.move(
      from.x + from.width / 2,
      from.y + from.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(target.x + 24, target.y + 30, {
      steps: 12,
    });
    await page.mouse.up();
    await expect
      .poll(order)
      .toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException(
          "full",
          "QuotaExceededError",
        );
      };
    });
    await page
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "순서를 저장하지 못했습니다" }),
    ).toBeVisible();
    await expect
      .poll(order)
      .toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
    await page.screenshot({
      path: testInfo.outputPath(`failed-${width}.png`),
      fullPage: true,
    });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            innerWidth,
        ),
      )
      .toBe(true);
    await page
      .getByRole("button", { name: "취소", exact: true })
      .click();
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
  });
}

test("edge drag scrolls continuously in both directions and stops on drop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/users/bugri-author?user=author");
  await page
    .getByRole("button", { name: "순서 편집", exact: true })
    .click();
  const handle = page.getByRole("button", {
    name: "내 데스크 드래그하여 이동",
  });
  await handle.scrollIntoViewIfNeeded();
  const from = (await handle.boundingBox())!;
  await page.mouse.move(from.x + 20, from.y + 20);
  await page.mouse.down();
  await page.mouse.move(from.x + 20, 880, { steps: 10 });
  await expect(
    page.locator('[data-profile-section="ACTIVITY"]'),
  ).toHaveClass(/border-primary/);
  await page.mouse.up();
  await expect(
    page.locator("[data-profile-section]").last(),
  ).toHaveAttribute("data-profile-section", "DESK");
  await handle.scrollIntoViewIfNeeded();
  const bottom = (await handle.boundingBox())!;
  await page.mouse.move(bottom.x + 20, bottom.y + 20);
  await page.mouse.down();
  await page.mouse.move(bottom.x + 20, 70, { steps: 10 });
  await expect(
    page.locator('[data-profile-section="QUIZZES"]'),
  ).toHaveClass(/border-primary/);
  await page.mouse.up();
  await expect(
    page.locator("[data-profile-section]").first(),
  ).toHaveAttribute("data-profile-section", "DESK");
  // After the focus scroll settles, releasing the pointer must stop the edge loop.
  await expect(handle).toBeFocused();
  await page.evaluate(() =>
    window.scrollTo({ top: 0, behavior: "instant" }),
  );
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBe(0);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
