import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { AnswerForm } from "@/components/solving/answer-form";

it("blocks empty answers and submits selected false explicitly", () => {
  const submit = jest.fn();
  render(
    <AnswerForm
      question={{ type: "TRUE_FALSE", prompt: "HTTP?" }}
      onSubmit={submit}
      pending={false}
    />,
  );
  expect(
    screen.getByRole("button", { name: "답 제출" }),
  ).toBeDisabled();
  fireEvent.click(screen.getByLabelText("거짓"));
  fireEvent.click(
    screen.getByRole("button", { name: "답 제출" }),
  );
  expect(submit).toHaveBeenCalledWith({
    type: "TRUE_FALSE",
    value: false,
  });
});

it("preserves short input during failed submission and rejects whitespace", () => {
  const submit = jest.fn();
  render(
    <AnswerForm
      question={{ type: "SHORT_ANSWER", prompt: "키워드?" }}
      onSubmit={submit}
      pending={false}
    />,
  );
  fireEvent.change(screen.getByLabelText("답안"), {
    target: { value: "   " },
  });
  expect(
    screen.getByRole("button", { name: "답 제출" }),
  ).toBeDisabled();
  fireEvent.change(screen.getByLabelText("답안"), {
    target: { value: "const" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "답 제출" }),
  );
  expect(screen.getByLabelText("답안")).toHaveValue(
    "const",
  );
});

it("submits multiple selections and allows deselection", () => {
  const submit = jest.fn();
  render(
    <AnswerForm
      question={{
        type: "MULTIPLE_CHOICE",
        prompt: "선택",
        choices: [
          { id: "a", text: "let" },
          { id: "b", text: "const" },
        ],
      }}
      onSubmit={submit}
      pending={false}
    />,
  );
  fireEvent.click(screen.getByLabelText("let"));
  fireEvent.click(screen.getByLabelText("const"));
  fireEvent.click(screen.getByLabelText("let"));
  fireEvent.click(
    screen.getByRole("button", { name: "답 제출" }),
  );
  expect(submit).toHaveBeenCalledWith({
    type: "MULTIPLE_CHOICE",
    choiceIds: ["b"],
  });
});
