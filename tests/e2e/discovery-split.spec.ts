import { test, expect } from "@playwright/test";

test("legacy searches preserve identity, query and page on separate routes", async ({
  page,
}) => {
  await page.goto(
    "/discover?kind=HASHTAG&user=friend&query=Java&page=1",
  );
  await expect(page).toHaveURL(
    /\/discover\/tags\?user=friend&query=Java&page=1$/,
  );
  await expect(
    page.getByRole("searchbox", { name: "태그 검색" }),
  ).toHaveValue("Java");
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await page.goto(
    "/discover?user=author&query=타입&page=1",
  );
  await expect(page).toHaveURL(/\/discover\/developers\?/);
  await expect(
    page.getByRole("searchbox", { name: "개발자 검색" }),
  ).toHaveValue("타입");
});

test("desktop and mobile expose separate discovery destinations", async ({
  page,
}, testInfo) => {
  for (const width of [1280, 1024, 1023, 640, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/discover/developers?user=friend");
    await expect(
      page.getByRole("region", {
        name: "개발자 검색 결과",
      }),
    ).toBeVisible();
    if (width < 1024)
      await page
        .getByRole("button", { name: "메뉴 열기" })
        .click();
    const nav = page.getByRole("navigation", {
      name: width < 1024 ? "모바일 주 메뉴" : "주 메뉴",
      exact: true,
    });
    await expect(
      nav.getByRole("link", {
        name: /개발자 탐색$/,
      }),
    ).toHaveAttribute("aria-current", "page");
    await nav
      .getByRole("link", { name: /태그 탐색$/ })
      .click();
    await expect(page).toHaveURL(
      /\/discover\/tags\?user=friend$/,
    );
    await expect(
      page.getByRole("region", { name: "태그 검색 결과" }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`tags-${width}.png`),
      fullPage: true,
    });
    await page.goBack();
    await expect(
      page.getByRole("heading", {
        name: /개발자 탐색$/,
      }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`developers-${width}.png`),
      fullPage: true,
    });
  }
});
