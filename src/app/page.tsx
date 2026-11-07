import { ProductLayout } from "@/components/navigation/product-layout";
import { HomeSections } from "@/components/navigation/home-sections";

export default function Home() {
  return (
    <ProductLayout>
      <HomeSections />
      <div className="mx-auto w-full max-w-3xl">
        <a
          href="/shop"
          className="mt-5 inline-flex min-h-11 items-center rounded text-sm text-muted underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
        >
          BugCoin 상점 둘러보기 →
        </a>
      </div>
    </ProductLayout>
  );
}
