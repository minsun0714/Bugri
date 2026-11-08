import { useState } from "react";
import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { TagInput } from "@/components/ui/tag-input";

function Example() {
  const [tags, setTags] = useState<string[]>([]);

  return <TagInput value={tags} onChange={setTags} />;
}

function add(value: string, composing = false) {
  const input = screen.getByRole("textbox", {
    name: "해시태그",
  });

  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, {
    key: "Enter",
    isComposing: composing,
  });
}

test("adds trimmed tags, rejects empty and duplicate values, removes individually", () => {
  render(<Example />);
  add("   ");
  expect(
    screen.queryByRole("button"),
  ).not.toBeInTheDocument();
  add(" ## React ");
  add("React");
  expect(
    screen.getAllByRole("button", { name: "React 삭제" }),
  ).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("button", { name: "React 삭제" }),
  );
  expect(
    screen.queryByRole("button", { name: "React 삭제" }),
  ).not.toBeInTheDocument();
});
test("caps at three and enables input again after removal", () => {
  render(<Example />);
  add("React");
  add("Java");
  add("CSS");
  expect(screen.getByRole("textbox")).toBeDisabled();
  expect(screen.getByText("3 / 3개")).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Java 삭제" }),
  );
  expect(screen.getByRole("textbox")).toBeEnabled();
});
test("does not commit while Korean IME composition is active", () => {
  render(<Example />);
  add("학습", true);
  expect(
    screen.queryByRole("button"),
  ).not.toBeInTheDocument();
});
