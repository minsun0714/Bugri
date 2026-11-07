import { test, expect, type Page } from "@playwright/test";
import { initialState } from "@/mocks/storage";
import { QuizStatus } from "@/api/constants";
import type { Subscription } from "@/api/contracts";

async function seed(
  page: Page,
  subscriptions: Subscription[] = [
    {
      type: "HASHTAG",
      hashtagId: "web",
      subscriptionId: "test-web",
    },
    {
      type: "PERSON",
      authorUserId: "author",
      subscriptionId: "test-author",
    },
    {
      type: "HASHTAG",
      hashtagId: "javascript",
      subscriptionId: "test-js",
    },
  ],
) {
  const state = initialState("learner");
  state.subscriptions = subscriptions;
  await page.addInitScript((value) => {
    if (!localStorage.getItem("bugri:mock:v1:learner"))
      localStorage.setItem(
        "bugri:mock:v1:learner",
        JSON.stringify(value),
      );
  }, state);
}

async function submit(page: Page, labels: string[]) {
  if (labels.length) {
    for (const label of labels)
      await page.getByLabel(label, { exact: true }).check();
  } else
    await page
      .getByLabel("답안", { exact: true })
      .fill("const");
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: /버그리/ }),
  ).toHaveCount(0);
  await expect(page.getByText("잘했어!", { exact: true })).toHaveCount(
    0,
  );
}

test("home immediately shows a subscribed question without a list or start button", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: /풀이 시작|문제 목록|타입 선언 풀기/,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByText("숫자 타입은 number입니다.", {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page).toHaveURL(/attempt=/);
  const attempts = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem("bugri:mock:v1:learner")!,
      ).attempts.length,
  );
  expect(attempts).toBe(1);
});

test("four formats, restoration, next, exhaustion and replay on home", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  for (const labels of [
    ["number"],
    ["let", "const"],
    ["참"],
    [],
  ]) {
    await expect(
      page.getByRole("button", {
        name: "답 제출",
        exact: true,
      }),
    ).toBeDisabled();
    await submit(page, labels);
    const url = page.url();
    await page.reload();
    await expect(
      page.getByText("정답입니다", { exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(url);
    await expect(
      page.getByRole("button", {
        name: "완료 확인",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "다시 풀기",
        exact: true,
      }),
    ).toHaveClass(/secondary/);
    await expect(
      page.getByRole("button", {
        name: "다음 문제",
        exact: true,
      }),
    ).toHaveClass(/primary/);
    await page
      .getByRole("button", {
        name: "다음 문제",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByText("이 태그의 문제를 모두 풀었어요", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByText("숫자 타입은 number입니다.", {
      exact: true,
    }),
  ).toHaveCount(0);
});

test("tag filtering persists through next and reload without changing subscriptions", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("combobox", {
      name: "학습 태그",
      exact: true,
    })
    .click();
  await page
    .getByRole("option", {
      name: "JavaScript",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "블록 스코프",
      exact: true,
    }),
  ).toBeVisible();
  await submit(page, ["let", "const"]);
  await page
    .getByRole("button", { name: "다음 문제", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "불변 선언",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByLabel("학습 태그", { exact: true }),
  ).toHaveText("JavaScript");
  await submit(page, []);
  await page
    .getByRole("button", { name: "다음 문제", exact: true })
    .click();
  await expect(
    page.getByText("이 태그의 문제를 모두 풀었어요", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "다른 태그 선택",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "개발자·태그 탐색",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "타입 개발자 학습하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toBeVisible();
  const counts = await page.evaluate(() => {
    const state = JSON.parse(
      localStorage.getItem("bugri:mock:v1:learner")!,
    );
    return {
      subscriptions: state.subscriptions.length,
      completed: state.attempts.filter(
        (a: { completedAt: string | null }) =>
          a.completedAt,
      ).length,
      days: state.days.length,
    };
  });
  expect(counts).toEqual({
    subscriptions: 3,
    completed: 2,
    days: 1,
  });
});

test("no subscriptions means empty state, never public recommendations", async ({
  page,
}) => {
  await page.goto("/?user=friend");
  await expect(
    page.getByText("학습할 퀴즈가 없습니다", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/개발자·태그를 탐색하고 구독/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /답 제출|다시 풀기/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("replay creates a separate attempt and users cannot read each other's result", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await submit(page, ["number"]);
  const completed = page.url();
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(page).not.toHaveURL(completed);
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeDisabled();
  await page
    .getByText("프로토타입 안내 · 사용자 전환", {
      exact: true,
    })
    .click();
  await page
    .getByLabel("더미 사용자", { exact: true })
    .selectOption("friend");
  await expect(
    page.getByText("학습할 퀴즈가 없습니다", {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto(
    completed.replace("user=learner", "user=friend"),
  );
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toBeVisible();
  await expect(
    page.getByText("숫자 타입은 number입니다.", {
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto(completed);
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
});

test("private transition blocks pending submission and hides completed content", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await submit(page, ["number"]);
  const completed = page.url();
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await page.getByLabel("number", { exact: true }).check();
  const state = initialState("author");
  state.quizzes[0].status = QuizStatus.PRIVATE;
  await page.evaluate(
    (value) =>
      localStorage.setItem(
        "bugri:mock:v1:author",
        JSON.stringify(value),
      ),
    state,
  );
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toContainText("더 이상 이용할 수 없습니다");
  await page.goto(completed);
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/완료 기록과 이미 획득한 성과는 유지/),
  ).toBeVisible();
  await expect(
    page.getByText("숫자 타입은 number입니다.", {
      exact: true,
    }),
  ).toHaveCount(0);
});

test("failed save preserves input and permits retry", async ({
  page,
}) => {
  await seed(page, [
    {
      type: "PERSON",
      authorUserId: "friend",
      subscriptionId: "friend",
    },
  ]);
  await page.goto("/?tag=javascript");
  await page
    .getByLabel("답안", { exact: true })
    .fill("let");
  await page.evaluate(() => {
    Object.assign(window, {
      restoreStorage: Storage.prototype.setItem,
    });
    Storage.prototype.setItem = () => {
      throw new Error("full");
    };
  });
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toContainText("저장소");
  await expect(
    page.getByLabel("답안", { exact: true }),
  ).toHaveValue("let");
  await page.evaluate(() => {
    Storage.prototype.setItem = (
      window as unknown as {
        restoreStorage: typeof Storage.prototype.setItem;
      }
    ).restoreStorage;
  });
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("오답입니다", { exact: true }),
  ).toBeVisible();
});

test("direct owner access keeps private quizzes out of home and renders code on mobile", async ({
  page,
}) => {
  const state = initialState("author");
  state.quizzes[0].status = QuizStatus.PRIVATE;
  state.quizzes[0].active!.question.prompt =
    "코드를 읽으세요.\n\n```ts\nconst value = 1;\n```";
  await page.addInitScript(
    (value) =>
      localStorage.setItem(
        "bugri:mock:v1:author",
        JSON.stringify(value),
      ),
    state,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solve?user=author&quiz=seed-quiz-1");
  await expect(page.locator("main pre")).toContainText(
    "const value = 1;",
  );
  await page.getByLabel("number", { exact: true }).focus();
  await page.keyboard.press("Space");
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/solve?user=learner&quiz=seed-quiz-1");
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toBeVisible();
});

test("retrying a failed direct restart stays on that quiz", async ({
  page,
}) => {
  await page.goto("/solve?user=learner&quiz=seed-quiz-1");
  await submit(page, ["number"]);
  const completed = page.url();
  await page.evaluate(() => {
    Object.assign(window, {
      restoreStorage: Storage.prototype.setItem,
    });
    Storage.prototype.setItem = () => {
      throw new Error("full");
    };
  });
  await page
    .getByRole("button", { name: "다시 풀기", exact: true })
    .click();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toContainText("저장소");
  await page.evaluate(() => {
    Storage.prototype.setItem = (
      window as unknown as {
        restoreStorage: typeof Storage.prototype.setItem;
      }
    ).restoreStorage;
  });
  await page
    .getByRole("button", { name: "다시 시도", exact: true })
    .click();
  await expect(page).not.toHaveURL(completed);
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "답 제출",
      exact: true,
    }),
  ).toBeDisabled();
});

test("existing empty learner snapshot receives demo subscriptions on reload", async ({
  page,
}) => {
  const state = initialState("learner");
  delete state.learningDemoVersion;
  state.subscriptions = [];
  await page.addInitScript((value) => {
    if (!localStorage.getItem("bugri:mock:v1:learner"))
      localStorage.setItem(
        "bugri:mock:v1:learner",
        JSON.stringify(value),
      );
  }, state);
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "타입 선언",
      exact: true,
    }),
  ).toBeVisible();
  await submit(page, ["number"]);
  await page.reload();
  await expect(
    page.getByText("정답입니다", { exact: true }),
  ).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("bugri:mock:v1:learner")!,
    ),
  );
  expect(saved.learningDemoVersion).toBe(1);
  expect(saved.subscriptions).toHaveLength(3);
  expect(saved.attempts).toHaveLength(1);
});

test("empty state opens discovery page with URL search and explicit subscription", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?user=friend");
  await page
    .getByRole("button", {
      name: "다른 태그 선택",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/discover\?user=friend/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "홈에서 학습하기",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "전체 태그로 학습하기",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "개발자·태그 탐색",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "개발자 검색 결과" })
      .getByText("학습자", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("tab", { name: "개발자", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "태그", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tab", { name: "태그", exact: true }),
  ).toBeFocused();
  const search = page.getByRole("searchbox", {
    name: "개발자 또는 태그 검색",
  });
  await search.fill("JAVA");
  await page
    .getByRole("button", { name: "검색", exact: true })
    .click();
  await expect(page).toHaveURL(/query=JAVA/);
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByText("Java", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByText("JavaScript", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(search).toHaveValue("JAVA");
  await expect(
    page.getByRole("tab", { name: "태그", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await search.fill("없는검색결과");
  await page
    .getByRole("button", { name: "검색", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByText(/검색 결과가 없습니다/),
  ).toBeVisible();
  await page.goBack();
  await expect(search).toHaveValue("JAVA");
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByText("Java", { exact: true }),
  ).toBeVisible();
  await search.fill("Web");
  await search.press("Enter");
  await expect(
    page
      .getByRole("region", { name: "태그 검색 결과" })
      .getByText("Web", { exact: true }),
  ).toBeVisible();
  const before = await page.evaluate(
    () =>
      JSON.parse(
        localStorage.getItem("bugri:mock:v1:friend")!,
      ).subscriptions,
  );
  expect(before).toEqual([]);
  await page.evaluate(() => {
    Object.assign(window, {
      restoreStorage: Storage.prototype.setItem,
    });
    Storage.prototype.setItem = () => {
      throw new Error("full");
    };
  });
  await page
    .getByRole("button", {
      name: "Web 구독하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("main").getByRole("alert"),
  ).toContainText("구독을 저장하지 못했습니다");
  await expect(search).toHaveValue("Web");
  await page.evaluate(() => {
    Storage.prototype.setItem = (
      window as unknown as {
        restoreStorage: typeof Storage.prototype.setItem;
      }
    ).restoreStorage;
  });
  await page
    .getByRole("button", {
      name: "Web 구독하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Web 구독 해제",
      exact: true,
    }),
  ).toBeEnabled();
  await expect(page).toHaveURL(/\/discover\?.*query=Web/);
  await expect(search).toHaveValue("Web");
  await search.fill("Java");
  await search.press("Enter");
  await expect(page).toHaveURL(/query=Java/);
  const searchUrl = page.url();
  await page
    .getByRole("button", {
      name: "Java 구독하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Java 구독 해제",
      exact: true,
    }),
  ).toBeEnabled();
  await page
    .getByRole("button", {
      name: "JavaScript 구독하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "JavaScript 구독 해제",
      exact: true,
    }),
  ).toBeEnabled();
  await expect(page).toHaveURL(searchUrl);
  await expect(search).toHaveValue("Java");
  const saved = await page.evaluate(() =>
    JSON.parse(
      localStorage.getItem("bugri:mock:v1:friend")!,
    ),
  );
  expect(saved.subscriptions).toHaveLength(3);
  expect(saved.attempts).toHaveLength(0);
  await search.fill("Web");
  await search.press("Enter");
  await page
    .getByRole("button", {
      name: "Web 학습하기",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "블록 스코프",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("학습 태그", { exact: true }),
  ).toHaveText("Web");
  await page.getByLabel("var", { exact: true }).check();
  await page
    .getByRole("button", { name: "답 제출", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: /버그리/ }),
  ).toHaveCount(0);
  await expect(
    page.getByText("해설을 읽고 다시 도전해보자.", {
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "완료 확인",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("learning tag dropdown supports mobile dismissal and keyboard selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const tag = page.getByRole("combobox", {
    name: "학습 태그",
    exact: true,
  });
  await expect(tag).toBeEnabled();
  await tag.click();
  await expect(
    page.getByRole("listbox", { name: "학습 태그" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tag).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await tag.click();
  await page
    .getByRole("heading", {
      name: "오늘의 퀴즈",
      exact: true,
    })
    .click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await tag.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(tag).toHaveText("JavaScript");
  await expect(page).toHaveURL(/tag=javascript/);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("changing the learning tag warns before discarding an answer", async ({
  page,
}) => {
  await seed(page);
  await page.goto("/");
  await page.getByLabel("number", { exact: true }).check();
  const tag = page.getByRole("combobox", {
    name: "학습 태그",
    exact: true,
  });

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "작성 중인 답안이 사라집니다",
    );
    await dialog.dismiss();
  });
  await tag.click();
  await page
    .getByRole("option", {
      name: "JavaScript",
      exact: true,
    })
    .click();
  await expect(
    page.getByLabel("number", { exact: true }),
  ).toBeChecked();
  await expect(tag).toHaveText("전체");

  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });
  await tag.click();
  await page
    .getByRole("option", {
      name: "JavaScript",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/tag=javascript/);
  await expect(tag).toHaveText("JavaScript");
});
