import { Category, type Product } from "@/api/contracts";

export const shopItems: readonly Product[] = [
  {
    productId: "keyboard-1",
    name: "새싹 키보드",
    description:
      "세이지 키캡과 크림 스페이스바. 새싹처럼 산뜻한 타이핑.",
    category: Category.KEYBOARD,
    price: 30,
  },
  {
    productId: "monitor-1",
    name: "집중 모니터",
    description:
      "밝은 타이머와 체크리스트로 차분하게 집중하는 화면.",
    category: Category.MONITOR,
    price: 80,
  },
  {
    productId: "desk-1",
    name: "원목 책상",
    description:
      "따뜻한 나뭇결과 작은 서랍이 있는 작업 테이블.",
    category: Category.DESK,
    price: 150,
  },
  {
    productId: "accessory-1",
    name: "화분",
    description: "테라코타 화분에서 자라는 작은 초록.",
    category: Category.ACCESSORY,
    price: 10,
  },
  {
    productId: "background-1",
    name: "정원",
    description:
      "아치 창으로 햇살과 푸른 언덕이 들어오는 방.",
    category: Category.BACKGROUND,
    price: 50,
  },
  {
    productId: "keyboard-2",
    name: "라벤더 키보드",
    description:
      "보랏빛 키캡에 크림 포인트를 더한 컴팩트 키보드.",
    category: Category.KEYBOARD,
    price: 45,
  },
  {
    productId: "monitor-2",
    name: "미드나잇 모니터",
    description:
      "짙은 프레임과 다채로운 코드 화면으로 완성하는 밤의 작업실.",
    category: Category.MONITOR,
    price: 95,
  },
  {
    productId: "desk-2",
    name: "크림 스튜디오 책상",
    description:
      "부드러운 크림 상판과 단정한 서랍의 작은 스튜디오.",
    category: Category.DESK,
    price: 120,
  },
  {
    productId: "accessory-2",
    name: "버섯 조명",
    description:
      "복숭앗빛 갓 아래 따뜻한 빛을 담은 테이블 조명.",
    category: Category.ACCESSORY,
    price: 25,
  },
  {
    productId: "background-2",
    name: "달빛 작업실",
    description:
      "둥근 달과 보랏빛 언덕이 보이는 고요한 아치 창.",
    category: Category.BACKGROUND,
    price: 60,
  },
];

/** Fixture only, not a product reward policy. */
export const initialBugCoin = 100;
