import { test, expect } from "@playwright/test";

for (const width of [1280, 390, 320]) {
  test(`compact profile order modal saves and cancels at ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/users/bugri-author?user=author");
    const sections = page.locator("[data-profile-section]");
    const order = () =>
      sections.evaluateAll((els) =>
        els.map((el) =>
          el.getAttribute("data-profile-section"),
        ),
      );
    const modal = page.getByRole("dialog", {
      name: "순서 편집",
    });
    const rows = modal.locator("[data-order-row]");
    const draft = () =>
      rows.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-order-row")),
      );
    const edit = page.getByRole("button", {
      name: "순서 편집",
      exact: true,
    });
    await expect(sections).toHaveCount(3);
    const initialHeight = await sections
      .first()
      .evaluate((el) => el.getBoundingClientRect().height);
    await edit.click();
    await expect(modal).toBeVisible();
    await expect(rows).toHaveCount(3);
    await expect(modal.locator("canvas")).toHaveCount(0);
    await expect(
      modal.getByRole("button", {
        name: "내 데스크 드래그하여 이동",
      }),
    ).toBeFocused();
    await modal
      .getByRole("button", {
        name: "최신 공개 퀴즈 위로 이동",
      })
      .click();
    await expect
      .poll(draft)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    await expect
      .poll(order)
      .toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
    expect(
      await sections
        .first()
        .evaluate(
          (el) => el.getBoundingClientRect().height,
        ),
    ).toBe(initialHeight);
    const bounds = (await modal.boundingBox())!;
    expect(bounds.height).toBeLessThan(500);
    expect(bounds.width).toBeLessThanOrEqual(width - 24);
    await page.screenshot({
      path: testInfo.outputPath(`modal-${width}.png`),
      fullPage: true,
    });
    await modal
      .getByRole("button", { name: "취소", exact: true })
      .click();
    await expect(modal).toHaveCount(0);
    await expect(edit).toBeFocused();
    await expect
      .poll(order)
      .toEqual(["DESK", "QUIZZES", "ACTIVITY"]);
    await edit.click();
    await modal
      .getByRole("button", {
        name: "내 데스크 드래그하여 이동",
      })
      .press("ArrowDown");
    await modal
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(modal).toHaveCount(0);
    await expect(
      page.getByText("섹션 순서를 저장했습니다."),
    ).toBeVisible();
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    await page.reload();
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    for (const suffix of ["", "?user=friend"]) {
      await page.goto(`/users/bugri-author${suffix}`);
      await expect
        .poll(order)
        .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
      await expect(edit).toHaveCount(0);
    }
    await page.goto("/users/bugri-author?user=author");
    await edit.click();
    const grip = modal.getByRole("button", {
      name: "최신 공개 퀴즈 드래그하여 이동",
    });
    const from = (await grip.boundingBox())!;
    const target = (await modal
      .locator('[data-order-row="ACTIVITY"]')
      .boundingBox())!;
    await page.mouse.move(from.x + 20, from.y + 20);
    await page.mouse.down();
    await page.mouse.move(target.x + 24, target.y + 24, {
      steps: 10,
    });
    await page.mouse.up();
    await expect
      .poll(draft)
      .toEqual(["DESK", "ACTIVITY", "QUIZZES"]);
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    const original = await page.evaluateHandle(
      () => Storage.prototype.setItem,
    );
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException(
          "full",
          "QuotaExceededError",
        );
      };
    });
    await modal
      .getByRole("button", { name: "저장", exact: true })
      .click();
    await expect(modal.getByRole("alert")).toContainText(
      "순서를 저장하지 못했습니다",
    );
    await expect
      .poll(draft)
      .toEqual(["DESK", "ACTIVITY", "QUIZZES"]);
    await expect
      .poll(order)
      .toEqual(["QUIZZES", "DESK", "ACTIVITY"]);
    await page.screenshot({
      path: testInfo.outputPath(`failed-${width}.png`),
      fullPage: true,
    });
    await page.evaluate((fn) => {
      Storage.prototype.setItem = fn;
    }, original);
    await modal
      .getByRole("button", { name: "다시 저장" })
      .click();
    await expect(modal).toHaveCount(0);
    await expect
      .poll(order)
      .toEqual(["DESK", "ACTIVITY", "QUIZZES"]);
    await edit.click();
    await modal
      .getByRole("button", {
        name: "내 데스크 아래로 이동",
      })
      .click();
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    await expect(edit).toBeFocused();
    await expect
      .poll(order)
      .toEqual(["DESK", "ACTIVITY", "QUIZZES"]);
    await edit.click();
    await modal
      .getByRole("button", {
        name: "내 데스크 아래로 이동",
      })
      .click();
    await modal
      .getByRole("button", { name: "닫기", exact: true })
      .click();
    await expect
      .poll(order)
      .toEqual(["DESK", "ACTIVITY", "QUIZZES"]);
    await expect(edit).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath(`profile-${width}.png`),
      fullPage: true,
    });
  });
}
