import { createApiClient } from "@/api/client";
import { Category } from "@/api/constants";
import { createMockTransport } from "@/mocks/adapter";

beforeEach(() => localStorage.clear());

test("each category adds one product and the full new set can be purchased, equipped and restored", async () => {
  const make = (userId = "learner") =>
    createApiClient(
      createMockTransport({
        userId,
        storage: localStorage,
      }),
    );

  const api = make();
  const products = await api.request("products", {});

  expect(products).toHaveLength(15);

  const added = products.filter(({ productId }) =>
    productId.endsWith("-3"),
  );

  expect(added).toHaveLength(5);

  expect(
    added.reduce((sum, { price }) => sum + price, 0),
  ).toBe(100);

  for (const category of Object.values(Category)) {
    expect(
      products.filter(
        (product) => product.category === category,
      ),
    ).toHaveLength(3);

    const product = added.find(
      (product) => product.category === category,
    )!;

    await api.request("purchase", {
      productId: product.productId,
      requestKey: `extra-${product.productId}`,
    });

    await api.request("equip", {
      category,
      productId: product.productId,
    });
  }

  const restored = await make().request("inventory", {});

  expect(restored.products).toHaveLength(5);

  expect(Object.values(restored.equipment).sort()).toEqual(
    added.map(({ productId }) => productId).sort(),
  );

  expect((await make().request("wallet", {})).balance).toBe(
    0,
  );

  const profile = await make("friend").request(
    "publicProfile",
    { publicId: "bugri-learner" },
  );

  expect(profile.equipment).toEqual(restored.equipment);

  expect(
    (await make("friend").request("inventory", {}))
      .products,
  ).toHaveLength(0);
});
