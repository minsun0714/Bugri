import { expect, test } from "@playwright/test";
import { initialState } from "@/mocks/storage";
import { ProfileLinkKind } from "@/api/constants";

for (const width of [1280, 390]) {
  test(`profile information stays together and editing stays secondary at ${width}px`, async ({
    page,
  }, testInfo) => {
    const state = initialState("author");
    state.profileAbout = {
      biography: "백엔드 개발자 이민선입니다.",
      links: [
        {
          kind: ProfileLinkKind.GITHUB,
          url: "https://github.com/minsun0714",
        },
        {
          kind: ProfileLinkKind.OTHER,
          label: "guthub",
          url: "https://github.com/minsun0714",
        },
      ],
    };
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      (value) =>
        localStorage.setItem(
          "bugri:mock:v1:author",
          JSON.stringify(value),
        ),
      state,
    );
    await page.goto("/users/bugri-author?user=author");
    const profile = page.getByRole("region", {
      name: "공개 프로필 정보",
    });
    const biography = profile.getByText(
      "백엔드 개발자 이민선입니다.",
    );
    const links = profile.getByRole("list", {
      name: "프로필 링크",
    });
    const edit = profile.getByRole("button", {
      name: "프로필 편집",
      exact: true,
    });
    const desk = page.getByRole("link", {
      name: "데스크 편집",
      exact: true,
    });
    await expect(biography).toBeVisible();
    await expect(biography).toHaveCSS("font-size", "16px");
    await expect(
      profile.getByRole("link", { name: "GitHub (새 탭)" }),
    ).toContainText("↗");
    await expect(
      profile.getByRole("link", { name: /guthub/ }),
    ).toContainText("github.com");
    const identityBox = await profile
      .getByText("@bugri-author", { exact: true })
      .boundingBox();
    const bioContainer = profile.locator(
      ".markdown-preview",
    );
    await expect(bioContainer).toHaveCSS("padding", "16px");
    await expect(bioContainer).toHaveCSS(
      "border-top-width",
      "1px",
    );
    const bioBox = await bioContainer.boundingBox();
    const linkBox = await links.boundingBox();
    const editBox = await edit.boundingBox();
    const deskBox = await desk.boundingBox();
    expect(
      bioBox!.y -
        Math.max(
          identityBox!.y + identityBox!.height,
          editBox!.y + editBox!.height,
        ),
    ).toBeLessThanOrEqual(24);
    expect(
      linkBox!.y - (bioBox!.y + bioBox!.height),
    ).toBeLessThanOrEqual(24);
    const profileBox = await profile.boundingBox();
    expect(
      Math.abs(bioBox!.x - profileBox!.x),
    ).toBeLessThan(2);
    expect(
      Math.abs(bioBox!.width - profileBox!.width),
    ).toBeLessThan(2);
    const canvasBox = await page
      .getByRole("region", { name: "공개 데스크" })
      .boundingBox();
    expect(
      Math.abs(
        editBox!.x +
          editBox!.width -
          profileBox!.x -
          profileBox!.width,
      ),
    ).toBeLessThan(2);
    expect(editBox!.y).toBeLessThan(bioBox!.y);
    expect(deskBox!.y).toBeGreaterThanOrEqual(
      linkBox!.y + linkBox!.height,
    );
    expect(
      deskBox!.y + deskBox!.height,
    ).toBeLessThanOrEqual(canvasBox!.y);
    await expect(
      profile.getByRole("link", {
        name: "데스크 편집",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      profile.getByRole("heading", {
        name: "타입 개발자",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(edit).toHaveCSS("box-shadow", "none");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            innerWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(
        `profile-layout-${width}.png`,
      ),
      fullPage: true,
    });
    await edit.click();
    await expect(
      page.getByRole("textbox", {
        name: "자기소개 (선택)",
      }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "취소", exact: true })
      .click();
    await expect(edit).toBeFocused();
  });
}

test("custom link domains stay readable and accessible after long labels", async ({
  page,
}, testInfo) => {
  const state = initialState("author");
  const label = "개발 작업물과 프로젝트 기록을 모은 공간";
  const longHost = `${"portfolio".repeat(7)}.example.com`;
  state.profileAbout = {
    biography: "백엔드 개발자입니다.",
    links: [
      {
        kind: ProfileLinkKind.OTHER,
        label,
        url: "https://example.com/project0",
      },
      {
        kind: ProfileLinkKind.OTHER,
        label: "긴 도메인",
        url: `https://${longHost}`,
      },
    ],
  };
  await page.setViewportSize({ width: 390, height: 900 });
  await page.addInitScript(
    (value) =>
      localStorage.setItem(
        "bugri:mock:v1:author",
        JSON.stringify(value),
      ),
    state,
  );
  await page.goto("/users/bugri-author?user=friend");
  const link = page.getByRole("link", {
    name: /개발 작업물.*example\.com.*새 탭/,
  });
  await expect(link).toBeVisible();
  const domain = link.getByText("· example.com", {
    exact: true,
  });
  const lines = await domain.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return new Set(
      Array.from(range.getClientRects(), ({ top }) =>
        Math.round(top),
      ),
    ).size;
  });
  expect(lines).toBe(1);
  await expect(
    page.getByRole("link", {
      name: new RegExp(`긴 도메인.*${longHost}.*새 탭`),
    }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          innerWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("custom-domain-mobile.png"),
    fullPage: true,
  });
});

for (const width of [1280, 390, 320]) {
  test(`empty learner profile groups actions without a blank toolbar at ${width}`, async ({
    page,
  }, testInfo) => {
    const state = initialState("learner");
    state.profileOrder = {
      order: ["QUIZZES", "DESK", "ACTIVITY"],
    };
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      (value) =>
        localStorage.setItem(
          "bugri:mock:v1:learner",
          JSON.stringify(value),
        ),
      state,
    );
    await page.goto("/users/bugri-learner?user=learner");
    const profile = page.getByRole("region", {
      name: "공개 프로필 정보",
    });
    const group = profile.getByRole("group", {
      name: "프로필 관리",
    });
    const sort = group.getByRole("button", {
      name: "순서 편집",
      exact: true,
    });
    const edit = group.getByRole("button", {
      name: "프로필 편집",
      exact: true,
    });
    await expect(sort).toBeEnabled();
    await expect(edit).toBeEnabled();
    const sortBox = (await sort.boundingBox())!;
    const editBox = (await edit.boundingBox())!;
    expect(Math.abs(sortBox.y - editBox.y)).toBeLessThan(2);
    const profileBox = (await profile.boundingBox())!;
    const quizzes = page.getByRole("region", {
      name: "개발자의 공개 퀴즈",
    });
    const quizBox = (await quizzes.boundingBox())!;
    expect(
      quizBox.y - profileBox.y - profileBox.height,
    ).toBeLessThanOrEqual(32);
    expect(quizBox.height).toBeLessThan(150);
    await expect(
      quizzes.getByText("공개된 퀴즈가 없습니다", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      quizzes.getByRole("link", { name: "전체 보기 →" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            innerWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`header-${width}.png`),
      fullPage: true,
    });
    await sort.click();
    await expect(
      page.getByRole("dialog", { name: "순서 편집" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sort).toBeFocused();
    await edit.click();
    await expect(
      page.getByRole("textbox", {
        name: "자기소개 (선택)",
      }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "취소", exact: true })
      .click();
    await expect(edit).toBeFocused();
    await page.goto("/users/bugri-learner?user=friend");
    await expect(
      page.getByRole("button", {
        name: "순서 편집",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "프로필 편집",
        exact: true,
      }),
    ).toHaveCount(0);
  });
}
