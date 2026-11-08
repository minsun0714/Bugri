import { expect, test } from "@playwright/test";

for (const width of [1280, 320]) {
  test(`theme choice, keyboard, persistence and mascot colors at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/ui-preview?user=learner");
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
    await picker.click();
    await expect(root).toHaveCSS("color-scheme", "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(root).toHaveAttribute(
      "data-theme",
      "dark",
    );
    // The preview page has no demo selector; check the product header on home.
    await page.goto("/?user=learner");
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
  await page.goto("/ui-preview");
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
  await page.goto("/ui-preview");
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
