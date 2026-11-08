import { expect, test } from "@playwright/test";

for (const width of [1280, 320]) {
  test(`theme choice, keyboard, persistence and mascot colors at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/discover/developers?user=learner");
    const root = page.locator("html");
    const picker = page.getByRole("button", {
      name: /모드로 전환/,
    });
    const mascot = page.locator(".bugri-pet").first();
    await expect(root).toHaveAttribute(
      "data-theme",
      "dark",
    );
    await expect(picker).toHaveAccessibleName(
      "라이트 모드로 전환",
    );
    await expect(root).toHaveAttribute(
      "data-theme-preference",
      "system",
    );
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
    await expect(picker).toBeFocused();
    await expect(root).toHaveAttribute(
      "data-theme",
      "light",
    );
    await expect(picker).toHaveAccessibleName(
      "다크 모드로 전환",
    );
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
    await expect(root).toHaveCSS("color-scheme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(root).toHaveAttribute(
      "data-theme",
      "dark",
    );
    if (width < 1024)
      await page
        .getByRole("button", { name: "메뉴 열기" })
        .click();
    await expect(
      page.getByRole("link", { name: /화면 설정$/ }),
    ).toHaveCount(0);
    await page.goto("/settings?user=learner");
    await expect(page).toHaveURL(/settings\?user=learner/);
    await page
      .getByRole("radio", { name: "시스템 설정 따르기" })
      .check();
    await expect(root).toHaveAttribute(
      "data-theme",
      "light",
    );
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(root).toHaveAttribute(
      "data-theme",
      "dark",
    );
    if (width < 1024) {
      const themeBox = await picker.boundingBox();
      const demoBox = await page
        .getByRole("button", {
          name: "데모 사용자 선택",
          exact: true,
        })
        .boundingBox();
      expect(demoBox!.y - themeBox!.y).toBeLessThan(70);
    }
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
    .getByRole("button", { name: /모드로 전환/ })
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
    .getByRole("button", { name: /모드로 전환/ })
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
  const picker = page.getByRole("button", {
    name: /모드로 전환/,
  });
  const mascot = page.locator(".bugri-pet").first();
  for (const label of ["라이트", "다크"]) {
    await session.send(
      "Emulation.setAutoDarkModeOverride",
      { enabled: false },
    );
    await picker.click();
    await expect(picker).toHaveAccessibleName(
      label === "라이트"
        ? "다크 모드로 전환"
        : "라이트 모드로 전환",
    );
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

test("guest settings restore system following and keyboard toggles both ways", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/discover/developers");
  await page
    .getByRole("button", { name: "다크 모드로 전환" })
    .focus();
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    "light",
  );
  await expect(
    page.getByRole("link", {
      name: "화면 설정",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/settings$/);
  await page
    .getByRole("radio", { name: "시스템 설정 따르기" })
    .check();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "시스템 설정 따르기" }),
  ).toBeChecked();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(
    page.getByRole("button", {
      name: "라이트 모드로 전환",
    }),
  ).toBeVisible();
});

for (const width of [1280, 320]) {
  test(`English appearance settings preserve system behavior at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      locale: "en-US",
      colorScheme: "light",
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/discover/developers?user=learner");
    await page
      .getByRole("button", { name: "Switch to dark mode" })
      .click();
    if (width < 1024)
      await page
        .getByRole("button", { name: "Open menu" })
        .click();
    await expect(
      page.getByRole("link", {
        name: /Appearance settings$/,
      }),
    ).toHaveCount(0);
    await page.goto("/settings?user=learner");
    await expect(
      page.getByRole("heading", {
        name: "Appearance settings",
      }),
    ).toBeVisible();
    await page
      .getByRole("radio", {
        name: "Follow system settings",
      })
      .check();
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "light",
    );
    await expect(page).toHaveURL(/settings\?user=learner/);
    await context.close();
  });
}
