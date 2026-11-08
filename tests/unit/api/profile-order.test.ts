import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";

const api = (userId = "author") =>
  createApiClient(
    createMockTransport({ userId, storage: localStorage }),
  );

const order = ["ACTIVITY", "QUIZZES", "DESK"];

beforeEach(() => localStorage.clear());

test("legacy default, public read-only lookup and isolated persistence", async () => {
  await expect(
    api().request("profileOrder", {
      publicId: "bugri-author",
    }),
  ).resolves.toEqual({
    order: ["DESK", "QUIZZES", "ACTIVITY"],
  });

  expect(localStorage.length).toBe(0);

  await api().request("updateProfileOrder", {
    order,
  } as never);

  const before = localStorage.getItem(storageKey("author"));

  await expect(
    api("friend").request("profileOrder", {
      publicId: "bugri-author",
    }),
  ).resolves.toEqual({ order });

  expect(localStorage.getItem(storageKey("author"))).toBe(
    before,
  );

  expect(
    localStorage.getItem(storageKey("friend")),
  ).toBeNull();

  await expect(
    api("friend").request("profileOrder", {
      publicId: "bugri-friend",
    }),
  ).resolves.toEqual({
    order: ["DESK", "QUIZZES", "ACTIVITY"],
  });
});

test("invalid permutations and ownership injection do not overwrite the published order", async () => {
  await api().request("updateProfileOrder", {
    order,
  } as never);

  const before = localStorage.getItem(storageKey("author"));

  for (const request of [
    { order: [] },
    { order: ["DESK", "DESK", "QUIZZES"] },
    { order: ["DESK", "QUIZZES", "UNKNOWN"] },
    { order, publicId: "bugri-friend" },
    { order: null },
  ]) {
    await expect(
      api().request("updateProfileOrder", request as never),
    ).rejects.toMatchObject({ status: 400 });

    expect(localStorage.getItem(storageKey("author"))).toBe(
      before,
    );
  }

  await expect(
    api().request("profileOrder", { publicId: "missing" }),
  ).rejects.toMatchObject({ status: 404 });
});

test("failed write preserves saved order", async () => {
  await api().request("updateProfileOrder", {
    order,
  } as never);

  const broken = createApiClient(
    createMockTransport({
      userId: "author",
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: () => {
          throw new Error("full");
        },
      },
    }),
  );

  await expect(
    broken.request("updateProfileOrder", {
      order: ["DESK", "QUIZZES", "ACTIVITY"],
    }),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_UNAVAILABLE" },
  });

  await expect(
    api().request("profileOrder", {
      publicId: "bugri-author",
    }),
  ).resolves.toEqual({ order });
});
