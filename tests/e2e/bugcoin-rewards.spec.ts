import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`reward result and restored wallet at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?user=learner");
    await page
      .getByLabel("number", { exact: true })
      .check();
    await page
      .getByRole("button", { name: "답 제출", exact: true })
      .click();
    await expect(
      page.getByText("+2.00 BugCoin", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByText("+2.00 BugCoin", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "내역 보기", exact: true })
      .click();
    await expect(page.getByLabel("내 잔액")).toContainText(
      "102",
    );
    await expect(
      page.getByText("최초 정답 보상", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("일일 첫 정답 보너스", {
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/coin-history?user=author");
    await expect(page.getByLabel("내 잔액")).toContainText(
      "100.4",
    );
    await expect(
      page.getByText("출제 보상", { exact: true }),
    ).toBeVisible();
  });
}

test("merged English UI preserves rewards and translates history reasons", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    locale: "en-US",
  });
  const page = await context.newPage();
  await page.goto("/?user=learner");
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", {
      name: "Submit answer",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("+2.00 BugCoin", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "View history",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("First correct answer reward", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Daily first correct answer bonus", {
      exact: true,
    }),
  ).toBeVisible();
  await context.close();
});

for (const width of [1280, 390]) {
  test(`zero reward explains wrong answers and combined cooldown after reload at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?user=learner");
    await page
      .getByLabel("string", { exact: true })
      .check();
    await page
      .getByRole("button", { name: "답 제출", exact: true })
      .click();
    const info = page.getByRole("button", {
      name: "보상이 없는 이유",
      exact: true,
    });
    await info.focus();
    await expect(page.getByRole("tooltip")).toContainText(
      "이번 답안은 오답으로",
    );
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "다시 풀기",
        exact: true,
      })
      .click();
    await page
      .getByLabel("number", { exact: true })
      .check();
    await page
      .getByRole("button", { name: "답 제출", exact: true })
      .click();
    await expect(
      page.getByText("+1.50 BugCoin", { exact: true }),
    ).toBeVisible();
    await expect(info).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "다시 풀기",
        exact: true,
      })
      .click();
    await page
      .getByLabel("number", { exact: true })
      .check();
    await page
      .getByRole("button", { name: "답 제출", exact: true })
      .click();
    await info.click();
    await expect(page.getByRole("tooltip")).toContainText(
      "복습 보상은",
    );
    await expect(page.getByRole("tooltip")).toContainText(
      "학습일의 일일 보너스는 이미 받았어요.",
    );
    expect(
      await page
        .getByRole("tooltip")
        .evaluate(
          (element) =>
            element.scrollWidth <= element.clientWidth,
        ),
    ).toBe(true);
    const explanation = await page
      .getByRole("tooltip")
      .innerText();
    await page.reload();
    await info.click();
    await expect(page.getByRole("tooltip")).toHaveText(
      explanation,
    );
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      width,
    );
  });
}

test("English zero reward tooltip translates without exposing internal reason codes", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    locale: "en-US",
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  await page.goto("/?user=learner");
  await page.getByLabel("string", { exact: true }).check();
  await page
    .getByRole("button", {
      name: "Submit answer",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Why no reward?",
      exact: true,
    })
    .click();
  await expect(page.getByRole("tooltip")).toHaveText(
    "This answer was incorrect, so no solving reward was awarded.",
  );
  await context.close();
});
