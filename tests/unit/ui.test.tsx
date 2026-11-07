import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  Button,
  Select,
  TextField,
  Tag,
  Switch,
} from "@/components/ui";

test("loading and disabled buttons cannot trigger actions", () => {
  const action = jest.fn();

  render(
    <Button loading onClick={action}>
      저장
    </Button>,
  );
  fireEvent.click(screen.getByRole("button"));
  expect(action).not.toHaveBeenCalled();
  expect(screen.getByRole("button")).toHaveAttribute(
    "aria-busy",
    "true",
  );
});
test("field connects its error to an accessible input", () => {
  render(
    <TextField label="제목" error="제목을 입력하세요" />,
  );
  expect(screen.getByLabelText("제목")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(
    screen.getByLabelText("제목"),
  ).toHaveAccessibleDescription("제목을 입력하세요");
});
test("tag and switch expose selection and call controlled callbacks", () => {
  const select = jest.fn();
  const toggle = jest.fn();

  render(
    <>
      <Tag selected onClick={select}>
        React
      </Tag>
      <Switch
        label="공개"
        checked={false}
        onChange={toggle}
      />
    </>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "React" }),
  );
  expect(select).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("button", { name: "React" }),
  ).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(
    screen.getByRole("switch", { name: "공개" }),
  );
  expect(toggle).toHaveBeenCalledWith(true);
});

test("select supports controlled values in an inline layout", () => {
  const change = jest.fn();

  render(
    <Select
      layout="inline"
      label="사용자"
      options={[
        { value: "learner", label: "학습자" },
        { value: "author", label: "작성자" },
      ]}
      value="learner"
      onChange={change}
    />,
  );
  const select = screen.getByLabelText("사용자");

  expect(select).toHaveValue("learner");
  expect(select.parentElement).toHaveClass(
    "ui-select-inline",
  );
  fireEvent.change(select, {
    target: { value: "author" },
  });
  expect(change).toHaveBeenCalledTimes(1);
});
