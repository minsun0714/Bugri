import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { CoinHistoryContent } from "@/components/coins/coin-history";
import { walletKey } from "@/components/coins/queries";
import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
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
  expect(
    screen.queryByRole("navigation", {
      name: "페이지 이동",
    }),
  ).not.toBeInTheDocument();
  expect(screen.getByRole("listitem")).toHaveTextContent(
    "+7",
  );
});

it("paginates newest first without changing balance and resets when user changes", async () => {
  browserApi.mockResolvedValue({
    request: jest.fn().mockResolvedValue({
      balance: 231,
      ledger: Array.from({ length: 21 }, (_, index) => ({
        id: String(index),
        amount: index + 1,
        reason: "DAILY_COMPLETION",
        reference: String(index),
        createdAt: "2026-11-07T01:00:00Z",
      })),
    }),
  });
  const view = render(<CoinHistory userId="learner" />);
  await screen.findByLabelText("내 잔액");
  expect(screen.getAllByRole("listitem")).toHaveLength(10);
  expect(
    screen.getAllByRole("listitem")[0],
  ).toHaveTextContent("+21");
  expect(
    screen.getByRole("button", { name: "이전 페이지" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "다음 페이지" }),
  );
  expect(
    screen.getAllByRole("listitem")[0],
  ).toHaveTextContent("+11");
  fireEvent.click(
    screen.getByRole("button", { name: "다음 페이지" }),
  );
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(
    screen.getByRole("button", { name: "다음 페이지" }),
  ).toBeDisabled();
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("231");
  fireEvent.click(
    screen.getByRole("button", { name: "이전 페이지" }),
  );
  expect(screen.getAllByRole("listitem")).toHaveLength(10);
  view.rerender(<CoinHistory userId="friend" />);
  await screen.findByLabelText("내 잔액");
  expect(
    screen.getAllByRole("listitem")[0],
  ).toHaveTextContent("+21");
  expect(
    screen.getByRole("button", { name: "이전 페이지" }),
  ).toBeDisabled();
});

it("clamps the current page when refreshed history shrinks", async () => {
  const wallet = {
    balance: 21,
    ledger: Array.from({ length: 21 }, (_, index) => ({
      id: String(index),
      amount: 1,
      reason: "DAILY_COMPLETION",
      reference: String(index),
      createdAt: "2026-11-07T01:00:00Z",
    })),
  };
  browserApi.mockResolvedValue({
    request: jest.fn().mockResolvedValue(wallet),
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <CoinHistoryContent userId="learner" />
    </QueryClientProvider>,
  );
  await screen.findByLabelText("내 잔액");
  fireEvent.click(
    screen.getByRole("button", { name: "다음 페이지" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "다음 페이지" }),
  );
  await act(async () => {
    client.setQueryData(walletKey("learner"), {
      balance: 11,
      ledger: wallet.ledger.slice(0, 11),
    });
  });
  expect(
    await screen.findByText("2 / 2 페이지"),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(
    screen.getByRole("button", { name: "다음 페이지" }),
  ).toBeDisabled();
});
