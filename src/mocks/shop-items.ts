import type { Product } from "@/api/contracts";

export const shopItems: readonly Product[] = [
  {
    productId: "keyboard-1",
    name: "새싹 키보드",
    description: "Mock 키보드",
    category: "KEYBOARD",
    price: 30,
  },
  {
    productId: "monitor-1",
    name: "집중 모니터",
    description: "Mock 모니터",
    category: "MONITOR",
    price: 80,
  },
  {
    productId: "desk-1",
    name: "원목 책상",
    description: "Mock 책상",
    category: "DESK",
    price: 150,
  },
  {
    productId: "accessory-1",
    name: "화분",
    description: "Mock 소품",
    category: "ACCESSORY",
    price: 10,
  },
  {
    productId: "background-1",
    name: "정원",
    description: "Mock 배경",
    category: "BACKGROUND",
    price: 50,
  },
];

/** Fixture only, not a product reward policy. */
export const initialBugCoin = 100;
