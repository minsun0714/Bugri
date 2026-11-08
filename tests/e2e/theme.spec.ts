import { expect, test } from "@playwright/test";

for (const width of [1280, 320]) {
  test(`theme choice, keyboard, persistence and mascot colors at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/discover/developers?user=learner");
    const root = page.locator("html");
    const picker = page.getByRole("combobox", {
      name: "화면 테마",
    });
    const mascot = page.locator(".bugri-pet").first();
    await expect(root).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await expect(picker).toHaveText("시스템");
    await expect(mascot).toBeVisible();
    const colors = await mascot.evaluate((node) =>
      Array.from(node.querySelectorAll("div, span")).map(
        (part) => {
          const style = getComputedStyle(part);
          return [
            style.backgroundColor,
            style.borderTopColor,
          ];
        },
      ),
    );
    await picker.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(picker).toBeFocused();
    await expect(root).toHaveAttribute(
      "data-theme",
      "light",
    );
    await expect(picker).toHaveText("라이트");
    expect(
      await mascot.evaluate((node) =>
        Array.from(node.querySelectorAll("div, span")).map(
          (part) => {
            const style = getComputedStyle(part);
            return [
              style.backgroundColor,
              style.borderTopColor,
            ];
          },
        ),
      ),
    ).toEqual(colors);
    await page.reload();
    await expect(root).toHaveAttribute(
      "data-theme",
      "light",
    );
    await page
      .getByRole("link", { name: "Bugri 홈" })
      .click();
    // The home route scrolls to its learning section; return to the header.
    await expect(
      page.getByRole("heading", {
        name: "오늘의 퀴즈",
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(() =>
      window.scrollTo({ top: 0, behavior: "instant" }),
    );
    await expect(root).toHaveAttribute(
      "data-theme",
      "light",
    );
    await picker.click();
    await page
      .getByRole("option", { name: "다크", exact: true })
      .click();
    await expect(root).toHaveCSS("color-scheme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(root).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await picker.click();
    await page
      .getByRole("option", { name: "시스템", exact: true })
      .click();
    await expect(root).toHaveAttribute(
      "data-theme",
      "light",
    );
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(root).toHaveAttribute(
      "data-theme",
      "dark",
    );
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    ).toBe(true);
  });
}

test("saved dark mode is styled before hydration scripts can load", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() =>
    localStorage.setItem("bugri.theme", "dark"),
  );
  await page.route("**/_next/**/*.js*", (route) =>
    route.abort(),
  );
  await page.goto("/discover/developers");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(23, 19, 31)",
  );
});

test("unavailable browser storage still permits an explicit selection", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await page.goto("/ui-preview");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page
    .getByRole("combobox", { name: "화면 테마" })
    .click();
  await page
    .getByRole("option", { name: "라이트", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "light",
  );
});

test("site theme preserves room canvas artwork", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/users/bugri-learner");
  const canvas = page.locator(
    '[data-renderer="canvas"] canvas',
  );
  await expect(canvas).toBeVisible();
  const readArtwork = () =>
    canvas.evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const { data } = canvas
        .getContext("2d")!
        .getImageData(0, 0, canvas.width, canvas.height);
      // The corners are deliberately transparent. Compare all painted pixel data.
      let painted = 0;
      let hash = 2166136261;
      for (let index = 0; index < data.length; index += 4) {
        if (!data[index + 3]) continue;
        painted++;
        for (let channel = 0; channel < 4; channel++)
          hash = Math.imul(
            hash ^ data[index + channel],
            16777619,
          );
      }
      return { painted, hash };
    });
  await expect
    .poll(async () => (await readArtwork()).painted)
    .toBeGreaterThan(1000);
  const before = await readArtwork();
  await page
    .getByRole("combobox", { name: "화면 테마" })
    .click();
  await page
    .getByRole("option", { name: "다크", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  expect(await readArtwork()).toEqual(before);
});

test("headerless error pages continue following the system", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/missing-theme-page");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "light",
  );
});

test("Chrome auto dark mode preserves the mascot in both site themes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/discover/developers");
  const session = await page.context().newCDPSession(page);
  const picker = page.getByRole("combobox", {
    name: "화면 테마",
  });
  const mascot = page.locator(".bugri-pet").first();
  for (const label of ["라이트", "다크"]) {
    await session.send(
      "Emulation.setAutoDarkModeOverride",
      { enabled: false },
    );
    await picker.click();
    await page
      .getByRole("option", { name: label, exact: true })
      .click();
    const original = await mascot.screenshot({
      animations: "disabled",
    });
    await session.send(
      "Emulation.setAutoDarkModeOverride",
      { enabled: true },
    );
    expect(
      await mascot.screenshot({ animations: "disabled" }),
    ).toEqual(original);
  }
});
