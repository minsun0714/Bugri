import { test, expect } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`individual quiz reactions persist, replace and cancel at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?user=learner");
    const like = page.getByRole("button", {
      name: "좋아요",
      exact: true,
    });
    const dislike = page.getByRole("button", {
      name: "싫어요",
      exact: true,
    });
    await expect(
      page.getByRole("button", {
        name: "답 제출",
        exact: true,
      }),
    ).toBeVisible();
    await expect(like).toHaveCount(0);
    await page
      .getByLabel("number", { exact: true })
      .check();
    await page
      .getByRole("button", { name: "답 제출", exact: true })
      .click();
    await expect(like).toBeEnabled();
    expect(
      (await like.boundingBox())!.height,
    ).toBeGreaterThanOrEqual(44);
    expect(
      (await dislike.boundingBox())!.height,
    ).toBeGreaterThanOrEqual(44);
    await like.click();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.reload();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await dislike.click();
    await expect(dislike).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await page.screenshot({
      path: `/tmp/bugri-reactions/${width}-selected.png`,
      fullPage: true,
    });
    await dislike.focus();
    await page.keyboard.press("Enter");
    await expect(dislike).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await like.click();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page
      .getByRole("button", {
        name: "다시 풀기",
        exact: true,
      })
      .click();
    await expect(like).toHaveCount(0);
    await page
      .getByLabel("number", { exact: true })
      .check();
    await page
      .getByRole("button", { name: "답 제출", exact: true })
      .click();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page
      .getByRole("button", {
        name: "다음 문제",
        exact: true,
      })
      .click();
    await expect(like).toHaveCount(0);
  });
}

test("failed save keeps the selection and allows retry", async ({
  page,
}) => {
  await page.goto("/?user=learner");
  await page.getByLabel("number", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  const like = page.getByRole("button", {
    name: "좋아요",
    exact: true,
  });
  await expect(like).toBeEnabled();
  await like.click();
  await expect(like).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      Storage.prototype.setItem = original;
      throw new Error(
        `blocked ${key.length + value.length}`,
      );
    };
  });
  const dislike = page.getByRole("button", {
    name: "싫어요",
    exact: true,
  });
  await dislike.click();
  await expect(
    page.getByText(
      "평가를 저장하지 못했어요. 버튼을 눌러 다시 시도해 주세요.",
    ),
  ).toBeVisible();
  await expect(like).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.screenshot({
    path: "/tmp/bugri-reactions/error.png",
    fullPage: true,
  });
  await dislike.click();
  await expect(dislike).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
