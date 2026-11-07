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
