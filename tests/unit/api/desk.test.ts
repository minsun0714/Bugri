import { Category } from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { initialState, storageKey } from "@/mocks/storage";

const make = (userId = "learner", storage = localStorage) =>
  createApiClient(createMockTransport({ userId, storage }));

const move = {
  category: Category.KEYBOARD,
  productId: "keyboard-1",
  position: { x: 30, y: -15 },
};

async function equipped() {
  const api = make();

  await api.request("purchase", {
    productId: "keyboard-1",
    requestKey: "desk-keyboard",
  });

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: "keyboard-1",
  });

  return api;
}

beforeEach(() => localStorage.clear());

test("position survives reload, is shared publicly and stays isolated from other users", async () => {
  const api = await equipped();

  await api.request("moveEquipment", move);

  expect(
    (await make().request("inventory", {})).positions,
  ).toEqual({ KEYBOARD: move.position });

  expect(
    (
      await make("friend").request("publicProfile", {
        publicId: "bugri-learner",
      })
    ).positions,
  ).toEqual({ KEYBOARD: move.position });

  expect(
    (await make("friend").request("inventory", {}))
      .positions,
  ).toEqual({});
});

test("rejects unowned, unequipped, mismatched and out-of-bounds moves without modifying storage", async () => {
  await expect(
    make("friend").request("moveEquipment", move),
  ).rejects.toMatchObject({ status: 403 });

  const api = await equipped();

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  for (const request of [
    { ...move, position: { x: 10000, y: 0 } },
    { ...move, position: { x: 0, y: Infinity } },
    { ...move, category: Category.BACKGROUND },
    { ...move, productId: "keyboard-2" },
  ]) {
    await expect(
      api.request("moveEquipment", request),
    ).rejects.toBeDefined();

    expect(
      localStorage.getItem(storageKey("learner")),
    ).toBe(before);
  }

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: null,
  });

  await expect(
    api.request("moveEquipment", move),
  ).rejects.toMatchObject({ status: 403 });
});

test("changing or removing equipment resets only its placement", async () => {
  const api = await equipped();

  await api.request("moveEquipment", move);

  await api.request("purchase", {
    productId: "keyboard-2",
    requestKey: "second-keyboard",
  });

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: "keyboard-2",
  });

  expect(
    (await api.request("inventory", {})).positions,
  ).toEqual({});

  await api.request("moveEquipment", {
    ...move,
    productId: "keyboard-2",
  });

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: null,
  });

  expect(
    (await api.request("inventory", {})).positions,
  ).toEqual({});
});

test("legacy snapshots without positions retain purchases and equipment", async () => {
  await equipped();

  const saved = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  delete saved.positions;

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(saved),
  );

  const inventory = await make().request("inventory", {});

  expect(inventory.positions).toEqual({});
  expect(inventory.equipment.KEYBOARD).toBe("keyboard-1");
  expect(inventory.products).toHaveLength(1);
});

test("failed position writes preserve the last saved placement", async () => {
  const api = await equipped();

  await api.request("moveEquipment", move);

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  const storage = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: () => {
      throw new Error("quota");
    },
  };

  const failing = createApiClient(
    createMockTransport({ userId: "learner", storage }),
  );

  await expect(
    failing.request("moveEquipment", {
      ...move,
      position: { x: 60, y: 0 },
    }),
  ).rejects.toMatchObject({ status: 503 });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    before,
  );
});

test("corrupt positions are reported without resetting the saved snapshot", async () => {
  const state = {
    ...initialState("learner"),
    positions: { KEYBOARD: { x: "bad", y: 0 } },
  };

  const raw = JSON.stringify(state);

  localStorage.setItem(storageKey("learner"), raw);

  await expect(
    make().request("inventory", {}),
  ).rejects.toMatchObject({ status: 409 });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    raw,
  );
});
