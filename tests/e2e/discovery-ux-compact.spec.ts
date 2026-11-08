import { expect, test } from "@playwright/test";

for (const locale of ["ko", "en"]) {
  for (const width of [1280, 390]) {
    test(`compact catalogs and all tags ${locale} ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        (locale) =>
          localStorage.setItem("bugri.locale", locale),
        locale,
      );
      await page.goto(
        "/developers/bugri-author/quizzes?user=friend",
      );
      await expect(
        page.getByRole("button", {
          name: "TypeScript (1)",
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.getByRole("searchbox")).toHaveCount(
        0,
      );
      await page.goto(
        "/developers/bugri-author/quizzes?user=friend&tagQuery=web&tagPage=99&tag=typescript",
      );
      await expect(
        page.getByRole("button", {
          name: "JavaScript (1)",
          exact: true,
        }),
      ).toBeVisible();
      const tag = page.getByRole("button", {
        name: "TypeScript (1)",
        exact: true,
      });
      await expect(tag).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await tag.focus();
      await page.keyboard.press("Space");
      await expect(tag).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await expect(page).not.toHaveURL(/tagQuery|tagPage/);
      await page.goto(
        "/tags/typescript/quizzes?user=friend",
      );
      await expect(
        page.getByRole("heading", { name: "#TypeScript" }),
      ).toBeVisible();
      await expect(
        page.getByText(
          locale === "ko"
            ? "공개 퀴즈 1개"
            : "Public quizzes: 1",
          { exact: true },
        ),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name:
            locale === "ko"
              ? "공개 퀴즈"
              : "Public quizzes",
          exact: true,
        }),
      ).toHaveCount(0);
      await page.goto("/tags/java/quizzes?user=friend");
      await expect(
        page.getByText(
          locale === "ko"
            ? "공개된 퀴즈가 없습니다."
            : "No public quizzes yet.",
          { exact: true },
        ),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            innerWidth,
        ),
      ).toBe(true);
    });
  }
}
