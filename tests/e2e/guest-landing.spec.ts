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
    name: "읽는 개발에서, 풀어보는 개발로.",
  });
  await expect(
    page.locator("#landing-title"),
  ).toBeVisible();
  expect(
    await section
      .locator("*")
      .evaluateAll((elements) =>
        elements.every(
          (element) =>
            getComputedStyle(element).animationName ===
            "none",
        ),
      ),
  ).toBe(true);
});
