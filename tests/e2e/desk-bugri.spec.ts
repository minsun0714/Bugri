import {
  expect,
  test,
  type Locator,
} from "@playwright/test";

async function bugriPixels(canvas: Locator) {
  return canvas.evaluate((element) => {
    const c = element as HTMLCanvasElement;
    const context = c.getContext("2d");
    if (!context) throw new Error("No Canvas context");
    const { data } = context.getImageData(
      0,
      0,
      c.width,
      c.height,
    );
    let pixels = 0;
    // The mascot's existing lime body colour is distinct from product colours.
    for (let i = 0; i < data.length; i += 4)
      if (
        data[i] === 197 &&
        data[i + 1] === 237 &&
        data[i + 2] === 102
      )
        pixels++;
    return pixels;
  });
}

for (const width of [1100, 390]) {
  test(`Bugri is present in empty and public spaces at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/my");
    const canvas = page
      .getByRole("main")
      .locator('[data-renderer="canvas"] canvas');
    await expect(canvas).toBeVisible();
    await expect
      .poll(() => bugriPixels(canvas))
      .toBeGreaterThan(50);
    await expect(
      page.getByRole("img", { name: "3D 데스크 캔버스" }),
    ).toHaveAccessibleDescription(
      "버그리가 공간에서 함께하고 있어요.",
    );
    await page
      .getByLabel("더미 사용자")
      .selectOption("friend");
    await expect
      .poll(() => bugriPixels(canvas))
      .toBeGreaterThan(50);
    for (const name of ["정면", "위에서", "45도 시점"]) {
      await page
        .getByRole("button", { name, exact: true })
        .click();
      await expect
        .poll(() => bugriPixels(canvas))
        .toBeGreaterThan(50);
    }
    await page.goto("/shop");
    await page
      .getByRole("article")
      .filter({
        has: page.getByRole("heading", {
          name: "새싹 키보드",
          exact: true,
        }),
      })
      .getByRole("button", { name: "장착해 보기" })
      .click();
    await expect
      .poll(() => bugriPixels(canvas))
      .toBeGreaterThan(50);
    await page.goto("/users/bugri-author");
    await expect
      .poll(() => bugriPixels(canvas))
      .toBeGreaterThan(50);
    await expect(
      page.getByRole("button", {
        name: "상품 이동",
        exact: true,
      }),
    ).toHaveCount(0);
  });
}
