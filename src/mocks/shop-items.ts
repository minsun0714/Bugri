import type { Product } from "@/api/contracts";
import { productCatalog } from "@/lib/shop/catalog";

export const shopItems: readonly Product[] =
  productCatalog.map(
    ({ productId, category, price, translations }) => ({
      productId,
      category,
      price,
      ...translations.ko,
    }),
  );

/** Fixture only, not a product reward policy. */
export const initialBugCoin = 100;
