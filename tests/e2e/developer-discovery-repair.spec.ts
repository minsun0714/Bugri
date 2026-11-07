import { test, expect } from "@playwright/test";

test("guest search, explicit demo login, subscription and profile navigation", async ({
  page,
}) => {
  await page.goto("/discover/developers");
  const input = page.getByRole("searchbox", {
    name: "개발자 검색",
  });
  await input.fill("@bugri-author");
  await input.press("Enter");
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  await expect(input).toBeFocused();
  expect(new URL(page.url()).searchParams.has("user")).toBe(
    false,
  );
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toHaveAttribute("href", "/users/bugri-author");
  await page
    .getByRole("button", {
      name: "타입 개발자 구독하기",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "데모 사용자 선택",
  });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("combobox", { name: "더미 사용자" })
    .click();
  await dialog
    .getByRole("option", { name: "친구", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  const subscribe = page.getByRole("button", {
    name: "타입 개발자 구독하기",
    exact: true,
  });
  await expect(subscribe).toBeFocused();
  await subscribe.press("Enter");
  await expect(
    page.getByText("타입 개발자님을 구독했습니다."),
  ).toBeVisible();
  const toggle = page.getByRole("button", {
    name: "타입 개발자 구독 중 · 관리",
  });
  await toggle.press("Enter");
  const remove = page.getByRole("button", {
    name: "타입 개발자 구독 해제",
    exact: true,
  });
  await remove.press("Enter");
  await expect(subscribe).toBeFocused();
  await expect(input).toHaveValue("@bugri-author");
  await page
    .getByRole("link", { name: "타입 개발자", exact: true })
    .click();
  await expect(page).toHaveURL(
    /\/users\/bugri-author\?user=friend$/,
  );
});

test("out of range and invalid URL searches have actionable recovery", async ({
  page,
}) => {
  await page.goto(
    "/discover/developers?user=friend&page=99",
  );
  await page
    .getByRole("button", { name: "첫 페이지로" })
    .click();
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto(
    `/discover/developers?user=friend&query=${"x".repeat(101)}`,
  );
  await expect(
    page.getByText("검색어는 100자 이하여야 합니다."),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("타입");
  await page
    .getByRole("button", { name: "검색", exact: true })
    .click();
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/discover/developers?user=nonexistent");
  await expect(
    page.getByText("알 수 없는 데모 사용자입니다."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "학습자로 탐색하기" })
    .click();
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
});

test("mobile subscriptions include all target types and return focus after removal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/discover/developers?user=learner");
  const summary = page
    .locator("summary")
    .filter({ hasText: "내 구독" });
  await summary.click();
  const list = page.locator("details");
  await expect(
    list.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    list.getByRole("link", {
      name: "웹 개발자 · #JavaScript",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    list.getByRole("link", { name: "#Web", exact: true }),
  ).toBeVisible();
  await list
    .getByRole("button", { name: "#Web 구독 중 · 관리" })
    .click();
  await list
    .getByRole("button", { name: "#Web 구독 해제" })
    .click();
  await expect(summary).toBeFocused();
  await expect(
    list.getByRole("link", { name: "#Web", exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        window.innerWidth,
    ),
  ).toBe(true);
});

test("a failed subscription can be retried without losing the search or saved state", async ({
  page,
}) => {
  await page.goto(
    "/discover/developers?user=friend&query=타입",
  );
  const button = page.getByRole("button", {
    name: "타입 개발자 구독하기",
    exact: true,
  });
  await expect(button).toBeVisible();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.assign(window, {
      restoreDiscoveryStorage: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = function (key, value) {
      if (key === "bugri:mock:v1:friend")
        throw new Error("quota");
      original.call(this, key, value);
    };
  });
  await button.click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "구독을 저장하지 못했습니다" }),
  ).toContainText("기존 상태는 유지됩니다");
  await expect(button).toBeVisible();
  await expect(page.getByRole("searchbox")).toHaveValue(
    "타입",
  );
  await page.evaluate(() =>
    (
      window as unknown as {
        restoreDiscoveryStorage: () => void;
      }
    ).restoreDiscoveryStorage(),
  );
  await button.click();
  await expect(
    page.getByText("타입 개발자님을 구독했습니다."),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "타입 개발자 구독 중 · 관리",
    }),
  ).toBeVisible();
});

test("corrupt foreign data does not block browsing, and own corruption offers another demo user", async ({
  page,
}) => {
  await page.goto("/discover/developers");
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("bugri:mock:v1:author", "broken"),
  );
  await page.reload();
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("공개 퀴즈 정보를 불러올 수 없습니다."),
  ).toBeVisible();
  await page.goto("/discover/developers?user=author");
  await expect(
    page.getByRole("alert").filter({
      hasText:
        "이 사용자의 저장 데이터를 읽을 수 없습니다. 데이터는 변경하지 않았습니다.",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "다른 데모 사용자로 탐색",
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "웹 개발자" })
    .click();
  await expect(
    page.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("bugri:mock:v1:author"),
    ),
  ).toBe("broken");
});

test("cancelled subscription login does not steal focus from a later header selection", async ({
  page,
}) => {
  await page.goto("/discover/developers");
  const subscribe = page.getByRole("button", {
    name: "타입 개발자 구독하기",
    exact: true,
  });
  await subscribe.click();
  const dialog = page.getByRole("dialog", {
    name: "데모 사용자 선택",
  });
  await dialog
    .getByRole("button", { name: "닫기", exact: true })
    .click();
  await expect(subscribe).toBeFocused();
  await page
    .getByRole("banner")
    .getByRole("button", {
      name: "데모 사용자 선택",
      exact: true,
    })
    .click();
  await dialog
    .getByRole("combobox", { name: "더미 사용자" })
    .click();
  await dialog
    .getByRole("option", { name: "친구", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "선택한 사용자로 시작" })
    .click();
  await expect(page).toHaveURL(/user=friend/);
  await expect(subscribe).toBeEnabled();
  await expect(subscribe).not.toBeFocused();
});

test("subscription modal searches, filters, removes and restores focus on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/discover/developers?user=learner");
  await page
    .locator("summary")
    .filter({ hasText: "내 구독" })
    .click();
  const trigger = page.getByRole("button", {
    name: "전체 보기",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "내 구독",
    exact: true,
  });
  const search = dialog.getByRole("searchbox", {
    name: "내 구독 검색",
  });
  await expect(search).toBeFocused();
  const box = await dialog.boundingBox();
  expect(box?.width).toBe(320);
  expect(box?.height).toBe(740);
  await dialog
    .getByRole("button", {
      name: "개발자별 태그",
      exact: true,
    })
    .click();
  await expect(
    dialog.getByRole("link", {
      name: "웹 개발자 · #JavaScript",
    }),
  ).toBeVisible();
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await search.fill("없는구독");
  await expect(
    dialog.getByText("검색 조건에 맞는 구독이 없습니다."),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "조건 초기화" })
    .click();
  await search.fill("@bugri-author");
  await expect(
    dialog.getByRole("link", {
      name: "타입 개발자",
      exact: true,
    }),
  ).toBeVisible();
  await dialog
    .getByRole("button", {
      name: "타입 개발자 구독 중 · 관리",
    })
    .click();
  await dialog
    .getByRole("button", { name: "타입 개발자 구독 해제" })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "구독 0개" }),
  ).toBeFocused();
  await expect(dialog.getByRole("status")).toContainText(
    "구독을 취소했습니다",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(
    page.locator("summary").filter({ hasText: "내 구독" }),
  ).toContainText("2개");
  await trigger.click();
  await expect(search).toHaveValue("");
  await expect(dialog.getByRole("link")).toHaveCount(2);
  await dialog
    .getByRole("link", { name: "웹 개발자 · #JavaScript" })
    .click();
  await expect(page).toHaveURL(
    /\/developers\/bugri-friend\/quizzes\?user=learner&tag=/,
  );
});

test("subscription actions float without resizing cards or rows and Escape keeps the modal open", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/discover/developers?user=learner");
  const card = page
    .getByRole("region", { name: "개발자 검색 결과" })
    .locator("li")
    .filter({
      has: page.getByRole("link", {
        name: "타입 개발자",
        exact: true,
      }),
    });
  const before = await card.boundingBox();
  await card
    .getByRole("button", {
      name: "타입 개발자 구독 중 · 관리",
    })
    .click();
  await expect(
    card.getByRole("button", {
      name: "타입 개발자 구독 해제",
    }),
  ).toBeVisible();
  expect((await card.boundingBox())?.height).toBe(
    before?.height,
  );
  await page.keyboard.press("Escape");
  await page
    .locator("summary")
    .filter({ hasText: "내 구독" })
    .click();
  await page
    .getByRole("button", { name: "전체 보기", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "내 구독",
    exact: true,
  });
  const row = dialog.getByRole("listitem").last();
  const rowBefore = await row.boundingBox();
  const trigger = row.getByRole("button", {
    name: /구독 중 · 관리/,
  });
  await trigger.click();
  const remove = row.getByRole("button", {
    name: /구독 해제/,
  });
  await expect(remove).toBeVisible();
  expect((await row.boundingBox())?.height).toBe(
    rowBefore?.height,
  );
  const panel = await remove.boundingBox();
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(568);
  await page.keyboard.press("Escape");
  await expect(remove).not.toBeVisible();
  await expect(dialog).toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog
    .getByRole("heading", { name: "내 구독", exact: true })
    .click();
  await expect(remove).not.toBeVisible();
  await expect(dialog).toBeVisible();
});
