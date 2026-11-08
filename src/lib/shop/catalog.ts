import { Category, type Product } from "@/api/contracts";
import { Locale } from "@/lib/i18n/messages";

type ProductCopy = Pick<Product, "name" | "description">;

type CatalogItem = Pick<
  Product,
  "productId" | "category" | "price"
> & {
  readonly translations: Readonly<
    Record<Locale, ProductCopy>
  >;
};

/** Add each item and all supported languages together. IDs are persistent. */
export const productCatalog = [
  {
    productId: "keyboard-1",
    category: Category.KEYBOARD,
    price: 30,
    translations: {
      ko: {
        name: "새싹 키보드",
        description:
          "세이지 키캡과 크림 스페이스바. 새싹처럼 산뜻한 타이핑.",
      },
      en: {
        name: "Sprout keyboard",
        description:
          "Sage keycaps and a cream spacebar for a fresh typing experience.",
      },
    },
  },
  {
    productId: "monitor-1",
    category: Category.MONITOR,
    price: 80,
    translations: {
      ko: {
        name: "집중 모니터",
        description:
          "밝은 타이머와 체크리스트로 차분하게 집중하는 화면.",
      },
      en: {
        name: "Focus monitor",
        description:
          "A calm display with a bright timer and checklist to help you focus.",
      },
    },
  },
  {
    productId: "desk-1",
    category: Category.DESK,
    price: 150,
    translations: {
      ko: {
        name: "원목 책상",
        description:
          "따뜻한 나뭇결과 작은 서랍이 있는 작업 테이블.",
      },
      en: {
        name: "Wooden desk",
        description:
          "A warm wood-grain work table with a small drawer.",
      },
    },
  },
  {
    productId: "accessory-1",
    category: Category.ACCESSORY,
    price: 10,
    translations: {
      ko: {
        name: "화분",
        description: "테라코타 화분에서 자라는 작은 초록.",
      },
      en: {
        name: "Plant",
        description:
          "A little greenery growing in a terracotta pot.",
      },
    },
  },
  {
    productId: "background-1",
    category: Category.BACKGROUND,
    price: 50,
    translations: {
      ko: {
        name: "정원",
        description:
          "아치 창으로 햇살과 푸른 언덕이 들어오는 방.",
      },
      en: {
        name: "Garden",
        description:
          "A sunlit room with green hills beyond an arched window.",
      },
    },
  },
  {
    productId: "keyboard-2",
    category: Category.KEYBOARD,
    price: 45,
    translations: {
      ko: {
        name: "라벤더 키보드",
        description:
          "보랏빛 키캡에 크림 포인트를 더한 컴팩트 키보드.",
      },
      en: {
        name: "Lavender keyboard",
        description:
          "A compact keyboard with lavender keycaps and cream accents.",
      },
    },
  },
  {
    productId: "monitor-2",
    category: Category.MONITOR,
    price: 95,
    translations: {
      ko: {
        name: "미드나잇 모니터",
        description:
          "짙은 프레임과 다채로운 코드 화면으로 완성하는 밤의 작업실.",
      },
      en: {
        name: "Midnight monitor",
        description:
          "A dark frame and colorful code display for your nighttime workspace.",
      },
    },
  },
  {
    productId: "desk-2",
    category: Category.DESK,
    price: 120,
    translations: {
      ko: {
        name: "크림 스튜디오 책상",
        description:
          "부드러운 크림 상판과 단정한 서랍의 작은 스튜디오.",
      },
      en: {
        name: "Cream studio desk",
        description:
          "A small studio desk with a soft cream top and tidy drawers.",
      },
    },
  },
  {
    productId: "accessory-2",
    category: Category.ACCESSORY,
    price: 25,
    translations: {
      ko: {
        name: "버섯 조명",
        description:
          "복숭앗빛 갓 아래 따뜻한 빛을 담은 테이블 조명.",
      },
      en: {
        name: "Mushroom lamp",
        description:
          "A table lamp with a warm glow beneath a peach-colored shade.",
      },
    },
  },
  {
    productId: "background-2",
    category: Category.BACKGROUND,
    price: 60,
    translations: {
      ko: {
        name: "달빛 작업실",
        description:
          "둥근 달과 보랏빛 언덕이 보이는 고요한 아치 창.",
      },
      en: {
        name: "Moonlit studio",
        description:
          "A quiet arched window overlooking the moon and purple hills.",
      },
    },
  },
  {
    productId: "keyboard-3",
    category: Category.KEYBOARD,
    price: 20,
    translations: {
      ko: {
        name: "오션 키보드",
        description:
          "청록 본체와 밝은 키캡이 어우러진 산뜻한 키보드.",
      },
      en: {
        name: "Ocean keyboard",
        description:
          "A fresh keyboard pairing a teal body with light keycaps.",
      },
    },
  },
  {
    productId: "monitor-3",
    category: Category.MONITOR,
    price: 25,
    translations: {
      ko: {
        name: "스카이 모니터",
        description:
          "하늘색 프레임에 밝은 작업 화면을 담은 모니터.",
      },
      en: {
        name: "Sky monitor",
        description:
          "A sky-blue frame surrounding a bright workspace display.",
      },
    },
  },
  {
    productId: "desk-3",
    category: Category.DESK,
    price: 30,
    translations: {
      ko: {
        name: "민트 책상",
        description:
          "연한 민트 상판과 차분한 초록 다리의 작업 테이블.",
      },
      en: {
        name: "Mint desk",
        description:
          "A work table with a pale mint top and muted green legs.",
      },
    },
  },
  {
    productId: "accessory-3",
    category: Category.ACCESSORY,
    price: 5,
    translations: {
      ko: {
        name: "블루 화분",
        description:
          "푸른 화분과 초록 잎으로 꾸미는 작은 정원.",
      },
      en: {
        name: "Blue plant",
        description:
          "A miniature garden of green leaves in a blue pot.",
      },
    },
  },
  {
    productId: "background-3",
    category: Category.BACKGROUND,
    price: 20,
    translations: {
      ko: {
        name: "노을 작업실",
        description:
          "살구색 벽과 주황빛 하늘이 감싸는 따뜻한 작업실.",
      },
      en: {
        name: "Sunset studio",
        description:
          "A warm workspace surrounded by apricot walls and an orange sky.",
      },
    },
  },
] as const satisfies readonly CatalogItem[];

const catalogById = new Map<string, CatalogItem>(
  productCatalog.map((item) => [item.productId, item]),
);

/** Only presentation text changes; API prices, identity and categories stay authoritative. */
export function localizeProduct(
  product: Product,
  locale: Locale,
): Product {
  const item = catalogById.get(product.productId);
  return item
    ? { ...product, ...item.translations[locale] }
    : product;
}

export function productNames(
  locale: Locale,
): Record<string, string> {
  return Object.fromEntries(
    productCatalog.map(({ productId, translations }) => [
      productId,
      translations[locale].name,
    ]),
  );
}
