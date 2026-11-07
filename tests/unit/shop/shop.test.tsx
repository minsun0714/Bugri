import "./mock-three";
import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { ShopApp } from "@/components/shop/shop-app";

beforeEach(() => localStorage.clear());

it("purchases once, updates balance, equips and unequips an owned product", async () => {
  render(<ShopApp />);
  const title = await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  const card = title.closest("article")!;
  fireEvent.click(
    within(card).getByRole("button", { name: "구매하기" }),
  );
  expect(
    await screen.findByText(
      "구매 완료 · 보관함에 담았어요.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("70");
  expect(
    within(card).getByRole("button", { name: "보유 중" }),
  ).toBeDisabled();
  fireEvent.click(
    screen.getByRole("button", { name: "보관함" }),
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "장착하기" }),
  );
  expect(
    await screen.findByRole("button", {
      name: "장착 해제",
    }),
  ).toBeInTheDocument();
  expect(
    within(card).getByText("장착 중"),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "장착 해제" }),
  );
  expect(
    await screen.findByRole("button", { name: "장착하기" }),
  ).toBeInTheDocument();
});

it("shows insufficient funds without changing the balance and isolates user inventories", async () => {
  render(<ShopApp />);
  const title = await screen.findByRole("heading", {
    name: "원목 책상",
  });
  fireEvent.click(
    within(title.closest("article")!).getByRole("button", {
      name: "구매하기",
    }),
  );
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("BugCoin");
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("100");
  fireEvent.change(screen.getByLabelText("더미 사용자"), {
    target: { value: "friend" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "보관함" }),
  );
  expect(
    await screen.findByText("아직 보관한 상품이 없어요"),
  ).toBeInTheDocument();
});

it("filters categories and preserves products after a failed purchase", async () => {
  render(<ShopApp />);
  await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  fireEvent.click(
    screen.getByRole("button", { name: "모니터" }),
  );
  expect(
    screen.getByRole("heading", { name: "집중 모니터" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "새싹 키보드" }),
  ).not.toBeInTheDocument();
});

it("replaces equipment in the same category while keeping both purchases", async () => {
  render(<ShopApp />);
  for (const name of ["새싹 키보드", "라벤더 키보드"]) {
    const title = await screen.findByRole("heading", {
      name,
    });
    const card = title.closest("article")!;
    fireEvent.click(
      within(card).getByRole("button", {
        name: "구매하기",
      }),
    );
    await within(card).findByRole("button", {
      name: "보유 중",
    });
  }
  fireEvent.click(
    screen.getByRole("button", { name: "보관함" }),
  );
  for (const name of ["새싹 키보드", "라벤더 키보드"]) {
    const card = screen
      .getByRole("heading", { name })
      .closest("article")!;
    fireEvent.click(
      within(card).getByRole("button", {
        name: "장착하기",
      }),
    );
    await within(card).findByRole("button", {
      name: "장착 해제",
    });
  }
  expect(
    within(
      screen
        .getByRole("heading", { name: "라벤더 키보드" })
        .closest("article")!,
    ).getByText("장착 중"),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(2);
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("25");
});

it("preserves the saved data and presents retry when storage is corrupted", async () => {
  localStorage.setItem("bugri:mock:v1:learner", "invalid");
  render(<ShopApp />);
  expect(
    await screen.findByRole("alert"),
  ).toHaveTextContent("저장된 데이터를 읽을 수 없어요");
  expect(
    screen.getByRole("button", {
      name: "다시 시도",
    }),
  ).toBeInTheDocument();
  expect(
    localStorage.getItem("bugri:mock:v1:learner"),
  ).toBe("invalid");
});

it("offers editing on my desk and product try-on entry points in the shop", async () => {
  const shop = render(<ShopApp />);
  await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  expect(
    screen.getByRole("link", { name: "내 데스크 꾸미기" }),
  ).toHaveAttribute("href", "/my?user=learner");
  expect(
    screen.queryByRole("button", {
      name: "상품 이동",
    }),
  ).not.toBeInTheDocument();
  shop.unmount();
  render(<ShopApp editing />);
  expect(
    await screen.findByRole("button", {
      name: "상품 이동",
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", {
      name: "상점에서 상품 구경하기",
    }),
  ).toHaveAttribute("href", "/shop?user=learner");
});
