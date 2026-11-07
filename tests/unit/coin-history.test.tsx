import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { createBrowserApi } from "@/api/browser";
import { CoinHistory } from "@/components/coins/coin-history";

beforeEach(() => localStorage.clear());

it("shows the balance and newest purchase first, then isolates the next user", async () => {
  const api = await createBrowserApi({
    mode: "mock",
    userId: "learner",
  });
  const [product] = await api.request("products", {});
  await api.request("purchase", {
    productId: product.productId,
    requestKey: "coin-history",
  });
  const view = render(<CoinHistory userId="learner" />);
  expect(
    await screen.findByLabelText("내 잔액"),
  ).toHaveTextContent(String(100 - product.price));
  const rows = within(
    screen.getByRole("list", { name: "지급·사용 내역" }),
  ).getAllByRole("listitem");
  expect(rows[0]).toHaveTextContent("상품 구매");
  expect(rows[0]).toHaveTextContent(`-${product.price}`);
  expect(rows[1]).toHaveTextContent("데모 지급");
  view.rerender(<CoinHistory userId="friend" />);
  expect(
    await screen.findByLabelText("내 잔액"),
  ).toHaveTextContent("100");
  expect(
    screen.queryByText("상품 구매"),
  ).not.toBeInTheDocument();
});

it("preserves corrupt storage and allows retry after recovery", async () => {
  localStorage.setItem("bugri:mock:v1:learner", "broken");
  render(<CoinHistory userId="learner" />);
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("기존 데이터는 보존");
  expect(
    localStorage.getItem("bugri:mock:v1:learner"),
  ).toBe("broken");
  localStorage.removeItem("bugri:mock:v1:learner");
  fireEvent.click(
    screen.getByRole("button", { name: "다시 시도" }),
  );
  expect(
    await screen.findByLabelText("내 잔액"),
  ).toHaveTextContent("100");
});
