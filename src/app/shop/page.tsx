import Link from "next/link";
import { ShopApp } from "@/components/shop/shop-app";

export default function ShopPage() {
  return (
    <>
      <div className="bg-lime px-5 py-3 text-center text-sm">
        <Link
          href="/shop/zdog"
          className="font-bold text-foreground underline"
        >
          새 입체 데스크 시제품 체험하기 →
        </Link>
      </div>
      <ShopApp />
    </>
  );
}
