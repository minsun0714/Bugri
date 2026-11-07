import * as Zdog from "zdog";
import { model } from "@/components/shop/zdog/models";
import { roomTheme } from "@/components/shop/room-theme";

it.each(["background-1", "background-2"])(
  "%s thumbnail walls meet the floor corners without overhang",
  (id) => {
    const root = model(new Zdog.Anchor(), id);
    const { children } = root as unknown as Zdog.Anchor & {
      children: Zdog.Anchor[];
    };
    const [floor] = children as Zdog.Rect[];
    const theme = roomTheme(id);
    const corners = [-1, 1].flatMap((x) =>
      [-1, 1].map((y) =>
        new Zdog.Vector({
          x: (x * floor.width) / 2,
          y: (y * floor.height) / 2,
        })
          .rotate(floor.rotate)
          .add(floor.translate),
      ),
    );
    const walls = children.filter(
      (child): child is Zdog.Rect =>
        child instanceof Zdog.Rect &&
        [theme.wall, theme.side].includes(child.color),
    );
    expect(walls).toHaveLength(4);
    for (const wall of walls) {
      for (const sign of [-1, 1]) {
        const foot = new Zdog.Vector({
          x: (sign * wall.width) / 2,
          y: wall.height / 2,
        })
          .rotate(wall.rotate)
          .add(wall.translate);
        expect(
          corners.some(
            (corner) =>
              Math.hypot(
                foot.x - corner.x,
                foot.y - corner.y,
                foot.z - corner.z,
              ) < 0.001,
          ),
        ).toBe(true);
      }
    }
  },
);
