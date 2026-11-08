import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`localized catalog, search, inventory and trial at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/shop?user=learner");
    const language = async (name: string) => {
      const menu = page.getByRole("button", {
        name: /^(메뉴 열기|Open menu)$/,
      });
      if (await menu.isVisible()) await menu.click();
      await page
        .getByRole("combobox", { name: "Language / 언어" })
        .click();
      await page
        .getByRole("option", { name, exact: true })
        .click();
      const close = page.getByRole("button", {
        name: /^(메뉴 닫기|Close menu)$/,
      });
      if (await close.isVisible()) await close.click();
    };
    await expect(
      page.getByRole("heading", { name: "새싹 키보드" }),
    ).toBeVisible();
    await language("English");
    await expect(
      page.getByRole("heading", {
        name: "Sprout keyboard",
      }),
    ).toBeVisible();
    const cards = page.getByRole("article");
    await expect(cards).toHaveCount(15);
    expect(await cards.allTextContents()).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/[가-힣]/),
      ]),
    );
    await page.screenshot({
      path: `.bugri-hooks/shop-i18n/en-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("searchbox", { name: "Search items" })
      .fill("SAGE");
    await expect(cards).toHaveCount(1);
    await page
      .getByRole("searchbox", { name: "Search items" })
      .fill("");
    await page
      .getByRole("combobox", { name: "Sort items" })
      .click();
    await page
      .getByRole("option", { name: "Name", exact: true })
      .click();
    await expect(
      cards.first().getByRole("heading"),
    ).toHaveText("Blue plant");
    const cream = cards.filter({
      has: page.getByRole("heading", {
        name: "Cream studio desk",
      }),
    });
    await cream
      .getByRole("button", { name: "Try on desk" })
      .click();
    await expect(page.getByRole("dialog")).toContainText(
      "Cream studio desk",
    );
    await page.screenshot({
      path: `.bugri-hooks/shop-i18n/trial-${width}.png`,
    });
    await page.keyboard.press("Escape");
    await language("한국어");
    await expect(
      page.getByRole("heading", {
        name: "크림 스튜디오 책상",
      }),
    ).toBeVisible();
    await page.screenshot({
      path: `.bugri-hooks/shop-i18n/ko-${width}.png`,
      fullPage: true,
    });
    await language("English");
    const sprout = cards.filter({
      has: page.getByRole("heading", {
        name: "Sprout keyboard",
      }),
    });
    await sprout
      .getByRole("button", { name: "Buy", exact: true })
      .click();
    await expect(
      sprout.getByRole("button", {
        name: "Owned",
        exact: true,
      }),
    ).toBeDisabled();
    await page.goto("/my/desk?user=learner");
    await expect(
      page.getByRole("heading", {
        name: "Sprout keyboard",
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          window.innerWidth,
      ),
    ).toBe(true);
  });
}
