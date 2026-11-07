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
  const shop = render(<ShopApp />);
  const title = await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  const card = title.closest("article")!;
  expect(
    within(card).getByRole("button", {
      name: "장착해 보기",
    }),
  ).toBeInTheDocument();
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
  expect(
    within(card).queryByRole("button", {
      name: "장착해 보기",
    }),
  ).not.toBeInTheDocument();
  shop.unmount();
  render(<ShopApp editing />);
  fireEvent.click(
    await screen.findByRole("button", { name: "장착하기" }),
  );
  expect(
    await screen.findByRole("button", {
      name: "장착 해제",
    }),
  ).toBeInTheDocument();
  expect(
    within(
      screen
        .getByRole("heading", { name: "새싹 키보드" })
        .closest("article")!,
    ).getByText("장착 중"),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "장착 해제" }),
  );
  expect(
    await screen.findByRole("button", { name: "장착하기" }),
  ).toBeInTheDocument();
});

it("shows insufficient funds without changing the balance and isolates user inventories", async () => {
  const shop = render(<ShopApp />);
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
  shop.unmount();
  render(<ShopApp editing initialUser="friend" />);
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

it("searches, sorts and resets the product catalog", async () => {
  render(<ShopApp />);
  await screen.findByRole("heading", {
    name: "새싹 키보드",
  });

  const search = screen.getByLabelText("상품 검색");
  const catalogHeading = screen.getByRole("heading", {
    name: "상품 목록",
  });

  expect(catalogHeading.parentElement).toContainElement(
    search,
  );
  expect(catalogHeading.parentElement).toContainElement(
    screen.getByLabelText("상품 정렬"),
  );
  expect(
    screen.queryByText("15개의 오브젝트"),
  ).not.toBeInTheDocument();

  fireEvent.change(search, {
    target: { value: "타이머" },
  });
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(
    screen.getByRole("heading", { name: "집중 모니터" }),
  ).toBeInTheDocument();

  fireEvent.change(search, {
    target: { value: "모니터" },
  });
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(
    screen.queryByRole("heading", { name: "새싹 키보드" }),
  ).not.toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("combobox", { name: "상품 정렬" }),
  );
  fireEvent.click(
    screen.getByRole("option", { name: "가격 높은순" }),
  );
  expect(
    screen
      .getAllByRole("article")
      .map(
        (card) =>
          within(card).getByRole("heading", { level: 3 })
            .textContent,
      ),
  ).toEqual([
    "미드나잇 모니터",
    "집중 모니터",
    "스카이 모니터",
  ]);

  fireEvent.click(
    screen.getByRole("button", { name: "키보드" }),
  );
  expect(
    screen.getByText("검색 결과가 없어요"),
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "필터 초기화" }),
  );
  expect(screen.getAllByRole("article")).toHaveLength(15);
  expect(screen.getByLabelText("상품 검색")).toHaveValue(
    "",
  );
  expect(
    screen.getByRole("combobox", { name: "상품 정렬" }),
  ).toHaveTextContent("기본순");
});

it("replaces equipment in the same category while keeping both purchases", async () => {
  const shop = render(<ShopApp />);
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
  shop.unmount();
  render(<ShopApp editing />);
  await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
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

it("keeps product try-on in the shop without a separate desk editor entry", async () => {
  render(<ShopApp />);
  await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  const title = screen.getByRole("heading", {
    name: "상점",
    level: 1,
  });

  expect(title.parentElement).toContainElement(
    screen.getByLabelText("내 잔액"),
  );
  expect(
    screen.queryByText("내 BugCoin"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", {
      name: "내 데스크 꾸미기",
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", {
      name: "상품 이동",
    }),
  ).not.toBeInTheDocument();
});

it("shows the catalog directly without shop or inventory tabs", async () => {
  render(<ShopApp />);
  await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  expect(
    screen.queryByRole("button", { name: "상점" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "보관함" }),
  ).not.toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(15);
  expect(
    screen.queryByRole("heading", {
      name: "이웃의 데스크",
    }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: /이웃/ }),
  ).not.toBeInTheDocument();
});

it("keeps the personal desk inside its parent layout without duplicate page landmarks", async () => {
  render(
    <main>
      <ShopApp editing embedded initialUser="friend" />
    </main>,
  );
  expect(
    await screen.findByText("아직 보관한 상품이 없어요"),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("main")).toHaveLength(1);
  expect(
    screen.queryByRole("banner"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("contentinfo"),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("더미 사용자")).toHaveValue(
    "friend",
  );
});

it("follows the layout user when switching shop accounts", async () => {
  const shop = render(
    <ShopApp embedded initialUser="learner" />,
  );
  const title = await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  fireEvent.click(
    within(title.closest("article")!).getByRole("button", {
      name: "구매하기",
    }),
  );
  await screen.findByText("구매 완료 · 보관함에 담았어요.");
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("70");
  shop.rerender(<ShopApp embedded initialUser="friend" />);
  await screen.findByRole("heading", {
    name: "새싹 키보드",
  });
  expect(
    within(
      screen
        .getByRole("heading", { name: "새싹 키보드" })
        .closest("article")!,
    ).getByRole("button", { name: "구매하기" }),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("100");
  expect(
    screen.queryByText("구매 완료 · 보관함에 담았어요."),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText("더미 사용자"),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: "← Bugri 홈" }),
  ).not.toBeInTheDocument();
  shop.rerender(<ShopApp embedded initialUser="learner" />);
  expect(
    await screen.findByRole("button", { name: "보유 중" }),
  ).toBeDisabled();
  expect(
    screen.getByLabelText("내 잔액"),
  ).toHaveTextContent("70");
});
