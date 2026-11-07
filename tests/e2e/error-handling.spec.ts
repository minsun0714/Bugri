import { expect, test } from "@playwright/test";

for (const width of [1280, 375]) {
  test(`missing URL and route crash recover at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(
      "/does-not-exist?user=author&attempt=old",
    );
    await expect(
      page.getByRole("heading", {
        name: "페이지를 찾을 수 없습니다",
      }),
    ).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`404-${width}.png`),
    });
    await page
      .getByRole("link", { name: "홈으로 이동" })
      .click();
    await expect(page).toHaveURL(/\/\?user=author$/);
    await page.goto("/ui-preview/errors");
    await page
      .getByRole("button", { name: "렌더링 오류 재현" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "화면을 불러오지 못했습니다",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Error boundary preview"),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`error-${width}.png`),
    });
    await page
      .getByRole("button", { name: "다시 시도" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", {
        name: "오류 복구 미리보기",
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          window.innerWidth,
      ),
    ).toBe(true);
  });
}

for (const width of [1280, 375]) {
  test(`query failure recovers only its own region at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/ui-preview/errors");
    const desk = page.getByRole("region", {
      name: "공개 데스크",
    });
    await expect(desk.getByRole("alert")).toContainText(
      "일시적인 오류",
    );
    await expect(
      page.getByText("다른 프로필 영역"),
    ).toBeVisible();
    await expect(
      page.getByText("private preview detail"),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(`query-${width}.png`),
    });
    await desk
      .getByRole("button", { name: "다시 시도" })
      .click();
    await expect(desk.getByRole("status")).toHaveText(
      "데스크를 다시 불러왔습니다",
    );
    await expect(
      page.getByText("다른 프로필 영역"),
    ).toBeVisible();
  });
}

for (const width of [1280, 375]) {
  test(`public profile isolates an unexpected query failure at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/users/bugri-author");
    const desk = page.getByRole("region", {
      name: "공개 데스크",
    });
    await expect(desk.locator("canvas")).toBeVisible();
    // Test-only fault injection through the mounted QueryClient. No production fault switches.
    const injected = await desk
      .locator("canvas")
      .evaluate((element) => {
        type Client = {
          getQueryCache: () => {
            find: (filters: {
              queryKey: string[];
            }) =>
              | { setState: (state: object) => void }
              | undefined;
          };
        };
        type Fiber = {
          return?: Fiber;
          memoizedProps?: { client?: Client };
        };
        // The renderer creates its canvas imperatively; start at the nearest React-owned ancestor.
        let owner: Element | null = element;
        let fiber: Fiber | undefined;
        while (owner && !fiber) {
          const key = Object.keys(owner).find((name) =>
            name.startsWith("__reactFiber$"),
          );
          if (key)
            fiber = (
              owner as unknown as Record<string, Fiber>
            )[key];
          owner = owner.parentElement;
        }
        while (fiber) {
          const query = fiber.memoizedProps?.client
            ?.getQueryCache()
            .find({
              queryKey: ["profile", "bugri-author"],
            });
          if (query) {
            query.setState({
              data: undefined,
              error: new Error(
                "private injected query failure",
              ),
              status: "error",
              fetchStatus: "idle",
            });
            return true;
          }
          fiber = fiber.return;
        }
        return false;
      });
    expect(injected).toBe(true);
    await expect(desk.getByRole("alert")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "학습 활동" }),
    ).toBeVisible();
    await expect(
      page.getByText("private injected query failure"),
    ).toHaveCount(0);
    await desk.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(
        `profile-query-${width}.png`,
      ),
      fullPage: true,
    });
    await desk
      .getByRole("button", { name: "다시 시도" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(desk.locator("canvas")).toBeVisible();
    await expect(desk.getByRole("alert")).toHaveCount(0);
  });
}
