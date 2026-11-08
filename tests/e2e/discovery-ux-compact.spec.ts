import { expect, test } from "@playwright/test";

for (const locale of ["ko", "en"]) {
  for (const width of [1280, 390]) {
    test(`compact catalogs and keyboard search ${locale} ${width}`, async ({
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
      const toggle = page.getByRole("button", {
        name: locale === "ko" ? "태그 검색" : "Search tags",
        exact: true,
      });
      await expect(toggle).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await toggle.focus();
      await page.keyboard.press("Enter");
      const search = page.getByRole("searchbox", {
        name:
          locale === "ko"
            ? "이 개발자의 태그 검색"
            : "Search this developer's tags",
      });
      await expect(search).toBeFocused();
      await toggle.click();
      await expect(search).toBeHidden();
      await toggle.click();
      await search.fill("web");
      await search.press("Enter");
      await expect(page).toHaveURL(/tagQuery=web/);
      await expect(toggle).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      await expect(search).toBeVisible();
      await page.reload();
      await expect(search).toHaveValue("web");
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
