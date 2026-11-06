import { act, renderHook } from "@testing-library/react";

import { useMarkdownEditor } from "@/components/ui/hooks/use-markdown-editor";

test("rejects code insertion exceeding the limit without replacing the draft", () => {
  const onChange = jest.fn();
  const { result } = renderHook(() =>
    useMarkdownEditor({
      value: "기존 내용",
      onChange,
      limit: 5,
    }),
  );

  act(() => result.current.togglePicker());
  act(() => result.current.insertCode());

  expect(onChange).not.toHaveBeenCalled();
  expect(result.current.picker).toBe(true);
  expect(result.current.error).toContain("글자 수 제한");
});

test("counts and limits input by Unicode code point instead of UTF-16 units", () => {
  const onChange = jest.fn();
  const { result } = renderHook(() =>
    useMarkdownEditor({
      value: "😀가",
      onChange,
      limit: 2,
    }),
  );

  expect(result.current.count).toBe(2);
  act(() => result.current.changeValue("😀가나"));
  expect(onChange).toHaveBeenCalledWith("😀가");
});
