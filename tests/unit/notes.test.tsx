import type { ReactNode } from "react";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock("rehype-highlight", () => ({
  __esModule: true,
  default: () => {},
}));

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import Link from "next/link";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/api/query-client";
import { createBrowserApi } from "@/api/browser";
import { QuickNote } from "@/components/notes/quick-note";
import { NoteDetailScreen } from "@/components/notes/note-detail-screen";
import { NotesListScreen } from "@/components/notes/notes-list-screen";

const push = jest.fn();
let search = "user=learner";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(search),
  useRouter: () => ({ push }),
}));

jest.mock("@/components/navigation/demo-session", () => ({
  useDemoSession: () => ({ signIn: signInSpy }),
}));

const signInSpy = jest.fn();

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  signInSpy.mockClear();
  search = "user=learner";
  jest.restoreAllMocks();
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

const seed = async (content: string, userId = "learner") =>
  (
    await createBrowserApi({ mode: "mock", userId })
  ).request("createNote", { content });

const editor = () =>
  screen.getByRole("textbox", { name: /메모/ });

test("quick note saves in place, clears the input and offers a link to the note", async () => {
  wrap(<QuickNote userId="learner" />);

  fireEvent.change(editor(), {
    target: {
      value: "클로저 정리\n```ts\n  const a = 1;\n```",
    },
  });

  expect(
    screen.getByText(/ \/ 10,000자$/),
  ).toHaveTextContent("31 / 10,000자");

  fireEvent.click(
    screen.getByRole("button", { name: "메모 저장" }),
  );

  const status = await screen.findByRole("status");

  expect(status).toHaveTextContent("저장했어요");

  const link = within(status).getByRole("link", {
    name: "메모 보기",
  });

  expect(link.getAttribute("href")).toMatch(
    /^\/notes\/note-[^/]+\?user=learner$/,
  );

  expect(editor()).toHaveValue("");

  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });

  const { items } = await api.request("notes", {});

  expect(items).toHaveLength(1);

  expect(
    (await api.request("note", { noteId: items[0].noteId }))
      .content,
  ).toBe("클로저 정리\n```ts\n  const a = 1;\n```");
});

test("blank and over-limit drafts stay in the input with a nearby error", async () => {
  wrap(<QuickNote userId="learner" />);

  fireEvent.change(editor(), { target: { value: " \n " } });

  fireEvent.click(
    screen.getByRole("button", { name: "메모 저장" }),
  );

  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("메모 내용을 입력해 주세요.");

  expect(editor()).toHaveValue(" \n ");

  const long = "가".repeat(10_001);

  fireEvent.change(editor(), { target: { value: long } });

  expect(
    screen.getByText(/ \/ 10,000자$/),
  ).toHaveTextContent("10,001 / 10,000자");

  fireEvent.click(
    screen.getByRole("button", { name: "메모 저장" }),
  );

  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("1자 초과했어요");

  expect(editor()).toHaveValue(long);

  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });

  expect((await api.request("notes", {})).total).toBe(0);
});

test("a storage failure keeps the draft and a retry can succeed", async () => {
  wrap(<QuickNote userId="learner" />);

  fireEvent.change(editor(), {
    target: { value: "다시 시도할 메모" },
  });

  const setItem = jest
    .spyOn(Storage.prototype, "setItem")
    .mockImplementation(() => {
      throw new Error("quota");
    });

  fireEvent.click(
    screen.getByRole("button", { name: "메모 저장" }),
  );

  expect(await screen.findByRole("alert")).toBeVisible();
  expect(editor()).toHaveValue("다시 시도할 메모");
  expect(
    screen.queryByRole("status"),
  ).not.toBeInTheDocument();

  setItem.mockRestore();

  fireEvent.click(
    screen.getByRole("button", { name: "메모 저장" }),
  );

  await screen.findByRole("status");

  expect(editor()).toHaveValue("");
  expect(
    screen.queryByRole("alert"),
  ).not.toBeInTheDocument();
});

test("notes list shows own notes newest first and guides visitors to pick a demo user", async () => {
  await seed("첫 번째 메모");
  await seed("```js\nconst a = 1;\n```\n두 번째 메모");
  await seed("author만 보이는 메모", "author");

  wrap(<NotesListScreen />);

  const list = await screen.findByRole("list", {
    name: "내 노트",
  });

  const rows = within(list).getAllByRole("link");

  expect(rows).toHaveLength(2);
  expect(rows[0]).toHaveTextContent("두 번째 메모");
  expect(rows[1]).toHaveTextContent("첫 번째 메모");
  expect(list).not.toHaveTextContent("author");
  expect(list).not.toHaveTextContent("```");
});

test("visitors entering notes are asked to choose a demo user", () => {
  search = "";

  wrap(<NotesListScreen />);

  expect(
    screen.getByText("데모 사용자를 선택해 주세요"),
  ).toBeVisible();

  fireEvent.click(
    screen.getByRole("button", {
      name: "데모 사용자 선택",
    }),
  );

  expect(signInSpy).toHaveBeenCalledTimes(1);
});

test("an empty notes list points to the home quick note", async () => {
  wrap(<NotesListScreen />);

  expect(
    await screen.findByText("아직 메모가 없어요"),
  ).toBeVisible();

  expect(
    screen.getByRole("link", {
      name: "홈에서 첫 메모 쓰기",
    }),
  ).toHaveAttribute("href", "/?user=learner");
});

test("detail renders code and html text, edits only after pressing edit, and saves", async () => {
  const { noteId } = await seed(
    "본문\n```ts\nconst a = 1;\n```\n<script>alert(1)</script>",
  );

  wrap(<NoteDetailScreen noteId={noteId} />);

  const article = await screen.findByRole("article", {
    name: "메모 본문",
  });

  expect(article).toHaveTextContent("const a = 1;");
  expect(
    screen.queryByRole("textbox"),
  ).not.toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "수정" }),
  );

  fireEvent.change(editor(), {
    target: { value: "수정된 본문" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: "저장" }),
  );

  expect(
    await screen.findByRole("status"),
  ).toHaveTextContent("저장했어요");

  expect(
    screen.getByRole("article", { name: "메모 본문" }),
  ).toHaveTextContent("수정된 본문");

  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });

  expect(
    (await api.request("note", { noteId })).version,
  ).toBe(2);
});

test("cancelling a dirty edit asks in a modal and keeps editing on request", async () => {
  const { noteId } = await seed("원본");

  wrap(<NoteDetailScreen noteId={noteId} />);

  await screen.findByRole("article", { name: "메모 본문" });

  fireEvent.click(
    screen.getByRole("button", { name: "수정" }),
  );

  fireEvent.change(editor(), { target: { value: "바뀜" } });

  fireEvent.click(
    screen.getByRole("button", { name: "취소" }),
  );

  const dialog = await screen.findByRole("dialog", {
    name: "저장하지 않은 변경을 버릴까요?",
  });

  fireEvent.click(
    within(dialog).getByRole("button", {
      name: "계속 수정",
    }),
  );

  expect(editor()).toHaveValue("바뀜");

  fireEvent.click(
    screen.getByRole("button", { name: "취소" }),
  );

  fireEvent.click(
    within(
      await screen.findByRole("dialog", {
        name: "저장하지 않은 변경을 버릴까요?",
      }),
    ).getByRole("button", { name: "변경 버리기" }),
  );

  expect(
    await screen.findByRole("article", {
      name: "메모 본문",
    }),
  ).toHaveTextContent("원본");
});

test("delete confirms in a modal, removes the note and returns to the list", async () => {
  const confirm = jest.spyOn(window, "confirm");

  const { noteId } = await seed("지울 메모");

  wrap(<NoteDetailScreen noteId={noteId} />);

  await screen.findByRole("article", { name: "메모 본문" });

  fireEvent.click(
    screen.getByRole("button", { name: "삭제" }),
  );

  const dialog = await screen.findByRole("dialog", {
    name: "이 메모를 삭제할까요?",
  });

  fireEvent.click(
    within(dialog).getByRole("button", { name: "삭제" }),
  );

  await waitFor(() =>
    expect(push).toHaveBeenCalledWith(
      "/notes?user=learner",
    ),
  );

  expect(confirm).not.toHaveBeenCalled();

  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });

  expect((await api.request("notes", {})).total).toBe(0);
});

test("missing, deleted and other users' notes show an unavailable notice with a way back", async () => {
  const { noteId } = await seed("learner 메모");

  search = "user=author";

  wrap(<NoteDetailScreen noteId={noteId} />);

  expect(
    await screen.findByText("접근할 수 없는 메모예요"),
  ).toBeVisible();

  expect(
    screen.getByRole("link", {
      name: "내 노트로 돌아가기",
    }),
  ).toHaveAttribute("href", "/notes?user=author");

  expect(
    screen.queryByText("learner 메모"),
  ).not.toBeInTheDocument();
});

test("previewText falls back to code for code-only notes", () => {
  const { previewText } = jest.requireActual(
    "@/components/notes/rules",
  );

  expect(previewText("```ts\nconst a = 1;\n```")).toBe(
    "const a = 1;",
  );
});

test("previewText drops fences and leading Markdown markers", () => {
  const { previewText } = jest.requireActual(
    "@/components/notes/rules",
  );

  expect(
    previewText(
      "## 제목\n- 항목\n> 인용\n```ts\nconst a = 1;\n```",
    ),
  ).toBe("제목 · 항목 · 인용");
});

test("a link click during a dirty edit opens the discard modal instead of leaving", async () => {
  const { noteId } = await seed("원본");

  render(
    <>
      <Link href="/notes?user=learner">나가기</Link>
      <QueryClientProvider client={createQueryClient()}>
        <NoteDetailScreen noteId={noteId} />
      </QueryClientProvider>
    </>,
  );

  await screen.findByRole("article", { name: "메모 본문" });

  fireEvent.click(
    screen.getByRole("button", { name: "수정" }),
  );

  await waitFor(() => expect(editor()).toHaveFocus());

  fireEvent.change(editor(), { target: { value: "바뀜" } });

  fireEvent.click(
    screen.getByRole("link", { name: "나가기" }),
  );

  const dialog = await screen.findByRole("dialog", {
    name: "저장하지 않은 변경을 버릴까요?",
  });

  fireEvent.click(
    within(dialog).getByRole("button", {
      name: "변경 버리기",
    }),
  );

  expect(push).toHaveBeenCalledWith("/notes?user=learner");
});
