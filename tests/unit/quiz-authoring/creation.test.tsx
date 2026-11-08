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
  await screen.findByRole("button", { name: "직접 수정" });
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
  const confirm = jest
    .spyOn(window, "confirm")
    .mockReturnValue(true);

  fireEvent.click(
    screen.getByRole("button", { name: "닫기" }),
  );
  expect(confirm).toHaveBeenCalledWith(
    "모달을 닫으면 임시저장하거나 공개하지 않은 퀴즈는 사라집니다. 계속할까요?",
  );
  confirm.mockRestore();

  expect(
    screen.queryByRole("button", { name: "작업 이어가기" }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("textbox")).toHaveValue("클로저");
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 만들기" }),
  );
  await screen.findByRole("button", { name: "직접 수정" });
  expect(screen.getByRole("article")).not.toHaveTextContent(
    "수정한 문제",
  );
});
test("warns before closing with unhandled candidates and keeps the modal when cancelled", async () => {
  setup();
  const confirm = jest
    .spyOn(window, "confirm")
    .mockReturnValue(false);

  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "닫기 경고" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 만들기" }),
  );
  await screen.findByRole("button", { name: "직접 수정" });

  fireEvent.click(
    screen.getByRole("button", { name: "닫기" }),
  );

  expect(confirm).toHaveBeenCalledWith(
    "모달을 닫으면 임시저장하거나 공개하지 않은 퀴즈는 사라집니다. 계속할까요?",
  );
  expect(screen.getByRole("dialog")).toBeVisible();

  confirm.mockRestore();
});
test("closes without a warning after every candidate is handled", async () => {
  setup();
  const confirm = jest.spyOn(window, "confirm");

  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "모두 저장" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "퀴즈 만들기" }),
  );
  await screen.findByRole("button", { name: "임시저장" });

  for (let index = 1; index <= 4; index += 1) {
    if (index > 1)
      fireEvent.click(
        screen.getByRole("tab", {
          name: `퀴즈 ${index}`,
        }),
      );

    fireEvent.click(
      screen.getByRole("button", { name: "임시저장" }),
    );
    await screen.findByRole("tab", {
      name: `퀴즈 ${index} · 임시저장됨`,
    });
  }

  fireEvent.click(
    screen.getByRole("button", { name: "닫기" }),
  );

  expect(confirm).not.toHaveBeenCalled();
  expect(
    screen.queryByRole("dialog"),
  ).not.toBeInTheDocument();
  confirm.mockRestore();
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

test("writing and preview tabs keep source, code and count before generation", () => {
  setup();
  const source =
    "HTTP 응답\n```typescript\n  const status = 200;\n```😀";
  const input = screen.getByRole("textbox");

  expect(input).toHaveValue("");
  expect(input).toHaveAttribute(
    "placeholder",
    expect.stringContaining("HTTP"),
  );
  expect(
    screen.getByRole("tab", { name: "작성" }),
  ).toHaveAttribute("aria-selected", "true");
  fireEvent.change(input, { target: { value: source } });
  fireEvent.keyDown(
    screen.getByRole("tab", { name: "작성" }),
    { key: "End" },
  );
  expect(
    screen.getByRole("tab", { name: "미리보기" }),
  ).toHaveFocus();
  expect(screen.getByRole("tabpanel")).toHaveTextContent(
    "const status = 200;",
  );
  expect(
    screen.getByText(`${[...source].length} / 10,000자`),
  ).toBeVisible();
  fireEvent.keyDown(
    screen.getByRole("tab", { name: "미리보기" }),
    { key: "Home" },
  );
  expect(screen.getByRole("textbox")).toHaveValue(source);
});
