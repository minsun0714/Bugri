import type { Locator } from "@playwright/test";

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
