import type { ReactNode } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/api/query-client";
import { createBrowserApi } from "@/api/browser";
import { initialState, storageKey } from "@/mocks/storage";
import { NotesListScreen } from "@/components/notes/notes-list-screen";
import {
  noteHref,
  notesHref,
  parseNotesParams,
} from "@/components/notes/search-params";

const push = jest.fn();
let search = "user=learner";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => ({ push }),
}));

jest.mock("@/components/navigation/demo-session", () => ({
  useDemoSession: () => ({ signIn: jest.fn() }),
}));

beforeEach(() => {
  localStorage.clear();

  for (const userId of ["learner", "author", "friend"])
    localStorage.setItem(
      storageKey(userId),
      JSON.stringify({
        ...initialState(userId),
        notes: [],
        quizzes: [],
      }),
    );

  push.mockClear();
  search = "user=learner";
});

const wrap = (node: ReactNode) =>
  render(
    <QueryClientProvider
      client={createQueryClient({
        defaultOptions: { queries: { gcTime: 0 } },
      })}
    >
      {node}
    </QueryClientProvider>,
  );

const quiz = (title: string, hashtagIds: string[]) => ({
  title,
  question: {
    type: "TRUE_FALSE",
    prompt: `${title} 문제 문장`,
  },
  answer: { type: "TRUE_FALSE", value: true },
  explanation: "해설",
  hashtagIds,
});

async function seed() {
  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
    generate: ((): unknown => [
      quiz("클로저 퀴즈", ["javascript"]),
    ]) as never,
  } as never);

  const withQuiz = await api.request("createNote", {
    content: "자바스크립트 메모",
  });

  await api.request("generate", { noteId: withQuiz.noteId });

  await api.request("confirmNoteQuizzes", {
    noteId: withQuiz.noteId,
  });

  const plain = await api.request("createNote", {
    content: "퀴즈 없는 메모",
  });

  return { withQuiz, plain };
}

describe("address condition", () => {
  test("parses and rebuilds the condition, leaving defaults out", () => {
    const parsed = parseNotesParams(
      new URLSearchParams(
        "user=a&query=%20react%20&tag=web&tag=web&tag=java&untagged=1&page=3",
      ),
    );

    expect(parsed).toEqual({
      query: "react",
      queryTooLong: false,
      tagIds: ["web", "java"],
      untagged: true,
      page: 3,
    });

    expect(
      notesHref("a", {
        query: "react",
        tagIds: ["web", "java"],
        untagged: true,
        page: 3,
      }),
    ).toBe(
      "/notes?user=a&query=react&tag=web&tag=java&untagged=1&page=3",
    );

    expect(
      notesHref("a", {
        query: "",
        tagIds: [],
        untagged: false,
        page: 1,
      }),
    ).toBe("/notes?user=a");
  });

  test("falls back for hand-edited values", () => {
    expect(
      parseNotesParams(
        new URLSearchParams(
          `user=a&page=-2&untagged=yes&query=${"가".repeat(101)}`,
        ),
      ),
    ).toMatchObject({
      page: 1,
      untagged: false,
      queryTooLong: true,
    });
  });

  test("note links keep the condition", () => {
    expect(
      noteHref("a", "n 1", {
        query: "q",
        tagIds: [],
        untagged: true,
        page: 2,
      }),
    ).toBe("/notes/n%201?user=a&query=q&untagged=1&page=2");
  });
});

test("submitting the search moves to the first page with the query in the address", async () => {
  await seed();
  search = "user=learner&page=2";

  wrap(<NotesListScreen />);

  const box = await screen.findByRole("searchbox", {
    name: "내 노트 검색",
  });

  fireEvent.change(box, { target: { value: " 클로저 " } });

  fireEvent.click(
    screen.getByRole("button", { name: "검색" }),
  );

  expect(push).toHaveBeenCalledWith(
    "/notes?user=learner&query=%ED%81%B4%EB%A1%9C%EC%A0%80",
    { scroll: false },
  );
});

test("a quiz-only match shows the quiz title and a result count", async () => {
  await seed();
  search = "user=learner&query=클로저";

  wrap(<NotesListScreen />);

  const list = await screen.findByRole("list", {
    name: "내 노트",
  });

  expect(within(list).getAllByRole("link")).toHaveLength(1);
  expect(list).toHaveTextContent("퀴즈 · 클로저 퀴즈");

  expect(screen.getByRole("status")).toHaveTextContent(
    "검색 결과 1개",
  );

  const link = within(list).getByRole("link");

  expect(link.getAttribute("href")).toContain(
    "query=%ED%81%B4%EB%A1%9C%EC%A0%80",
  );
});

test("tag chips toggle tags and the untagged chip, each resetting the page", async () => {
  await seed();
  search = "user=learner&page=2";

  wrap(<NotesListScreen />);

  const group = await screen.findByRole("region", {
    name: "태그 필터",
  });

  fireEvent.click(
    await within(group).findByRole("button", {
      name: /JavaScript/,
    }),
  );

  expect(push).toHaveBeenLastCalledWith(
    "/notes?user=learner&tag=javascript",
    { scroll: false },
  );

  fireEvent.click(
    within(group).getByRole("button", { name: /태그 없음/ }),
  );

  expect(push).toHaveBeenLastCalledWith(
    "/notes?user=learner&untagged=1",
    { scroll: false },
  );
});

test("selected chips are pressed and results follow the filter", async () => {
  const { plain } = await seed();
  search = "user=learner&untagged=1";

  wrap(<NotesListScreen />);

  const list = await screen.findByRole("list", {
    name: "내 노트",
  });

  expect(within(list).getAllByRole("link")).toHaveLength(1);

  expect(
    within(list).getByRole("link").getAttribute("href"),
  ).toContain(plain.noteId);

  expect(
    screen.getByRole("button", { name: /태그 없음/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("no match shows the query with a reset; reset clears every condition", async () => {
  await seed();
  search = "user=learner&query=없는말&tag=web";

  wrap(<NotesListScreen />);

  expect(
    await screen.findByText(
      "선택한 태그 안에 “없는말”와 일치하는 메모가 없어요",
    ),
  ).toBeVisible();

  fireEvent.click(
    screen.getByRole("button", { name: "조건 초기화" }),
  );

  expect(push).toHaveBeenLastCalledWith("/notes?user=learner", {
    scroll: false,
  });
});

test("filters without a query say the filters matched nothing", async () => {
  await seed();
  search = "user=learner&tag=java";

  wrap(<NotesListScreen />);

  expect(
    await screen.findByText("조건에 맞는 메모가 없어요"),
  ).toBeVisible();
});

test("an over-long query in the address shows a notice instead of requesting", async () => {
  await seed();
  search = `user=learner&query=${"가".repeat(101)}`;

  wrap(<NotesListScreen />);

  expect(
    await screen.findByRole("button", { name: "조건 초기화" }),
  ).toBeVisible();

  // The limit is stated once, by the search field.
  expect(
    screen.getAllByText("검색어는 100자 이하여야 합니다."),
  ).toHaveLength(1);

  fireEvent.click(
    screen.getByRole("button", { name: "조건 초기화" }),
  );

  expect(push).toHaveBeenCalledWith("/notes?user=learner", {
    scroll: false,
  });
});

test("an unknown tag in the address is explained, not a generic failure", async () => {
  await seed();
  search = "user=learner&tag=nope";

  wrap(<NotesListScreen />);

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "주소의 검색 조건이 올바르지 않아요",
  );
});

test("a failed search offers a retry that succeeds", async () => {
  await seed();
  search = "user=learner&query=클로저";

  const setItem = jest
    .spyOn(Storage.prototype, "getItem")
    .mockImplementation(() => {
      throw new Error("blocked");
    });

  wrap(<NotesListScreen />);

  const retry = await screen.findByRole("button", {
    name: "다시 시도",
  });

  setItem.mockRestore();
  fireEvent.click(retry);

  await waitFor(() =>
    expect(
      screen.getByRole("list", { name: "내 노트" }),
    ).toBeVisible(),
  );
});

test("an empty account still points to the home quick note", async () => {
  wrap(<NotesListScreen />);

  expect(
    await screen.findByText("아직 메모가 없어요"),
  ).toBeVisible();

  expect(
    screen.getByRole("link", { name: "홈에서 첫 메모 쓰기" }),
  ).toBeVisible();

  expect(
    screen.queryByRole("region", { name: "태그 필터" }),
  ).not.toBeInTheDocument();
});
