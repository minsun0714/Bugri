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

test("rejects underground, nonfinite values and unowned edits", async () => {
  const api = await owned();

  for (const transform of [
    { ...placement, y: -1 },
    { ...placement, y: Infinity },
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

test("saves and restores lavender keyboard outside the table without changing its height", async () => {
  const api = make();

  await api.request("purchase", {
    productId: "keyboard-2",
    requestKey: "free-lavender",
  });

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: "keyboard-2",
  });

  const transform = {
    x: 6.25,
    y: 1.55,
    z: -4.5,
    rotationY: 90,
  };

  await api.request("transformEquipment", {
    category: Category.KEYBOARD,
    productId: "keyboard-2",
    transform,
  });

  expect(
    (await make().request("inventory", {})).transforms
      .KEYBOARD,
  ).toEqual(transform);

  expect(
    (
      await make("friend").request("publicProfile", {
        publicId: "bugri-learner",
      })
    ).transforms.KEYBOARD,
  ).toEqual(transform);
});

test("persists floor, intermediate and raised heights without resetting x/z or rotation", async () => {
  const api = await owned();

  for (const y of [0, 0.7, 2.4, 5]) {
    const transform = { ...placement, x: 3, y };

    await api.request("transformEquipment", {
      ...request,
      transform,
    });

    expect(
      (await make().request("inventory", {})).transforms
        .KEYBOARD,
    ).toEqual(transform);

    expect(
      (
        await make("friend").request("publicProfile", {
          publicId: "bugri-learner",
        })
      ).transforms.KEYBOARD,
    ).toEqual(transform);
  }
});

test("moves the resident Bugri without a purchase and restores only that user's placement", async () => {
  const api = make();
  const transform = { x: -1, y: 0, z: 2, rotationY: 90 };

  await api.request("transformBugri", { transform });

  expect(
    (await make().request("inventory", {})).transforms,
  ).toMatchObject({ BUGRI: transform });

  expect(
    (await make("friend").request("inventory", {}))
      .transforms,
  ).toEqual({});

  expect(
    (
      await make("friend").request("publicProfile", {
        publicId: "bugri-learner",
      })
    ).transforms,
  ).toMatchObject({ BUGRI: transform });

  expect((await api.request("wallet", {})).balance).toBe(
    100,
  );

  expect(
    (await api.request("inventory", {})).products,
  ).toEqual([]);
});

test("rejects invalid Bugri transforms without losing its saved placement", async () => {
  const api = make();
  const transform = { x: -1, y: 0, z: 2, rotationY: 90 };

  await api.request("transformBugri", { transform });

  for (const invalid of [
    { ...transform, y: -1 },
    { ...transform, x: Infinity },
    { ...transform, rotationY: 360 },
  ]) {
    await expect(
      api.request("transformBugri", { transform: invalid }),
    ).rejects.toMatchObject({ status: 400 });
  }

  expect(
    (await make().request("inventory", {})).transforms
      .BUGRI,
  ).toEqual(transform);
});

test("persists validated object order separately from transforms and isolates users", async () => {
  const api = make();
  const order = [Category.DESK, "BUGRI" as const];

  await api.request("reorderDesk", { order });

  expect(
    (await make().request("inventory", {})).order,
  ).toEqual(order);

  expect(
    (await make("friend").request("inventory", {})).order,
  ).toEqual([]);

  expect(
    (
      await make("friend").request("publicProfile", {
        publicId: "bugri-learner",
      })
    ).order,
  ).toEqual(order);

  expect(
    (await api.request("inventory", {})).transforms,
  ).toEqual({});

  for (const invalid of [
    [Category.DESK],
    [Category.DESK, Category.DESK],
    [Category.KEYBOARD, "BUGRI" as const],
  ])
    await expect(
      api.request("reorderDesk", { order: invalid }),
    ).rejects.toMatchObject({ status: 400 });

  expect(
    (await api.request("inventory", {})).order,
  ).toEqual(order);

  await api.request("purchase", {
    productId: "keyboard-1",
    requestKey: "layer-keyboard",
  });

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: "keyboard-1",
  });

  expect(
    (await api.request("inventory", {})).order,
  ).toEqual([...order, Category.KEYBOARD]);

  await api.request("equip", {
    category: Category.KEYBOARD,
    productId: null,
  });

  expect(
    (await api.request("inventory", {})).order,
  ).toEqual(order);
});

test("moving the default desk independently preserves items and Bugri through public reload", async () => {
  const api = await owned();
  const transform = { x: 2, y: 0, z: 1, rotationY: 90 };

  await api.request("transformDesk", {
    productId: null,
    transform,
  });

  const { transforms } = await make().request(
    "inventory",
    {},
  );

  expect(transforms.DESK).toEqual(transform);

  // Inverse desk frame keeps the original world placement and orientation.
  expect(transforms.KEYBOARD).toEqual({
    x: 0.35,
    y: 1.55,
    z: -2.45,
    rotationY: 270,
  });

  expect(transforms.BUGRI).toEqual({
    x: -0.8,
    y: 0,
    z: -4.3,
    rotationY: 270,
  });

  expect(
    (
      await make("friend").request("publicProfile", {
        publicId: "bugri-learner",
      })
    ).transforms,
  ).toEqual(transforms);

  expect(
    (await make("friend").request("inventory", {}))
      .transforms,
  ).toEqual({});
});

test("independent desk edits reject invalid or stale desks and fail atomically", async () => {
  const api = await owned();
  const before = await api.request("inventory", {});

  await expect(
    api.request("transformDesk", {
      productId: null,
      transform: { x: 0, y: 1, z: 0, rotationY: 0 },
    }),
  ).rejects.toMatchObject({ status: 400 });

  await expect(
    api.request("transformDesk", {
      productId: "desk-1",
      transform: { x: 1, y: 0, z: 0, rotationY: 0 },
    }),
  ).rejects.toMatchObject({ status: 403 });

  const broken = createApiClient(
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
    broken.request("transformDesk", {
      productId: null,
      transform: { x: 1, y: 0, z: 0, rotationY: 0 },
    }),
  ).rejects.toMatchObject({ status: 503 });

  expect(await api.request("inventory", {})).toEqual(
    before,
  );
});

test("an owned desk moves independently and a stale default desk request cannot change it", async () => {
  const api = await owned();

  await api.request("purchase", {
    productId: "desk-3",
    requestKey: "independent-desk",
  });

  await api.request("equip", {
    category: Category.DESK,
    productId: "desk-3",
  });

  await api.request("transformDesk", {
    productId: "desk-3",
    transform: { x: 2, y: 0, z: 1, rotationY: 90 },
  });

  await api.request("transformDesk", {
    productId: "desk-3",
    transform: { x: 0, y: 0, z: 0, rotationY: 0 },
  });

  const { transforms } = await api.request("inventory", {});

  expect(transforms.KEYBOARD).toEqual({
    x: -0.45,
    y: 1.55,
    z: 0.65,
    rotationY: 0,
  });

  expect(transforms.BUGRI).toEqual({
    x: -2.3,
    y: 0,
    z: 1.8,
    rotationY: 0,
  });

  await expect(
    api.request("transformDesk", {
      productId: null,
      transform: { x: 1, y: 0, z: 0, rotationY: 0 },
    }),
  ).rejects.toMatchObject({ status: 403 });

  expect(
    (await api.request("inventory", {})).transforms,
  ).toEqual(transforms);
});
