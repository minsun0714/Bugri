import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`repeated direction changes skip the retained desk hold at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(
      page.getByRole("button", {
        name: "답 제출",
        exact: true,
      }),
    ).toBeAttached();

    const section = page.locator(
      'section[aria-labelledby="landing-title"]',
    );
    const box = (await section.boundingBox())!;
    const position = (progress: number) =>
      box.y + ((box.height - 900) * progress) / 1.625;
    const desk = page.getByTestId("reward-desk");
    const move = (progress: number) =>
      page.evaluate(
        (top) => scrollTo({ top, behavior: "instant" }),
        position(progress),
      );

    await move(1.6);
    await expect(
      desk.getByRole("group", { name: /정원/ }),
    ).toBeVisible();
    await page.mouse.move(width / 2, 450);
    await page.mouse.wheel(0, -80);
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeLessThan(position(0.73));
    await expect(
      desk.getByRole("group", { name: /정원/ }),
    ).toBeVisible();

    await page.mouse.wheel(0, -450);
    await expect(
      page.locator("#landing-title"),
    ).toBeVisible();
    // Programmatic navigation stays native; a new downward gesture resumes the seen scene.
    await move(1.1);
    await move(0.95);
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeCloseTo(position(0.95), 0);
    await page.mouse.wheel(0, 80);
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThanOrEqual(Math.floor(position(1.6)));
    expect(await page.evaluate(() => scrollY)).toBeLessThan(
      position(1.625),
    );

    await move(1.3);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve()),
          ),
        ),
    );
    await page.keyboard.press("PageUp");
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeLessThan(position(0.73));
    await page.keyboard.press("PageDown");
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThanOrEqual(Math.floor(position(1.6)));
  });
}

for (const width of [390, 1440]) {
  test(`downward return skips only the seen portion at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
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
    const position = (progress: number) =>
      box.y + ((box.height - 900) * progress) / 1.625;
    await page.evaluate(
      (top) => scrollTo({ top, behavior: "instant" }),
      position(1.3),
    );
    await expect(
      page
        .getByTestId("reward-desk")
        .getByRole("group", { name: /정원/ }),
    ).toBeVisible();
    await page.mouse.move(width / 2, 450);
    for (let cycle = 0; cycle < 2; cycle++) {
      await page.mouse.wheel(0, -80);
      await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeLessThan(position(0.73));
      await page.mouse.wheel(0, 80);
      await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeCloseTo(position(1.3), 0);
    }
    await page.mouse.wheel(0, 80);
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(position(1.3));
    expect(await page.evaluate(() => scrollY)).toBeLessThan(
      position(1.4),
    );
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => scrollY)).toBeLessThan(
      position(1.4),
    );
  });
}
