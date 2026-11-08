import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`visitor landing reaches the quiz at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const skip = page.getByRole("link", {
      name: "바로 퀴즈 풀기",
    });
    await expect(skip).toBeInViewport();
    await skip.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#guest-quiz")).toBeFocused();
    await expect(
      page.getByRole("button", { name: "답 제출" }),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);
    await page.goto("/?user=learner");
    await expect(skip).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "학습 태그" }),
    ).toBeVisible();
  });
}

test("reduced motion renders a static introduction", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.getByRole("region", {
    name: "흩어진 지식이, 내 것이 되는 순간.",
  });
  await expect(
    page.locator("#landing-title"),
  ).toBeVisible();
  await expect(section.locator("canvas")).toBeVisible();
  await expect
    .poll(() =>
      section
        .locator("*")
        .evaluateAll((elements) =>
          elements.every(
            (element) =>
              getComputedStyle(element).animationName ===
              "none",
          ),
        ),
    )
    .toBe(true);
});

test("completed guest practice offers optional demo continuation without transferring rewards", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("읽고, 풀고, 나만의 공간으로.", {
      exact: true,
    }),
  ).toHaveCount(0);
  const continueButton = page.getByRole("button", {
    name: "데모 사용자로 계속하기",
  });
  await expect(continueButton).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "상점 둘러보기",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "바로 퀴즈 풀기" })
    .click();
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeVisible();
  const input = page.getByLabel("답안", { exact: true });
  if (await input.count()) await input.fill("const");
  else
    await page
      .locator(
        'main input[type="radio"], main input[type="checkbox"]',
      )
      .first()
      .check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(continueButton).toBeVisible();
  await expect(
    page.getByText(
      "코인은 사용자 선택 후 학습부터 쌓여요. 체험 보상은 이월되지 않아요.",
    ),
  ).toBeVisible();
  await continueButton.click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await expect(continueButton).toBeFocused();
  await expect(
    page.getByRole("region", { name: "제출 결과" }),
  ).toBeVisible();
  await continueButton.click();
  await page
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(page).toHaveURL(/user=learner/);
  await expect(page.locator("#landing-title")).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("combobox", { name: "학습 태그" }),
  ).toBeVisible();
});

test("scroll assembles the puzzle, reverses, and keeps captions separate", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeAttached();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const story = page.locator(
    'section[aria-labelledby="landing-title"]',
  );
  const box = (await story.boundingBox())!;
  const piece = page
    .locator('svg[aria-label*="퍼즐"] > g')
    .first();
  const initial = await piece.evaluate(
    (e) => getComputedStyle(e).transform,
  );
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    box.y + (box.height - 1000) * (0.5 / 1.625),
  );
  await expect
    .poll(() =>
      piece.evaluate((e) => getComputedStyle(e).transform),
    )
    .not.toBe(initial);
  for (const progress of [0.58, 0.62, 0.66, 0.74]) {
    await page.evaluate(
      (y) => scrollTo({ top: y, behavior: "instant" }),
      box.y + (box.height - 1000) * (progress / 1.625),
    );
    await page.waitForTimeout(50);
    const visible = await story
      .locator("h1, h2")
      .evaluateAll(
        (elements) =>
          elements.filter(
            (e) =>
              Number(
                getComputedStyle(
                  e.parentElement!.parentElement!,
                ).opacity,
              ) > 0.1,
          ).length,
      );
    expect(visible).toBeLessThanOrEqual(1);
  }
  await page.evaluate(() =>
    scrollTo({ top: 0, behavior: "instant" }),
  );
  await expect
    .poll(() =>
      piece.evaluate((e) => getComputedStyle(e).transform),
    )
    .toBe(initial);
});
