import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Creation } from "@/features/quiz-authoring/creation";
import { AuthoringQueryProvider } from "@/features/quiz-authoring/query-provider";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => (
    <div>{children}</div>
  ),
}));
jest.mock("rehype-highlight", () => ({
  __esModule: true,
  default: () => {},
}));
beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
function setup(fail = false) {
  const api = createApiClient(
    createMockTransport({
      userId: "learner",
      ...(fail ? { generate: () => [] } : {}),
    }),
  );
  render(
    <AuthoringQueryProvider>
      <Creation
        api={api}
        userId="learner"
        onGenerated={jest.fn()}
        onDirty={jest.fn()}
      />
    </AuthoringQueryProvider>,
  );
}
test("outside input generates an editable candidate in the same modal", async () => {
  setup();
  expect(
    screen.queryByRole("dialog"),
  ).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "클로저" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 만들기" }),
  );
  await screen.findByRole("button", { name: "더 보기" });
  fireEvent.click(
    screen.getByRole("button", { name: "더 보기" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "직접 수정" }),
  );
  fireEvent.change(
    screen.getByRole("textbox", { name: "제목" }),
    { target: { value: "수정한 문제" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "수정 반영" }),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "수정 반영" }),
    ).not.toBeInTheDocument(),
  );
  expect(screen.getByRole("article")).toHaveTextContent(
    "수정한 문제",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "닫기" }),
  );
  expect(
    screen.queryByRole("button", { name: "작업 이어가기" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("textbox")).toHaveValue("클로저");
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 만들기" }),
  );
  await screen.findByRole("button", { name: "더 보기" });
  expect(screen.getByRole("article")).not.toHaveTextContent(
    "수정한 문제",
  );
});
test("failed generation keeps outside input and offers retry inside the modal", async () => {
  setup(true);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "실패해도 남길 내용" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 만들기" }),
  );
  await screen.findByRole("button", { name: "다시 생성" });
  fireEvent.click(
    screen.getByRole("button", { name: "닫기" }),
  );
  expect(screen.getByRole("textbox")).toHaveValue(
    "실패해도 남길 내용",
  );
});
