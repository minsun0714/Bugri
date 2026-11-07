import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProfileAboutForm } from "@/components/profile/profile-about-form";

jest.mock("@/components/ui/markdown-editor", () => ({
  MarkdownEditor: ({
    value,
    onChange,
    label,
  }: {
    value: string;
    onChange: (value: string) => void;
    label: string;
  }) => (
    <textarea
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

test("starts without link fields, validates added rows, preserves failed input and permits removal", async () => {
  const save = jest
    .fn()
    .mockRejectedValueOnce(new Error("저장 실패"))
    .mockResolvedValue(undefined);
  render(
    <ProfileAboutForm
      initial={{ biography: "", links: [] }}
      onSave={save}
      onCancel={jest.fn()}
    />,
  );
  expect(
    screen.queryByLabelText("URL 1"),
  ).not.toBeInTheDocument();
  fireEvent.change(
    screen.getByLabelText("자기소개 (선택)"),
    { target: { value: "소개" } },
  );
  fireEvent.click(
    screen.getByRole("button", { name: "링크 추가" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "저장" }),
  );
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText(/http:\/\//)).toBeVisible();
  fireEvent.change(screen.getByLabelText("URL 1"), {
    target: { value: "https://example.com" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "저장" }),
  );
  await screen.findByText("저장 실패");
  expect(
    screen.getByLabelText("자기소개 (선택)"),
  ).toHaveValue("소개");
  expect(screen.getByLabelText("URL 1")).toHaveValue(
    "https://example.com",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "링크 1 삭제" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "저장" }),
  );
  await waitFor(() =>
    expect(save).toHaveBeenLastCalledWith({
      biography: "소개",
      links: [],
    }),
  );
});

test("editing one invalid link preserves other errors and deleting remaps them", async () => {
  render(
    <ProfileAboutForm
      initial={{
        biography: "",
        links: [
          { kind: "OTHER", url: "bad", label: "" },
          { kind: "BLOG", url: "bad" },
        ],
      }}
      onSave={jest.fn()}
      onCancel={jest.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "저장",
    }),
  );
  expect(screen.getByLabelText("URL 2")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  const first = screen.getByLabelText("URL 1");
  first.focus();
  fireEvent.change(first, {
    target: { value: "https://example.com" },
  });
  expect(first).toHaveFocus();
  expect(
    screen.getByLabelText("표시 이름 1"),
  ).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText("URL 2")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "링크 1 삭제" }),
  );
  expect(screen.getByLabelText("URL 1")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("new links focus their kind and cancelling preserves an editing focus target", async () => {
  render(
    <ProfileAboutForm
      initial={{ biography: "", links: [] }}
      onSave={jest.fn()}
      onCancel={jest.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "링크 추가" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("combobox", { name: "링크 종류 1" }),
    ).toHaveFocus(),
  );
  const url = screen.getByLabelText("URL 1");
  url.focus();
  fireEvent.change(url, {
    target: { value: "https://example.com" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: "취소",
    }),
  );
  expect(
    screen.getByRole("button", { name: "계속 편집" }),
  ).toHaveFocus();
  fireEvent.click(
    screen.getByRole("button", { name: "계속 편집" }),
  );
  expect(url).toHaveFocus();
});
