import {
  test,
  expect,
  type Locator,
} from "@playwright/test";
import { initialState } from "@/mocks/storage";
import { QuizStatus } from "@/api/constants";

async function expectReactionOnRight(card: Locator) {
  const box = await card.boundingBox();
  const button = await card
    .getByRole("button", { name: "싫어요", exact: true })
    .boundingBox();
  expect(
    box!.x + box!.width - (button!.x + button!.width),
  ).toBeLessThan(24);
  expect(button!.x - box!.x).toBeGreaterThan(24);
}

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
    await expect(like).toBeEnabled();
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
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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
    await expect(like).toBeEnabled();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "false",
    );
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

for (const width of [1280, 320]) {
  test(`list and unsolved cards expose reactions at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/tags/typescript/quizzes?user=learner",
    );
    const card = page.getByRole("article").filter({
      has: page.getByRole("link", { name: /타입 선언/ }),
    });
    const like = card.getByRole("button", {
      name: "좋아요",
      exact: true,
    });
    await expect(like).toBeEnabled();
    await expect(like.locator("svg")).toBeVisible();
    await expect(like).toHaveText("0명");
    await expectReactionOnRight(card);
    expect(
      (await like.boundingBox())!.width,
    ).toBeGreaterThanOrEqual(44);
    expect((await like.boundingBox())!.height).toBe(44);
    await like.click();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page).toHaveURL(
      /tags\/typescript\/quizzes/,
    );
    await expect(like).toHaveText("1명");
    await page.screenshot({
      path: `/tmp/bugri-reaction-cards/${width}-tag.png`,
      fullPage: true,
    });
    await card
      .getByRole("link", { name: /타입 선언/ })
      .click();
    const solveLike = page.getByRole("button", {
      name: "좋아요",
      exact: true,
    });
    await expect(solveLike).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page).toHaveURL(/\/solve\?/);
    await expect(
      page.getByLabel("number", { exact: true }),
    ).toBeVisible();
    const evaluation = await page
      .getByRole("group", {
        name: "문제 평가",
        exact: true,
      })
      .boundingBox();
    const answer = await page
      .getByLabel("number", { exact: true })
      .boundingBox();
    const submit = await page
      .getByRole("button", { name: "답 제출", exact: true })
      .boundingBox();
    expect(evaluation!.y).toBeGreaterThan(
      answer!.y + answer!.height,
    );
    expect(evaluation!.x + evaluation!.width).toBeLessThan(
      submit!.x,
    );
    expect(
      Math.abs(
        evaluation!.y +
          evaluation!.height / 2 -
          (submit!.y + submit!.height / 2),
      ),
    ).toBeLessThan(2);

    await expect(
      page.getByRole("button", {
        name: "답 제출",
        exact: true,
      }),
    ).toBeVisible();
    await solveLike.click();
    await expect(solveLike).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await page.screenshot({
      path: `/tmp/bugri-reaction-cards/${width}-unsolved.png`,
      fullPage: true,
    });
    for (const path of [
      "/developers/bugri-author/quizzes",
      "/users/bugri-author",
    ]) {
      await page.goto(`${path}?user=learner`);
      const authorCard = page.getByRole("article").filter({
        has: page.getByRole("link", {
          name: /타입 선언/,
        }),
      });
      const dislike = authorCard.getByRole("button", {
        name: "싫어요",
        exact: true,
      });
      await expect(dislike).toBeEnabled();
      await expectReactionOnRight(authorCard);
      await dislike.click();
      await expect(dislike).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.screenshot({
        path: `/tmp/bugri-reaction-cards/${width}-${path.startsWith("/users") ? "profile" : "developer"}.png`,
        fullPage: true,
      });
      await dislike.click();
      await expect(dislike).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    }
  });
}

test("guest cards open explicit demo selection without saving a reaction", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/tags/typescript/quizzes",
    "/users/bugri-author",
  ]) {
    await page.goto(path);
    const like = page
      .getByRole("button", { name: "좋아요", exact: true })
      .first();
    await expect(like).toBeEnabled();
    await like.click();
    const dialog = page.getByRole("dialog", {
      name: "데모 사용자 선택",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(like).toBeFocused();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      await page.evaluate(() =>
        Object.keys(localStorage)
          .filter((key) => key.startsWith("bugri:mock:"))
          .some(
            (key) =>
              (
                JSON.parse(localStorage.getItem(key)!)
                  .quizReactions ?? []
              ).length > 0,
          ),
      ),
    ).toBe(false);
  }
  await page
    .getByRole("button", { name: "좋아요", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(page).toHaveURL(/user=learner/);
  await expect(
    page
      .getByRole("button", { name: "좋아요", exact: true })
      .first(),
  ).toHaveAttribute("aria-pressed", "false");
});

for (const width of [1280, 320]) {
  test(`public management cards show right-aligned reactions at ${width}px`, async ({
    page,
  }) => {
    const state = initialState("learner");
    const source = initialState("author").quizzes.find(
      ({ status }) => status === QuizStatus.PUBLIC,
    )!;
    state.quizzes.push({
      ...source,
      quizId: "managed-reaction-quiz",
      ownerUserId: "learner",
    });
    await page.addInitScript((value) => {
      if (!localStorage.getItem("bugri:mock:v1:learner"))
        localStorage.setItem(
          "bugri:mock:v1:learner",
          JSON.stringify(value),
        );
    }, state);
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/quizzes/authoring/manage?user=learner&status=PUBLIC",
    );
    const card = page.getByRole("article", {
      name: source.active!.title,
      exact: true,
    });
    const like = card.getByRole("button", {
      name: "좋아요",
      exact: true,
    });
    await expect(like).toBeEnabled();
    await expectReactionOnRight(card);
    await like.click();
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(like).toHaveText("1명");
    await expect(page).not.toHaveURL(/[?&]quiz=/);
    await page.reload();
    await expect(like).toHaveText("1명");
    await expect(like).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.screenshot({
      path: `/tmp/bugri-reaction-cards/${width}-manage.png`,
      fullPage: true,
    });
    await card
      .getByRole("button", { name: /관리하기$/ })
      .click();
    await expect(page).toHaveURL(
      /quiz=managed-reaction-quiz/,
    );
  });
}
