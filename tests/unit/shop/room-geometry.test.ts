import * as Zdog from "zdog";
import {
  model,
  deskContactShadow,
} from "@/components/shop/zdog/models";
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

it("grounds each desk leg with a floor contact shadow through translation and rotation", () => {
  const parent = new Zdog.Anchor();
  const desk = model(parent, "desk-1");
  const shadow = deskContactShadow(parent);
  const { children: parts } = desk as unknown as {
    children: Zdog.Anchor[];
  };
  const legs = parts.slice(1);
  const { children: contacts } = shadow as unknown as {
    children: Zdog.Anchor[];
  };
  expect(contacts).toHaveLength(4);
  for (const angle of [0, Math.PI / 4, Math.PI / 2]) {
    legs.forEach((leg, index) => {
      const { children: boxes } = leg as unknown as {
        children: Zdog.Box[];
      };
      const [box] = boxes;
      const foot = new Zdog.Vector({
        x: leg.translate.x,
        y: leg.translate.y + box.height / 2,
        z: leg.translate.z,
      });
      const contact = contacts[index].translate.copy();
      foot
        .rotate({ y: angle })
        .add({ x: 170, y: 0, z: -80 });
      contact
        .rotate({ y: angle })
        .add({ x: 170, y: 0, z: -80 });
      expect(contact.x).toBeCloseTo(foot.x);
      expect(contact.y).toBe(0);
      expect(contact.z).toBeCloseTo(foot.z);
      const { children: rings } = contacts[
        index
      ] as unknown as { children: Zdog.Ellipse[] };
      expect(rings.length).toBeGreaterThan(0);
      for (const ring of rings) {
        expect(ring.backface).toBe(false);
        expect(ring.rotate.x).toBe(Math.PI / 2);
      }
    });
  }
});
