import { expect, test } from "@playwright/test";

for (const width of [1100, 390]) {
  test(`whole furnishing group stays centred through orbit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      "/my/desk",
      "/shop",
      "/users/bugri-learner",
    ]) {
      await page.goto(path);
      if (path === "/shop") {
        await page
          .getByRole("article")
          .filter({
            has: page.getByRole("heading", {
              name: "라벤더 키보드",
              exact: true,
            }),
          })
          .getByRole("button", { name: "장착해 보기" })
          .click();
      }
      const scope =
        path === "/shop"
          ? page.getByRole("dialog")
          : page.getByRole("main");
      const canvas = scope.locator(
        '[data-renderer="canvas"] canvas',
      );
      await expect(canvas).toBeVisible();
      await canvas.scrollIntoViewIfNeeded();
      const placements = await scope
        .getByLabel("3D 배치 정보")
        .textContent();
      const box = (await canvas.boundingBox())!;
      if (path === "/shop") {
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.wheel(0, 3000);
      }
      for (let turn = 0; turn < 5; turn++) {
        const deviation = await canvas.evaluate(
          (element) => {
            const c = element as HTMLCanvasElement;
            const { data } = c
              .getContext("2d")!
              .getImageData(0, 0, c.width, c.height);
            let min = c.width;
            let max = 0;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] < 250) continue;
              const x = (i / 4) % c.width;
              min = Math.min(min, x);
              max = Math.max(max, x);
            }
            return (
              Math.abs((min + max) / 2 - c.width / 2) /
              c.width
            );
          },
        );
        expect(deviation).toBeLessThan(0.015);
        await expect(
          scope.getByLabel("3D 배치 정보"),
        ).toHaveText(placements!);
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(box.x + 190, box.y + 10, {
          steps: 10,
        });
        await page.mouse.up();
      }
    }
  });
}
