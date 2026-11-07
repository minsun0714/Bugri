import { ProductLayout } from "@/components/navigation/product-layout";
import { HomeSections } from "@/components/navigation/home-sections";

export default function Home() {
  return (
    <ProductLayout>
      <HomeSections />
      <a
        href="/shop"
        className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm text-white"
      >
        BugCoin 상점 둘러보기 →
      </a>
    </ProductLayout>
  );
}
