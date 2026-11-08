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
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { TagInput } from "@/components/ui/tag-input";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { setLocale } from "@/lib/i18n/store";
import { message, translate } from "@/lib/i18n/messages";

beforeEach(() => {
  act(() => setLocale("ko"));
});
afterEach(() => {
  act(() => setLocale("ko"));
});

test("an existing validation error follows language changes without translating user tags", () => {
  render(
    <TagInput
      value={["공개", "中文"]}
      onChange={jest.fn()}
    />,
  );
  fireEvent.keyDown(screen.getByRole("textbox"), {
    key: "Enter",
  });
  expect(
    screen.getByText("태그를 입력해주세요."),
  ).toBeVisible();
  act(() => setLocale("en"));
  expect(screen.getByText("Enter a tag.")).toBeVisible();
  expect(screen.getByText("# 공개")).toBeVisible();
  expect(screen.getByText("# 中文")).toBeVisible();
  act(() => setLocale("ko"));
  expect(
    screen.getByText("태그를 입력해주세요."),
  ).toBeVisible();
});

test("changing language preserves the selected editor tab and original draft", () => {
  render(
    <MarkdownEditor
      value={"中文 **공개**"}
      onChange={jest.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("tab", { name: "미리보기" }),
  );
  act(() => setLocale("en"));
  expect(
    screen.getByRole("tab", { name: "Preview" }),
  ).toHaveAttribute("aria-selected", "true");
  expect(screen.getByText("中文 **공개**")).toBeVisible();
  fireEvent.click(
    screen.getByRole("tab", { name: "Write" }),
  );
  expect(screen.getByRole("textbox")).toHaveValue(
    "中文 **공개**",
  );
});

test("stored messages are translated at display time and interpolation values remain untouched", () => {
  const notice = message("{0}일 연속 학습", {
    0: "中文 3",
  });
  expect(translate("en", notice)).toBe("中文 3-day streak");
  expect(translate("ko", notice)).toBe(
    "中文 3일 연속 학습",
  );
});
