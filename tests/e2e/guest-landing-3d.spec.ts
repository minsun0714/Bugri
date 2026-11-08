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
        box.y + (box.height - height) * (progress / 1.625),
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
    await move(0.765);
    const monitor = desk
      .getByRole("list", { name: "3D 배치 정보" })
      .locator("li")
      .filter({ hasText: "모니터" });
    await expect(monitor).toBeAttached();
    await expect
      .poll(async () => {
        const text = await monitor.textContent();
        return Number(text?.match(/높이\s*([\d.]+)/)?.[1]);
      })
      .toBeGreaterThan(1.55);
    await expect(monitor).toContainText("1.55");
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
    await move(1.625);
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

test("room paint follows scroll, pauses, and never unpaints", async ({
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
  const box = (await page
    .locator('section[aria-labelledby="landing-title"]')
    .boundingBox())!;
  const move = async (progress: number) =>
    page.evaluate(
      (top) => scrollTo({ top, behavior: "instant" }),
      box.y + (box.height - 1000) * (progress / 1.625),
    );
  await move(1.3125);
  const canvas = page
    .getByTestId("reward-desk")
    .locator("canvas");
  await expect(canvas).toBeVisible();
  const edges = () =>
    canvas.evaluate((element) => {
      const c = element as HTMLCanvasElement;
      const ctx = c.getContext("2d")!;
      return [
        [0.1, 0.1],
        [0.8, 0.1],
        [0.1, 0.8],
        [0.9, 0.9],
      ].map(
        ([x, y]) =>
          ctx.getImageData(
            Math.floor(c.width * x),
            Math.floor(c.height * y),
            1,
            1,
          ).data[3],
      );
    });
  await expect.poll(edges).toEqual([255, 255, 255, 0]);
  await page.waitForTimeout(1200);
  expect(await edges()).toEqual([255, 255, 255, 0]);
  await move(1.1);
  await expect.poll(edges).toEqual([255, 255, 255, 0]);
  await move(1.625);
  await expect.poll(edges).toEqual([255, 255, 255, 255]);
});
