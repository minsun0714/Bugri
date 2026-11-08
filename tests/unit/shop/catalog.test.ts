import { Locale } from "@/lib/i18n/messages";
import {
  localizeProduct,
  productCatalog,
  productNames,
} from "@/lib/shop/catalog";
import { shopItems } from "@/mocks/shop-items";

it("has unique IDs and complete copy for every supported language", () => {
  expect(
    new Set(
      productCatalog.map(({ productId }) => productId),
    ).size,
  ).toBe(productCatalog.length);
  for (const locale of Object.values(Locale)) {
    for (const product of shopItems) {
      const localized = localizeProduct(product, locale);
      expect(localized.name.trim()).not.toBe("");
      expect(localized.description.trim()).not.toBe("");
      expect(productNames(locale)[product.productId]).toBe(
        localized.name,
      );
      if (locale === Locale.EN) {
        expect(
          localized.name + localized.description,
        ).not.toMatch(/[가-힣]/);
      }
    }
  }
});

it("preserves API metadata and does not mutate the product or cache", () => {
  const [seed] = shopItems;
  const product = Object.freeze({ ...seed, price: 999 });
  const localized = localizeProduct(product, Locale.EN);
  expect(localized).toMatchObject({
    productId: seed.productId,
    price: 999,
    category: seed.category,
  });
  expect(product.name).toBe("새싹 키보드");
  expect(localizeProduct(localized, Locale.KO)).toEqual(
    product,
  );
  const unknown = {
    ...product,
    productId: "future-item",
    name: "Server item",
  };
  expect(localizeProduct(unknown, Locale.EN)).toEqual(
    unknown,
  );
});
