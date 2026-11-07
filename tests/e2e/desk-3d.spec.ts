import { expect, test, type Page } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";

async function equipped(page: Page) {
  await page.goto("/shop");
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "새싹 키보드",
      exact: true,
    }),
  });
  await card
    .getByRole("button", { name: "구매하기" })
    .click();
  await page
    .getByRole("button", { name: "보관함", exact: true })
    .click();
  await page
    .getByRole("button", { name: "장착하기" })
    .click();
  await page
    .getByRole("button", { name: "새싹 키보드 선택" })
    .click();
  const canvas = page.locator(
    '#desk [data-renderer="webgl"] canvas',
  );
  await expect(canvas).toBeVisible();
  await canvas.scrollIntoViewIfNeeded();
  return canvas;
}

async function topProjection(page: Page) {
  await page
    .getByRole("button", { name: "위에서", exact: true })
    .click();
  const canvas = page.locator(
    '#desk [data-renderer="webgl"] canvas',
  );
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("3D canvas is not visible");
  const camera = new PerspectiveCamera(
    38,
    box.width / box.height,
    0.1,
    50,
  );
  camera.position.set(0, 9, 0.05);
  camera.lookAt(0, 1.1, 0);
  camera.updateMatrixWorld();
  return (x: number, y: number, z: number) => {
    const point = new Vector3(x, y, z).project(camera);
    return {
      x: box.x + ((point.x + 1) * box.width) / 2,
      y: box.y + ((1 - point.y) * box.height) / 2,
    };
  };
}

test("WebGL camera orbit, surface drag, rotation ring and public restoration", async ({
  page,
}) => {
  const canvas = await equipped(page);
  await page
    .getByRole("button", { name: "시점 회전", exact: true })
    .click();
  await page
    .getByRole("button", { name: "45도 시점", exact: true })
    .click();
  await expect(page.getByLabel("카메라 방위각")).toHaveText(
    "45°",
  );
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing canvas");
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 60,
    box.y + 45,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(
    page.getByLabel("카메라 방위각"),
  ).not.toHaveText("45°");
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).toContainText("회전 0°");

  await page
    .getByRole("button", { name: "상품 이동", exact: true })
    .click();
  let project = await topProjection(page);
  const start = project(-0.9, 1.69, 0.65);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 30, start.y - 15, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toBeVisible();
  await expect(
    page.getByLabel("선택 상품 배치"),
  ).not.toContainText("X -0.45");
  const location = await page
    .getByLabel("선택 상품 배치")
    .innerText();
  const x = Number(location.match(/X (-?[\d.]+)/)![1]);
  const z = Number(location.match(/Z (-?[\d.]+)/)![1]);

  await page
    .getByRole("button", { name: "상품 회전", exact: true })
    .click();
  project = await topProjection(page);
  // TransformControls' ring size is proportional to camera distance; hit the real Y-ring.
  const radius =
    (new Vector3(0, 9, 0.05).distanceTo(
      new Vector3(x, 1.55, z),
    ) *
      1.9 *
      Math.tan((38 * Math.PI) / 360) *
      0.8) /
    8;
  const ring = project(x + radius, 1.55, z);
  const end = project(
    x + radius * 0.5,
    1.55,
    z - radius * 0.86,
  );
  await page.mouse.move(ring.x, ring.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 10 });
  await page.mouse.up();
  await expect(
    page.getByRole("slider", { name: "아이템 회전" }),
  ).not.toHaveValue("0");
  await expect(
    page.getByText("3D 배치를 저장했어요."),
  ).toBeVisible();
  const rotation = await page
    .getByRole("slider", { name: "아이템 회전" })
    .inputValue();
  await page.reload();
  await page
    .getByRole("button", { name: "새싹 키보드 선택" })
    .click();
  await expect(
    page.getByRole("slider", { name: "아이템 회전" }),
  ).toHaveValue(rotation);
  await page.goto("/users/bugri-learner");
  const profile = page.getByRole("main");
  await expect(
    profile.locator('[data-renderer="webgl"] canvas'),
  ).toBeVisible();
  await expect(
    profile.getByLabel("3D 배치 정보"),
  ).toContainText(`회전 ${rotation}°`);
  await expect(
    profile.getByRole("button", {
      name: "상품 회전",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("touch moves on the tabletop, cancel restores, rotation slider saves on mobile", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    await equipped(page);
    const project = await topProjection(page);
    const point = project(-0.9, 1.69, 0.65);
    const cdp = await context.newCDPSession(page);
    for (const end of [
      "touchCancel",
      "touchEnd",
    ] as const) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [point],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: point.x + 20, y: point.y - 10 }],
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: end,
        touchPoints: [],
      });
      if (end === "touchCancel")
        await expect(
          page.getByLabel("선택 상품 배치"),
        ).toContainText("X -0.45");
    }
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).not.toContainText("X -0.45");
    await page
      .getByRole("slider", { name: "아이템 회전" })
      .fill("45");
    await page
      .getByRole("button", {
        name: "배치 저장",
        exact: true,
      })
      .tap();
    await expect(
      page.getByText("3D 배치를 저장했어요."),
    ).toBeVisible();
    await page.reload();
    await page
      .getByRole("button", { name: "새싹 키보드 선택" })
      .tap();
    await expect(
      page.getByRole("slider", { name: "아이템 회전" }),
    ).toHaveValue("45");
    await expect(
      page.getByLabel("선택 상품 배치"),
    ).toContainText("Y 1.55");
  } finally {
    await context.close();
  }
});
