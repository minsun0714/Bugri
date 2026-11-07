import { render, screen } from "@testing-library/react";
import { CoinHistory } from "@/components/coins/coin-history";
import { createBrowserApi } from "@/api/browser";

jest.mock("@/api/browser", () => ({
  createBrowserApi: jest.fn(),
}));
const browserApi = jest.mocked(createBrowserApi);

it("shows loading without inventing a zero balance", () => {
  browserApi.mockImplementation(
    () => new Promise(() => {}),
  );
  render(<CoinHistory userId="learner" />);
  expect(screen.getByRole("status")).toHaveTextContent(
    "불러오는 중",
  );
  expect(
    screen.queryByLabelText("내 잔액"),
  ).not.toBeInTheDocument();
});

it("renders an empty ledger and a legitimate zero balance", async () => {
  browserApi.mockResolvedValue({
    request: jest
      .fn()
      .mockResolvedValue({ balance: 0, ledger: [] }),
  });
  render(<CoinHistory userId="learner" />);
  expect(
    await screen.findByText(
      "아직 지급·사용 내역이 없어요.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("0");
});

it("renders a daily reward distinctly from demo credit", async () => {
  browserApi.mockResolvedValue({
    request: jest.fn().mockResolvedValue({
      balance: 7,
      ledger: [
        {
          id: "reward",
          amount: 7,
          reason: "DAILY_COMPLETION",
          reference: "2026-11-07",
          createdAt: "2026-11-07T01:00:00Z",
        },
      ],
    }),
  });
  render(<CoinHistory userId="learner" />);
  expect(
    await screen.findByText("일일 학습 보상"),
  ).toBeInTheDocument();
  expect(screen.getByRole("listitem")).toHaveTextContent(
    "+7",
  );
});
