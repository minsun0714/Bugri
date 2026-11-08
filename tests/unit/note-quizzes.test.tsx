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
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/api/query-client";
import { createBrowserApi } from "@/api/browser";
import { NoteDetailScreen } from "@/components/notes/note-detail-screen";
import { NotesListScreen } from "@/components/notes/notes-list-screen";

jest.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams("user=learner"),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/components/navigation/demo-session", () => ({
  useDemoSession: () => ({ signIn: jest.fn() }),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

beforeEach(() => localStorage.clear());

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

async function seedNote() {
  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });

  return {
    api,
    note: await api.request("createNote", {
      content: "TypeScript와 HTTP를 배웠다.",
    }),
  };
}

const workModal = () =>
  screen.findByRole("dialog", {
    name: "버그리와 퀴즈 다듬기",
  });

test("generate opens the work modal, saves some, keeps the rest for later and confirms them", async () => {
  const { api, note } = await seedNote();

  wrap(<NoteDetailScreen noteId={note.noteId} />);

  fireEvent.click(
    await screen.findByRole("button", {
      name: "퀴즈로 만들기",
    }),
  );

  const modal = await screen.findByRole("dialog", {
    name: "버그리와 퀴즈 다듬기",
  });

  expect(
    await within(modal).findAllByRole("tab"),
  ).toHaveLength(4);

  fireEvent.click(
    within(modal).getByRole("button", { name: "저장" }),
  );

  expect(
    await within(modal).findByRole("tab", {
      name: "퀴즈 1 · 저장됨",
    }),
  ).toBeInTheDocument();

  fireEvent.click(
    within(modal).getByRole("button", { name: "닫기" }),
  );

  const resume = await screen.findByRole("button", {
    name: "확인 안 한 퀴즈 3개 · 이어서 확인",
  });

  expect(
    await screen.findByRole("link", { name: "타입 선언" }),
  ).toHaveAttribute(
    "href",
    expect.stringMatching(/^\/solve\?user=learner&quiz=/),
  );

  fireEvent.click(resume);

  const again = await screen.findByRole("dialog", {
    name: "버그리와 퀴즈 다듬기",
  });

  fireEvent.click(
    await within(again).findByRole("button", {
      name: "남은 퀴즈 모두 저장 (3)",
    }),
  );

  await waitFor(async () =>
    expect(
      await api.request("note", { noteId: note.noteId }),
    ).toMatchObject({ confirmedCount: 4, pendingCount: 0 }),
  );
});

test("generating again keeps earlier PENDING quizzes", async () => {
  const { api, note } = await seedNote();

  await api.request("generate", { noteId: note.noteId });

  wrap(<NoteDetailScreen noteId={note.noteId} />);

  fireEvent.click(
    await screen.findByRole("button", {
      name: "퀴즈로 만들기",
    }),
  );

  expect(
    await within(await workModal()).findAllByRole("tab"),
  ).toHaveLength(8);
});

test("saving is blocked while an edit is unapplied, and closing asks only then", async () => {
  const { note } = await seedNote();

  wrap(<NoteDetailScreen noteId={note.noteId} />);

  fireEvent.click(
    await screen.findByRole("button", {
      name: "퀴즈로 만들기",
    }),
  );

  const modal = await screen.findByRole("dialog", {
    name: "버그리와 퀴즈 다듬기",
  });

  await within(modal).findAllByRole("tab");

  fireEvent.click(
    within(modal).getByRole("button", {
      name: "직접 수정",
    }),
  );

  expect(
    within(modal).getByRole("button", {
      name: "수정 반영",
    }),
  ).toBeInTheDocument();

  // Opening the editor without changing anything is not an unapplied edit.
  fireEvent.change(within(modal).getByLabelText("제목"), {
    target: { value: "바꾼 제목" },
  });

  fireEvent.click(
    within(modal).getByRole("button", {
      name: "수정 취소",
    }),
  );

  fireEvent.click(
    within(modal).getByRole("button", {
      name: "직접 수정",
    }),
  );

  fireEvent.change(within(modal).getByLabelText("제목"), {
    target: { value: "다시 바꾼 제목" },
  });

  fireEvent.click(
    within(modal).getByRole("button", { name: "닫기" }),
  );

  expect(
    await screen.findByRole("dialog", {
      name: "저장하지 않은 변경을 버릴까요?",
    }),
  ).toBeInTheDocument();
});

test("deleting a memo warns with the linked quiz count, PENDING included", async () => {
  const { api, note } = await seedNote();

  await api.request("generate", { noteId: note.noteId });

  wrap(<NoteDetailScreen noteId={note.noteId} />);

  fireEvent.click(
    await screen.findByRole("button", { name: "삭제" }),
  );

  expect(
    await screen.findByText(
      "연결된 퀴즈 4개(확인 안 한 퀴즈 4개 포함)도 함께 삭제돼요. 이미 푼 기록은 풀이 내역에 남아요.",
    ),
  ).toBeInTheDocument();
});

test("the list shows confirmed counts, unconfirmed counts, no-quiz memos and tags", async () => {
  wrap(<NotesListScreen />);

  expect(
    await screen.findByText("퀴즈 8개"),
  ).toBeInTheDocument();
  expect(
    screen.getByText("확인 안 한 퀴즈 2개"),
  ).toBeInTheDocument();
  expect(
    screen.getAllByText("퀴즈 없음").length,
  ).toBeGreaterThan(0);
  expect(
    (await screen.findAllByText("#TypeScript")).length,
  ).toBeGreaterThan(0);
});
