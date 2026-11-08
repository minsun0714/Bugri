import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`scroll furnishes and retains Bugri's 3D desk without storing purchases at ${width}px`, async ({
    page,
  }) => {
    const height = 900;
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(
      page.getByRole("button", {
        name: "답 제출",
        exact: true,
      }),
    ).toBeAttached();
    expect(
      await page
        .locator('[data-renderer="canvas"]')
        .count(),
    ).toBe(0);
    const box = (await page
      .locator('section[aria-labelledby="landing-title"]')
      .boundingBox())!;
    const move = async (progress: number) => {
      await page.evaluate(
        (top) => scrollTo({ top, behavior: "instant" }),
        box.y + (box.height - height) * progress,
      );
    };
    const desk = page.getByTestId("reward-desk");
    await move(0.73);
    const canvas = desk.locator(
      '[data-renderer="canvas"] canvas',
    );
    await expect(canvas).toBeVisible();
    await expect(
      desk
        .getByRole("list", { name: "3D 배치 정보" })
        .locator("li"),
    ).toHaveCount(2);
    await move(0.95);
    await expect(
      desk
        .getByRole("list", { name: "3D 배치 정보" })
        .locator("li"),
    ).toHaveCount(5);
    expect(
      await canvas.evaluate((element) => {
        const c = element as HTMLCanvasElement;
        const { data } = c
          .getContext("2d")!
          .getImageData(0, 0, c.width, c.height);
        let pixels = 0;
        for (let i = 0; i < data.length; i += 4)
          if (
            data[i] === 197 &&
            data[i + 1] === 237 &&
            data[i + 2] === 102
          )
            pixels++;
        return pixels;
      }),
    ).toBeGreaterThan(50);
    await move(0.98);
    await expect(
      desk.getByRole("group", { name: /정원/ }),
    ).toBeVisible();
    await move(0.73);
    await expect(
      desk
        .getByRole("list", { name: "3D 배치 정보" })
        .locator("li"),
    ).toHaveCount(5);
    await expect(
      desk.getByRole("group", { name: /정원/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        Object.keys(localStorage).filter((key) =>
          key.startsWith("bugri:mock:"),
        ),
      ),
    ).toEqual([]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(
      desk
        .getByRole("list", { name: "3D 배치 정보" })
        .locator("li"),
    ).toHaveCount(5);
  });
}
