import type { Locator, Page } from "@playwright/test";

/** Use a visible product pixel, never an assumed Canvas centre or test-only hit box. */
export async function productPoint(
  canvas: Locator,
  color: [number, number, number] = [168, 195, 168],
) {
  await canvas.scrollIntoViewIfNeeded();
  const point = await canvas.evaluate((element, rgb) => {
    const c = element as HTMLCanvasElement;
    const context = c.getContext("2d");
    if (!context) throw new Error("Canvas missing");
    const { data } = context.getImageData(
      0,
      0,
      c.width,
      c.height,
    );
    const pixels: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      if (
        rgb.every(
          (value, channel) => data[i + channel] === value,
        ) &&
        data[i + 3] === 255
      )
        pixels.push(i / 4);
    }
    if (!pixels.length)
      throw new Error("Product has no visible pixels");
    const pixel = pixels[Math.floor(pixels.length / 2)];
    return {
      x: (pixel % c.width) / c.width,
      y: Math.floor(pixel / c.width) / c.height,
    };
  }, color);
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not visible");
  return {
    x: box.x + point.x * box.width,
    y: box.y + point.y * box.height,
  };
}

export async function rotationOf(scope: Page | Locator) {
  const value = await scope
    .getByLabel("선택 상품 배치")
    .innerText();
  const match = value.match(/회전 ([\d.]+)°/);
  if (!match) throw new Error("Rotation output missing");
  return Number(match[1]);
}

export async function rotateTo(
  scope: Page | Locator,
  name: string,
  angle: number,
) {
  const current = await rotationOf(scope);
  const steps = ((angle - current + 360) % 360) / 15;
  if (!Number.isInteger(steps))
    throw new Error(
      "Use the pointer handle for non-step angles",
    );
  const selection = scope.getByRole("button", {
    name: `${name} 선택`,
    exact: true,
  });
  for (let i = 0; i < steps; i++)
    await selection.press("Alt+ArrowRight");
}
