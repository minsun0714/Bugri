type ScreenMark =
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }
  | {
      kind: "circle";
      x: number;
      y: number;
      diameter: number;
      color: string;
    };

function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): ScreenMark {
  return { kind: "rect", x, y, width, height, color };
}

function circle(
  x: number,
  y: number,
  diameter: number,
  color: string,
): ScreenMark {
  return { kind: "circle", x, y, diameter, color };
}

// Shared face artwork keeps Canvas models and SVG fallbacks identical.
export function monitorScreen(
  night: boolean,
): ScreenMark[] {
  return night
    ? [
        rect(0, 0, 150, 80, "#182039"),
        rect(0, -34, 150, 12, "#303c5a"),
        circle(-65, -34, 4, "#f18c9e"),
        circle(-57, -34, 4, "#f3cf87"),
        circle(-49, -34, 4, "#8bd5be"),
        rect(-55, 6, 40, 68, "#222c48"),
        rect(-56, -17, 23, 3, "#8d9bc0"),
        rect(-52, -8, 22, 3, "#64769c"),
        rect(-52, 1, 22, 3, "#64769c"),
        rect(-52, 10, 22, 3, "#64769c"),
        rect(-9, -18, 28, 4, "#bd9af7"),
        rect(22, -18, 21, 4, "#8bd5be"),
        rect(1, -8, 34, 4, "#8bbef1"),
        rect(38, -8, 28, 4, "#f3cf87"),
        rect(12, 2, 40, 4, "#8bd5be"),
        rect(4, 12, 40, 4, "#f18c9e"),
        rect(41, 12, 22, 4, "#bd9af7"),
        rect(-9, 22, 28, 4, "#bd9af7"),
        rect(0, 37, 150, 6, "#5960ad"),
      ]
    : [
        rect(0, 0, 150, 80, "#f4f1e8"),
        rect(0, -34, 150, 12, "#d6e3ce"),
        circle(-64, -34, 4, "#6a906e"),
        rect(-39, -34, 31, 3, "#6a906e"),
        circle(-35, 3, 47, "#82aa89"),
        circle(-35, 3, 37, "#f4f1e8"),
        rect(-35, -3, 3, 15, "#426d58"),
        rect(-28, 3, 16, 3, "#426d58"),
        rect(-35, 32, 29, 4, "#82aa89"),
        rect(34, 4, 62, 54, "#ffffff"),
        rect(32, -16, 40, 4, "#426d58"),
        rect(13, -3, 6, 6, "#82aa89"),
        rect(39, -3, 32, 3, "#9baa9a"),
        rect(13, 8, 6, 6, "#82aa89"),
        rect(36, 8, 26, 3, "#9baa9a"),
        rect(13, 19, 6, 6, "#e4c58d"),
        rect(39, 19, 32, 3, "#c2c8ba"),
      ];
}
