import { Category } from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";

const make = (userId = "learner") =>
  createApiClient(
    createMockTransport({ userId, storage: localStorage }),
  );

const placement = {
  x: 0.4,
  y: 1.55,
  z: 0.2,
  rotationY: 45,
};

const request = {
  category: Category.KEYBOARD,
  productId: "keyboard-1",
  transform: placement,
};

async function owned() {
  const api = make();

  await api.request("purchase", {
    productId: "keyboard-1",
    requestKey: "3d-keyboard",
  });

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: "keyboard-1",
  });

  return api;
}

beforeEach(() => localStorage.clear());

test("saves spatial position and rotation, restores them publicly and isolates other users", async () => {
  const api = await owned();

  await api.request("transformEquipment", request);

  expect(
    (await make().request("inventory", {})).transforms
      .KEYBOARD,
  ).toEqual(placement);

  expect(
    (
      await make("friend").request("publicProfile", {
        publicId: "bugri-learner",
      })
    ).transforms.KEYBOARD,
  ).toEqual(placement);

  expect(
    (await make("friend").request("inventory", {}))
      .transforms,
  ).toEqual({});
});

test("rejects hovering, underground, rotated overhang, nonfinite values and unowned edits", async () => {
  const api = await owned();

  for (const transform of [
    { ...placement, y: -1 },
    { ...placement, y: 3 },
    { ...placement, x: 1.8, rotationY: 90 },
    { ...placement, z: NaN },
    { ...placement, rotationY: 360 },
  ])
    await expect(
      api.request("transformEquipment", {
        ...request,
        transform,
      }),
    ).rejects.toMatchObject({ status: 400 });

  await expect(
    make("friend").request("transformEquipment", request),
  ).rejects.toMatchObject({ status: 403 });

  expect(
    (await api.request("inventory", {})).transforms,
  ).toEqual({});
});

test("migrates a saved 2D layout without dropping purchases or equipment", async () => {
  const api = await owned();

  await api.request("moveEquipment", {
    category: Category.KEYBOARD,
    productId: "keyboard-1",
    position: { x: 30, y: -15 },
  });

  const state = JSON.parse(
    localStorage.getItem(storageKey("learner"))!,
  );

  delete state.transforms;

  localStorage.setItem(
    storageKey("learner"),
    JSON.stringify(state),
  );

  const inventory = await make().request("inventory", {});

  expect(inventory.products).toHaveLength(1);
  expect(inventory.equipment.KEYBOARD).toBe("keyboard-1");

  expect(inventory.transforms.KEYBOARD).toEqual({
    x: -0.15,
    y: 1.55,
    z: 0.5,
    rotationY: 0,
  });
});

test("preserves persisted 3D placement on write failure and clears only removed equipment", async () => {
  const api = await owned();

  await api.request("transformEquipment", request);

  const before = localStorage.getItem(
    storageKey("learner"),
  );

  const failing = createApiClient(
    createMockTransport({
      userId: "learner",
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: () => {
          throw new Error("quota");
        },
      },
    }),
  );

  await expect(
    failing.request("transformEquipment", {
      ...request,
      transform: { ...placement, rotationY: 90 },
    }),
  ).rejects.toMatchObject({ status: 503 });

  expect(localStorage.getItem(storageKey("learner"))).toBe(
    before,
  );

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: null,
  });

  expect(
    (await api.request("inventory", {})).transforms,
  ).toEqual({});
});
