import { ProfileLinkKind } from "@/api/constants";
import { createApiClient } from "@/api/client";
import { createMockTransport } from "@/mocks/adapter";
import { storageKey } from "@/mocks/storage";

const api = (userId = "author") =>
  createApiClient(
    createMockTransport({ userId, storage: localStorage }),
  );

const about = {
  biography: "# 안녕하세요\n개발하는 사람입니다.",
  links: [
    {
      kind: ProfileLinkKind.GITHUB,
      url: "https://github.com/example",
    },
    {
      kind: ProfileLinkKind.OTHER,
      url: "https://example.com",
      label: "발표",
    },
  ],
};

beforeEach(() => localStorage.clear());

test("optional introduction is empty for legacy users and saved publicly with user isolation", async () => {
  await expect(
    api().request("profileAbout", {
      publicId: "bugri-author",
    }),
  ).resolves.toEqual({ biography: "", links: [] });

  await api().request("updateProfileAbout", about);

  await expect(
    api("friend").request("profileAbout", {
      publicId: "bugri-author",
    }),
  ).resolves.toEqual(about);

  await expect(
    api("friend").request("profileAbout", {
      publicId: "bugri-friend",
    }),
  ).resolves.toEqual({ biography: "", links: [] });

  await api().request("updateProfileAbout", {
    biography: "",
    links: [],
  });

  await expect(
    api().request("profileAbout", {
      publicId: "bugri-author",
    }),
  ).resolves.toEqual({ biography: "", links: [] });
});

test("invalid protocols, incomplete links and ownership injection never overwrite saved data", async () => {
  await api().request("updateProfileAbout", about);

  const before = localStorage.getItem(storageKey("author"));

  for (const request of [
    { ...about, publicId: "bugri-friend" },
    { ...about, biography: null },
    ...[
      "javascript:alert(1)",
      "data:text/html,test",
      "/relative",
      "https://",
      "https://name:pass@example.com",
      "",
    ].map((url) => ({
      ...about,
      links: [{ kind: ProfileLinkKind.GITHUB, url }],
    })),
    {
      ...about,
      links: [
        {
          kind: ProfileLinkKind.OTHER,
          url: "https://example.com",
          label: " ",
        },
      ],
    },
    {
      ...about,
      links: [
        { kind: "UNKNOWN", url: "https://example.com" },
      ],
    },
  ]) {
    await expect(
      api().request("updateProfileAbout", request as never),
    ).rejects.toMatchObject({ status: 400 });

    expect(localStorage.getItem(storageKey("author"))).toBe(
      before,
    );
  }
});

test("storage write failure preserves the previously published introduction", async () => {
  await api().request("updateProfileAbout", about);

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
    broken.request("updateProfileAbout", {
      biography: "new",
      links: [],
    }),
  ).rejects.toMatchObject({
    detail: { code: "STORAGE_UNAVAILABLE" },
  });

  await expect(
    api().request("profileAbout", {
      publicId: "bugri-author",
    }),
  ).resolves.toEqual(about);
});

test("GitHub username-in-host input explains the correct profile path", async () => {
  await expect(
    api().request("updateProfileAbout", {
      biography: "",
      links: [
        {
          kind: ProfileLinkKind.GITHUB,
          url: "https://minsun0714@github.com",
        },
      ],
    }),
  ).rejects.toMatchObject({
    message:
      "GitHub 프로필 주소는 https://github.com/사용자이름 형식으로 입력하세요.",
  });
});
