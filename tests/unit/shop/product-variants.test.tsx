import * as Zdog from "zdog";
import { render, screen } from "@testing-library/react";
import {
  ProductArtwork,
  artworkNames,
} from "@/components/shop/artwork";
import { model } from "@/components/shop/zdog/models";

const ids = [
  "keyboard-3",
  "monitor-3",
  "desk-3",
  "accessory-3",
  "background-3",
];

it.each(ids)(
  "renders %s through Canvas and the accessible SVG fallback",
  (productId) => {
    const first = model(
      new Zdog.Anchor(),
      productId.replace("-3", "-1"),
    );
    const variant = model(new Zdog.Anchor(), productId);
    const colors = (root: Zdog.Anchor) => {
      const result: string[] = [];
      const visit = (node: Zdog.Anchor) => {
        if (node instanceof Zdog.Shape)
          result.push(node.color);
        const { children } = node as Zdog.Anchor & {
          children: Zdog.Anchor[];
        };
        children.forEach(visit);
      };
      visit(root);
      return result;
    };
    expect(colors(variant).length).toBeGreaterThan(0);
    expect(colors(variant)).not.toEqual(colors(first));
    const { container } = render(
      <ProductArtwork
        productId={productId}
        name={artworkNames[productId]}
      />,
    );
    expect(
      screen.getByRole("img", {
        name: artworkNames[productId],
      }),
    ).toBeInTheDocument();
    expect(
      container.querySelector("path, rect, circle"),
    ).not.toBeNull();
    if (productId === "accessory-3")
      expect(colors(variant)).toContain("#88ac68");
  },
);
