import { expect, test } from "@playwright/test";

for (const width of [1100, 390]) {
  test(`room encloses the viewport at minimum zoom and every orientation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/shop");
    for (const name of ["정원", "달빛 작업실"]) {
      await page
        .getByRole("article")
        .filter({
          has: page.getByRole("heading", {
            name,
            exact: true,
          }),
        })
        .getByRole("button", { name: "장착해 보기" })
        .click();
      const dialog = page.getByRole("dialog");
      const canvas = dialog.locator("canvas");
      await expect(canvas).toBeVisible();
      await canvas.scrollIntoViewIfNeeded();
      const box = (await canvas.boundingBox())!;
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.wheel(0, 3000);
      const uncovered = () =>
        canvas.evaluate((element) => {
          const c = element as HTMLCanvasElement;
          const { data } = c
            .getContext("2d")!
            .getImageData(0, 0, c.width, c.height);
          let count = 0;
          for (let y = 2; y < c.height - 2; y++)
            for (let x = 2; x < c.width - 2; x++)
              if (data[(y * c.width + x) * 4 + 3] < 250)
                count++;
          return count;
        });
      await expect.poll(uncovered).toBe(0);
      const checkCorner = async () => {
        const corner = await canvas.evaluate(
          (element, night) => {
            const c = element as HTMLCanvasElement;
            const { data } = c
              .getContext("2d")!
              .getImageData(0, 0, c.width, c.height);
            const wall = night
              ? [65, 68, 101]
              : [237, 241, 223];
            const side = night
              ? [53, 57, 84]
              : [220, 231, 204];
            return [0.03, 0.12].map((fraction) => {
              const y = Math.floor(c.height * fraction);
              for (let x = 2; x < c.width - 2; x++) {
                const matches = (
                  at: number,
                  rgb: number[],
                ) =>
                  rgb.every(
                    (v, channel) =>
                      data[
                        (y * c.width + at) * 4 + channel
                      ] === v,
                  );
                if (
                  (matches(x - 2, side) &&
                    matches(x + 2, wall)) ||
                  (matches(x - 2, wall) &&
                    matches(x + 2, side))
                )
                  return x;
              }
              throw new Error("Wall corner missing");
            });
          },
          name === "달빛 작업실",
        );
        expect(
          Math.abs(corner[0] - corner[1]),
        ).toBeLessThanOrEqual(1);
        const intrinsicWidth = await canvas.evaluate(
          (element) => (element as HTMLCanvasElement).width,
        );
        expect(
          Math.abs(corner[0] - intrinsicWidth / 2),
        ).toBeLessThanOrEqual(2);
      };
      await checkCorner();

      for (let turn = 0; turn < 4; turn++) {
        await page.mouse.move(box.x + 10, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(box.x + 190, box.y + 10, {
          steps: 8,
        });
        await page.mouse.up();
        await expect.poll(uncovered).toBe(0);
        await checkCorner();
      }
      const wallPixels = () =>
        canvas.evaluate((element) => {
          const c = element as HTMLCanvasElement;
          return Array.from(
            c
              .getContext("2d")!
              .getImageData(
                0,
                Math.floor(c.height * 0.04),
                c.width,
                1,
              ).data,
          );
        });
      for (const dx of [70, 40, -110]) {
        const previousWalls = await wallPixels();
        await page.mouse.move(box.x + 160, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(
          box.x + 160 + dx,
          box.y + 10,
          { steps: 8 },
        );
        await page.mouse.up();
        expect(await wallPixels()).not.toEqual(
          previousWalls,
        );
        const floorCenter = await canvas.evaluate(
          (element, night) => {
            const c = element as HTMLCanvasElement;
            const y = Math.floor(c.height * 0.8);
            const { data } = c
              .getContext("2d")!
              .getImageData(0, y, c.width, 1);
            const rgb = night
              ? [104, 102, 135]
              : [215, 223, 191];
            const xs: number[] = [];
            for (let x = 0; x < c.width; x++)
              if (
                rgb.every(
                  (v, channel) =>
                    data[x * 4 + channel] === v,
                )
              )
                xs.push(x);
            return (
              Math.abs(
                (Math.min(...xs) + Math.max(...xs)) / 2 -
                  c.width / 2,
              ) / c.width
            );
          },
          name === "달빛 작업실",
        );
        expect(floorCenter).toBeLessThan(0.05);
      }
      for (const [start, end] of [
        [290, 10],
        [10, 290],
        [10, 290],
      ]) {
        await page.mouse.move(box.x + 10, box.y + start);
        await page.mouse.down();
        await page.mouse.move(box.x + 10, box.y + end, {
          steps: 8,
        });
        await page.mouse.up();
        await expect.poll(uncovered).toBe(0);
      }
      await dialog
        .getByRole("button", { name: "닫기", exact: true })
        .click();
    }
  });
}
