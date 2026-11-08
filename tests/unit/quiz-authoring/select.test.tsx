import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Select } from "@/components/ui";

test("shared select preserves wire values, controlled changes and disabled state", () => {
  const onChange = jest.fn();
  const options = [
    { value: "FIRST", label: "나만 보기" },
    { value: "SECOND", label: "공개" },
  ];
  const { rerender } = render(
    <Select
      label="공개 범위"
      options={options}
      value="FIRST"
      onChange={onChange}
    />,
  );
  const select = screen.getByRole("combobox", {
    name: "공개 범위",
  });
  expect(select).toHaveValue("FIRST");
  fireEvent.change(select, { target: { value: "SECOND" } });
  expect(onChange).toHaveBeenCalledTimes(1);
  rerender(
    <Select
      label="공개 범위"
      options={options}
      value="SECOND"
      disabled
    />,
  );
  expect(select).toHaveValue("SECOND");
  expect(select).toBeDisabled();
});
