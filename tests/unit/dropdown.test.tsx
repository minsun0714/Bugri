import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Dropdown } from "@/components/ui/dropdown";

const options = [
  { value: "PRIVATE", label: "나만 풀기" },
  { value: "PUBLIC", label: "공개" },
];

test("opens a custom option panel and selects the wire value", () => {
  const onValueChange = jest.fn();
  render(
    <Dropdown
      label="공개 범위"
      options={options}
      value="PRIVATE"
      onValueChange={onValueChange}
    />,
  );
  const trigger = screen.getByRole("combobox", {
    name: "공개 범위",
  });
  expect(trigger.tagName).toBe("BUTTON");
  expect(trigger).toHaveTextContent("나만 풀기");
  fireEvent.click(trigger);
  expect(screen.getByRole("listbox")).toBeVisible();
  expect(
    screen.getByRole("option", { name: "나만 풀기" }),
  ).toHaveAttribute("aria-selected", "true");
  fireEvent.click(
    screen.getByRole("option", { name: "공개" }),
  );
  expect(onValueChange).toHaveBeenCalledWith("PUBLIC");
  expect(
    screen.queryByRole("listbox"),
  ).not.toBeInTheDocument();
});

test("supports arrows, End, Enter, Escape and outside dismissal", () => {
  const onValueChange = jest.fn();
  render(
    <Dropdown
      label="공개 범위"
      options={options}
      value="PRIVATE"
      onValueChange={onValueChange}
    />,
  );
  const trigger = screen.getByRole("combobox");
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  fireEvent.keyDown(trigger, { key: "End" });
  fireEvent.keyDown(trigger, { key: "Enter" });
  expect(onValueChange).toHaveBeenCalledWith("PUBLIC");
  expect(trigger).toHaveFocus();
  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: "Escape" });
  expect(
    screen.queryByRole("listbox"),
  ).not.toBeInTheDocument();
  fireEvent.click(trigger);
  fireEvent.pointerDown(document.body);
  expect(
    screen.queryByRole("listbox"),
  ).not.toBeInTheDocument();
});

test("disabled dropdown cannot open", () => {
  render(
    <Dropdown
      label="공개 범위"
      options={options}
      value="PRIVATE"
      onValueChange={jest.fn()}
      disabled
    />,
  );
  fireEvent.click(screen.getByRole("combobox"));
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(
    screen.queryByRole("listbox"),
  ).not.toBeInTheDocument();
});
