export function roomTheme(productId?: string) {
  if (productId === "background-2")
    return {
      backdrop:
        "linear-gradient(155deg, #292b49 0%, #414465 55%, #686687 100%)",
      floor: "#686687",
      wall: "#414465",
      side: "#353954",
      sky: "#242744",
      glow: "#f7dca4",
      rug: "#7b7496",
      light: "#858ed2",
      strength: 0.27,
    };
  if (productId === "background-1")
    return {
      backdrop:
        "linear-gradient(155deg, #dce7cc 0%, #edf1df 55%, #d7dfbf 100%)",
      floor: "#d7dfbf",
      wall: "#edf1df",
      side: "#dce7cc",
      sky: "#b6d7c3",
      glow: "#fff1ba",
      rug: "#e7e9cb",
      light: "#e3edbd",
      strength: 0.12,
    };
  return {
    backdrop: "linear-gradient(#f8f6ff, #f8f6ff)",
    floor: "#f8f6ff",
    wall: "#f8f6ff",
    side: "#f8f6ff",
    sky: "#f8f6ff",
    glow: "#ffffff",
    rug: "#f8f6ff",
    light: "#ffffff",
    strength: 0,
  };
}

export function roomLitColor(
  color: string,
  light: string,
  strength: number,
) {
  const normalize = (value: string) =>
    /^#[0-9a-f]{3}$/i.test(value)
      ? `#${value
          .slice(1)
          .split("")
          .map((part) => part + part)
          .join("")}`
      : value;
  const base = normalize(color);
  if (!strength || !/^#[0-9a-f]{6}$/i.test(base))
    return color;
  return `#${[1, 3, 5]
    .map((offset) =>
      Math.round(
        parseInt(base.slice(offset, offset + 2), 16) *
          (1 - strength) +
          parseInt(light.slice(offset, offset + 2), 16) *
            strength,
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
