import { monitorScreen } from "@/components/shop/monitor-screen";
import { useId, type ReactNode } from "react";
import { Category } from "@/api/constants";
import type { DeskPositions } from "@/api/contracts";
import type { MovableCategory } from "@/lib/desk-layout";
import type { Equipment } from "@/api/contracts";

/** Original vector artwork. Shared scene coordinates keep thumbnails and equipment identical. */
export const artworkNames: Record<string, string> = {
  "keyboard-1": "새싹 키보드",
  "keyboard-2": "라벤더 키보드",
  "monitor-1": "집중 모니터",
  "monitor-2": "미드나잇 모니터",
  "desk-1": "원목 책상",
  "desk-2": "크림 스튜디오 책상",
  "accessory-1": "화분",
  "accessory-2": "버섯 조명",
  "background-1": "정원",
  "background-2": "달빛 작업실",
};

function Keyboard({
  violet = false,
}: {
  violet?: boolean;
}) {
  return (
    <g transform="translate(208 246) skewX(-18) scale(1 .66)">
      <rect
        x="0"
        y="8"
        width="178"
        height="79"
        rx="12"
        fill={violet ? "#8065b7" : "#7c9a79"}
      />
      <rect
        width="178"
        height="78"
        rx="12"
        fill={violet ? "#cbb9ef" : "#cbe1bd"}
      />
      <rect
        x="7"
        y="7"
        width="164"
        height="61"
        rx="7"
        fill={violet ? "#ae95d6" : "#a3bf98"}
      />
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => (
          <g
            key={`${row}-${col}`}
            transform={`translate(${11 + col * 13} ${11 + row * 13})`}
          >
            <rect
              y="2"
              width="10"
              height="10"
              rx="2"
              fill="#7f826b"
              opacity=".3"
            />
            <rect
              width="10"
              height="9"
              rx="2"
              fill={
                col === 0 || col === 11
                  ? violet
                    ? "#8262bf"
                    : "#7fa468"
                  : "#fffcef"
              }
            />
            <path
              d="M3 3h3"
              stroke={
                col === 0 || col === 11 ? "#fff" : "#b3b6a4"
              }
              strokeWidth=".7"
            />
          </g>
        )),
      )}
      <rect
        x="48"
        y="50"
        width="65"
        height="10"
        rx="2"
        fill="#fffcef"
      />
    </g>
  );
}

function Monitor({ night = false }: { night?: boolean }) {
  return (
    <g>
      <ellipse
        cx="301"
        cy="244"
        rx="57"
        ry="10"
        fill="#29243d"
        opacity=".08"
      />
      <path
        d="M291 187h22l7 48h-38z"
        fill={night ? "#55516c" : "#b5adc9"}
      />
      <rect
        x="265"
        y="232"
        width="77"
        height="9"
        rx="5"
        fill={night ? "#514a65" : "#d9d1e8"}
      />
      <rect
        x="201"
        y="93"
        width="210"
        height="132"
        rx="13"
        fill={night ? "#39334d" : "#c2b6d9"}
      />
      <rect
        x="199"
        y="88"
        width="210"
        height="131"
        rx="12"
        fill={night ? "#514961" : "#e8dff5"}
      />
      <svg
        x="207"
        y="96"
        width="194"
        height="110"
        viewBox="-75 -40 150 80"
        preserveAspectRatio="none"
      >
        {monitorScreen(night).map((mark, index) => {
          const { x, y, color } = mark;
          if (mark.kind === "circle") {
            const { diameter } = mark;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={diameter / 2}
                fill={color}
              />
            );
          }
          const { width, height } = mark;
          return (
            <rect
              key={index}
              x={x - width / 2}
              y={y - height / 2}
              width={width}
              height={height}
              fill={color}
            />
          );
        })}
      </svg>
      <circle cx="304" cy="212" r="2" fill="#9c8eb5" />
    </g>
  );
}

function Desk({
  cream = false,
  base = false,
}: {
  cream?: boolean;
  base?: boolean;
}) {
  const top = base
    ? "#e7e0ed"
    : cream
      ? "#f6eddb"
      : "#dcb690";
  const side = base
    ? "#cbc1d8"
    : cream
      ? "#ddd0bb"
      : "#b58a65";
  return (
    <g>
      <ellipse
        cx="301"
        cy="345"
        rx="225"
        ry="25"
        fill="#39304b"
        opacity=".08"
      />
      <path
        d="M114 266h15v80h-15zm355 0h15v80h-15z"
        fill={side}
      />
      <path
        d="M139 240h11v72h-11zm303 0h11v72h-11z"
        fill={side}
      />
      <path
        d="M90 260h420v15q0 6-8 6H98q-8 0-8-6z"
        fill={side}
      />
      <path
        d="M128 209h344q7 0 11 7l27 44q3 8-7 8H97q-10 0-7-8l28-44q4-7 10-7"
        fill={top}
      />
      {!base && !cream && (
        <g stroke="#b48962" opacity=".35" fill="none">
          <path d="M129 228q90-8 170 0t173 0M116 246q120-7 211 0t164 0M152 218h74m110 38h120" />
        </g>
      )}
      <rect
        x="371"
        y="279"
        width="74"
        height="35"
        rx="4"
        fill={side}
      />
      <path
        d="M397 290h21"
        stroke={top}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Accessory({ lamp = false }: { lamp?: boolean }) {
  return lamp ? (
    <g>
      <ellipse
        cx="448"
        cy="244"
        rx="31"
        ry="7"
        fill="#39243d"
        opacity=".1"
      />
      <ellipse
        cx="448"
        cy="238"
        rx="22"
        ry="7"
        fill="#ce9a71"
      />
      <path
        d="M442 184h12l6 51q-12 7-24 0z"
        fill="#f5ddba"
      />
      <path
        d="M412 186q1-37 36-37t36 37q-36 13-72 0"
        fill="#f19b7f"
      />
      <ellipse
        cx="448"
        cy="186"
        rx="36"
        ry="8"
        fill="#ffd8a6"
      />
      <path
        d="M423 172q5-13 18-15"
        stroke="#ffd3bd"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  ) : (
    <g>
      <ellipse
        cx="448"
        cy="244"
        rx="26"
        ry="7"
        fill="#39243d"
        opacity=".1"
      />
      <path
        d="M448 218v-67m0 38-22-19m22 29 21-20"
        stroke="#5b805c"
        strokeWidth="4"
        fill="none"
      />
      <ellipse
        cx="435"
        cy="164"
        rx="10"
        ry="22"
        transform="rotate(-38 435 164)"
        fill="#92b983"
      />
      <ellipse
        cx="461"
        cy="158"
        rx="10"
        ry="21"
        transform="rotate(35 461 158)"
        fill="#739b6d"
      />
      <ellipse
        cx="469"
        cy="183"
        rx="15"
        ry="8"
        transform="rotate(-30 469 183)"
        fill="#aac78c"
      />
      <ellipse
        cx="429"
        cy="184"
        rx="16"
        ry="8"
        transform="rotate(30 429 184)"
        fill="#82a875"
      />
      <path
        d="M425 210h46l-5 29q-18 10-36 0z"
        fill="#e1aa8c"
      />
      <path
        d="M430 213h10l3 30q-7-1-13-4z"
        fill="#edc0a0"
      />
      <ellipse
        cx="448"
        cy="210"
        rx="23"
        ry="6"
        fill="#f1c6a9"
      />
      <ellipse
        cx="448"
        cy="210"
        rx="17"
        ry="3"
        fill="#846b55"
      />
    </g>
  );
}

function Background({
  night = false,
  id,
}: {
  night?: boolean;
  id: string;
}) {
  return (
    <g>
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor={night ? "#342c57" : "#d7e8d3"} />
          <stop
            offset="1"
            stopColor={night ? "#8474aa" : "#faf3df"}
          />
        </linearGradient>
      </defs>
      <rect
        x="25"
        y="15"
        width="550"
        height="340"
        rx="28"
        fill={night ? "#e1daed" : "#eee9dc"}
      />
      <path
        d="M25 294h550v33q0 28-28 28H53q-28 0-28-28z"
        fill={night ? "#d3c9e3" : "#dfd9c7"}
      />
      <rect
        x="110"
        y="43"
        width="200"
        height="153"
        rx="73"
        fill="#fff9ee"
      />
      <path
        d="M120 186v-65a90 69 0 0 1 180 0v65z"
        fill={`url(#${id})`}
      />
      <circle
        cx={night ? 249 : 160}
        cy="105"
        r="21"
        fill={night ? "#fff1bf" : "#fff7cd"}
      />
      <path
        d="M120 161q40-35 90-5t90-8v38H120z"
        fill={night ? "#665b93" : "#a8c5a0"}
      />
      <path
        d="M120 178q50-32 98-5t82-10v23H120z"
        fill={night ? "#514775" : "#7fa88b"}
      />
      <path
        d="M210 55v132m-90-54h180"
        stroke="#fff9ee"
        strokeWidth="6"
      />
      <path
        d="M100 192h220"
        stroke="#d0c4b8"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect
        x="405"
        y="68"
        width="65"
        height="79"
        rx="4"
        fill="#fff9ee"
        transform="rotate(6 437 107)"
      />
      <circle
        cx="438"
        cy="104"
        r="18"
        fill={night ? "#b5a3d4" : "#c5d6ac"}
      />
      <path
        d="m423 120 17-26 13 26"
        fill={night ? "#776292" : "#829e76"}
      />
    </g>
  );
}

function Item({ productId }: { productId: string }) {
  switch (productId) {
    case "keyboard-1":
    case "keyboard-2":
      return (
        <Keyboard violet={productId === "keyboard-2"} />
      );
    case "monitor-1":
    case "monitor-2":
      return <Monitor night={productId === "monitor-2"} />;
    case "desk-1":
    case "desk-2":
      return <Desk cream={productId === "desk-2"} />;
    case "accessory-1":
    case "accessory-2":
      return (
        <Accessory lamp={productId === "accessory-2"} />
      );
    default:
      return null;
  }
}

const crops: Record<string, string> = {
  keyboard: "170 210 240 125",
  monitor: "175 65 260 205",
  desk: "55 175 490 200",
  accessory: "393 130 110 130",
  background: "15 5 570 360",
};

export function ProductArtwork({
  productId,
  name,
}: {
  productId: string;
  name: string;
}) {
  const id = useId();
  const [category] = productId.split("-");
  return (
    <svg
      role="img"
      aria-label={name}
      viewBox={crops[category] ?? "0 0 600 380"}
      className="h-full w-full overflow-visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      {category === "background" ? (
        <Background
          id={id}
          night={productId === "background-2"}
        />
      ) : (
        <Item productId={productId} />
      )}
    </svg>
  );
}

export function DeskScene({
  equipment,
  label = "내 데스크",
  positions = {},
  renderItem,
}: {
  equipment: Equipment;
  label?: string;
  positions?: DeskPositions;
  renderItem?: (
    category: MovableCategory,
    productId: string,
    children: ReactNode,
  ) => ReactNode;
}) {
  const id = useId();
  const names = Object.values(equipment).map(
    (value) => artworkNames[value] ?? "알 수 없는 상품",
  );
  const item = (category: MovableCategory) => {
    const productId = equipment[category];
    if (!productId) return null;
    const children = <Item productId={productId} />;
    if (renderItem)
      return renderItem(category, productId, children);
    const { x = 0, y = 0 } = positions[category] ?? {};
    return (
      <g
        key={category}
        data-product-id={productId}
        transform={`translate(${x} ${y})`}
      >
        {children}
      </g>
    );
  };
  return (
    <svg
      role={renderItem ? "group" : "img"}
      aria-label={`${label} · ${names.join(", ") || "기본 데스크"}`}
      viewBox="0 0 600 380"
      className={
        renderItem
          ? "h-full w-full touch-none select-none"
          : "h-full w-full"
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      {equipment.BACKGROUND ? (
        <Background
          id={id}
          night={equipment.BACKGROUND === "background-2"}
        />
      ) : (
        <rect
          x="25"
          y="15"
          width="550"
          height="340"
          rx="28"
          fill="#eee8f5"
        />
      )}
      {equipment.DESK ? item(Category.DESK) : <Desk base />}
      {item(Category.MONITOR)}
      {item(Category.KEYBOARD)}
      {item(Category.ACCESSORY)}
    </svg>
  );
}
