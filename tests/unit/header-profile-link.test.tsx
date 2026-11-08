import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { HeaderNavigation } from "@/components/navigation/product-header";

test("profile menu links directly to the current user's public profile", async () => {
  render(
    <HeaderNavigation
      pathname="/coin-history"
      userId="author"
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "내 프로필" }),
  );
  const link = await screen.findByRole("link", {
    name: "공개 프로필 보기",
  });
  expect(link).toHaveAttribute(
    "href",
    "/users/bugri-author?user=author",
  );
  fireEvent.click(link);
  expect(
    screen.queryByRole("navigation", {
      name: "내 프로필 메뉴",
    }),
  ).not.toBeInTheDocument();
});

test("profile menu links to coin history with the current user", () => {
  render(
    <HeaderNavigation pathname="/shop" userId="author" />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "내 프로필" }),
  );
  expect(
    screen.getByRole("link", {
      name: "코인 내역",
    }),
  ).toHaveAttribute("href", "/coin-history?user=author");
  expect(
    screen.queryByRole("link", { name: "마이페이지" }),
  ).not.toBeInTheDocument();
});
