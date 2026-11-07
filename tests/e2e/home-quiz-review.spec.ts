import { expect, test } from "@playwright/test";

test("visitor quiz stays ephemeral and demo selection starts separate learning", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "답 제출" }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "학습 태그" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "연속 학습" }),
  ).toHaveCount(0);
  const input = page.getByLabel("답안", { exact: true });
  if (await input.count()) await input.fill("const");
  else
    await page
      .locator(
        'main input[type="radio"], main input[type="checkbox"]',
      )
      .first()
      .check();
  await page
    .getByRole("button", { name: "답 제출" })
    .click();
  await expect(
    page.getByRole("region", { name: "제출 결과" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) =>
        key.startsWith("bugri:mock:"),
      ),
    ),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "다음 문제" })
    .click();
  await expect(
    page.getByRole("button", { name: "답 제출" }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "데모 사용자 선택" })
    .click();
  await page
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(page).toHaveURL(/user=learner/);
  await expect(
    page.getByRole("combobox", { name: "학습 태그" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "타입 선언" }),
  ).toBeVisible();
  const completed = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem("bugri:mock:v1:learner")!,
      ).attempts.filter(
        (item: { completedAt: string | null }) =>
          item.completedAt,
      ).length,
  );
  expect(completed).toBe(0);
});

test("small mobile next and replay reveal and focus the new question", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/?user=learner");
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출" })
    .click();
  await page
    .getByRole("button", { name: "다음 문제" })
    .click();
  const start = page
    .locator('main [tabindex="-1"]')
    .filter({
      has: page.getByRole("heading", {
        name: "블록 스코프",
      }),
    });
  await expect(start).toBeFocused();
  const box = await start.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(667);
  await page.getByLabel("let", { exact: true }).check();
  await page.getByLabel("const", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출" })
    .click();
  await page
    .getByRole("button", { name: "다시 풀기" })
    .click();
  await expect(start).toBeFocused();
  await expect(
    page.getByLabel("let", { exact: true }),
  ).not.toBeChecked();
});

test("cancelling demo selection restores the trigger and removes hidden controls", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "답 제출" }),
  ).toBeVisible();
  const trigger = page.getByRole("button", {
    name: "데모 사용자 선택",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByLabel("더미 사용자")).toHaveCount(
    0,
  );
  await trigger.click();
  await page
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
