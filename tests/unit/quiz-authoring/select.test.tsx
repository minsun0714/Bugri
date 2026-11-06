import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Select } from "@/components/ui";

test("shared select preserves wire values, controlled changes and disabled state", () => {
  const onChange = jest.fn();
  const options = [
    { value: "PRIVATE", label: "나만 보기" },
    { value: "PUBLIC", label: "공개" },
  ];
  const { rerender } = render(
    <Select
      label="공개 범위"
      options={options}
      value="PRIVATE"
      onChange={onChange}
    />,
  );
  const select = screen.getByRole("combobox", {
    name: "공개 범위",
  });
  expect(select).toHaveValue("PRIVATE");
  fireEvent.change(select, { target: { value: "PUBLIC" } });
  expect(onChange).toHaveBeenCalledTimes(1);
  rerender(
    <Select
      label="공개 범위"
      options={options}
      value="PUBLIC"
      disabled
    />,
  );
  expect(select).toHaveValue("PUBLIC");
  expect(select).toBeDisabled();
});
