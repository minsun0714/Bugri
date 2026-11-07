import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import NotFound from "@/app/not-found";
import RouteError from "@/app/error";
import GlobalError from "@/app/global-error";

test("missing pages offer a home link without a futile retry", () => {
  render(<NotFound />);
  expect(
    screen.getByRole("heading", { level: 1 }),
  ).toHaveTextContent("페이지를 찾을 수 없습니다");
  expect(
    screen.getByRole("link", { name: "홈으로 이동" }),
  ).toHaveAttribute("href", "/");
  expect(
    screen.queryByRole("button"),
  ).not.toBeInTheDocument();
});

test("route exceptions hide internal details and invoke Next retry", () => {
  const retry = jest.fn();
  render(
    <RouteError
      error={new Error("secret source answer")}
      retry={retry}
    />,
  );
  expect(
    screen.queryByText(/secret/),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "다시 시도" }),
  );
  expect(retry).toHaveBeenCalledTimes(1);
});

test("global fallback supplies a Korean document without session providers", () => {
  const html = renderToStaticMarkup(
    <GlobalError error="private detail" retry={() => {}} />,
  );
  expect(html).toContain('<html lang="ko">');
  expect(html).toContain("<body>");
  expect(html).toContain("화면을 불러오지 못했습니다");
  expect(html).not.toContain("private detail");
});

test("home recovery preserves only the selected demo user", () => {
  window.history.replaceState(
    {},
    "",
    "/missing?user=author&attempt=old&tag=old",
  );
  const { unmount } = render(<NotFound />);
  expect(
    screen.getByRole("link", { name: "홈으로 이동" }),
  ).toHaveAttribute("href", "/?user=author");
  unmount();
  window.history.replaceState({}, "", "/");
});
